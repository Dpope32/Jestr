import { DynamoDBClient, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, BatchWriteCommand, PutCommand, UpdateCommand, BatchGetCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";


// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

const BUCKET_NAME = 'jestr-meme-uploads';
const MEMES_FOLDER = 'Memes/';

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = [
    'sendMessage', 'getMessages', 'updateProfileImage', 'getConversations', 'shareMeme',
    'postComment', 'updateCommentReaction', 'getComments', 'fetchLikedMemes', 'fetchDownloadedMemes',
    'fetchViewHistory', 'sendNotification'
];

function generateAccessToken() {
    return crypto.randomBytes(32).toString('hex');
  }

//**********************************************************************////////
// HELPER FUNCTIONS //
//**********************************************************************************//////

 // Function to send a message
const sendMessage = async (senderID, receiverID, content) => {
    const messageID = uuidv4();
    const timestamp = new Date().toISOString();
    const conversationID = [senderID, receiverID].sort().join('#');
    try {
      // 1. Insert message into Messages table
      const messageParams = {
        TableName: 'Messages',
        Item: {
          MessageID: messageID,
          SenderID: senderID,
          ReceiverID: receiverID,
          Content: content,
          Timestamp: timestamp,
          Status: 'sent',
          ConversationID: conversationID
        },
      };
      await docClient.send(new PutCommand(messageParams));
  
      // 2. Update or create Conversations table entry
      const conversationParams = {
        TableName: 'Conversations',
        Key: { ConversationID: conversationID },
        UpdateExpression: 'SET LastMessageID = :messageID, LastUpdated = :timestamp',
        ExpressionAttributeValues: {
          ':messageID': messageID,
          ':timestamp': timestamp
        },
        ReturnValues: 'ALL_NEW'
      };
      await docClient.send(new UpdateCommand(conversationParams));
  
      // 3. Update or create UserConversations table entry for sender
      const updateSenderConversationParams = {
        TableName: 'UserConversations',
        Key: {
          UserID: senderID
        },
        UpdateExpression: 'SET LastReadMessageID = :messageID, UnreadCount = :unreadCount, ConversationID = :conversationID',
        ExpressionAttributeValues: {
          ':messageID': messageID,
          ':unreadCount': 0,
          ':conversationID': conversationID
        },
        ReturnValues: 'ALL_NEW'
      };
      await docClient.send(new UpdateCommand(updateSenderConversationParams));
  
      // 4. Update or create UserConversations table entry for receiver
      const updateReceiverConversationParams = {
        TableName: 'UserConversations',
        Key: {
          UserID: receiverID
        },
        UpdateExpression: 'SET UnreadCount = if_not_exists(UnreadCount, :zero) + :inc, LastReadMessageID = if_not_exists(LastReadMessageID, :nullValue), ConversationID = :conversationID',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':nullValue': null,
          ':conversationID': conversationID
        },
        ReturnValues: 'ALL_NEW'
      };
      await docClient.send(new UpdateCommand(updateReceiverConversationParams));
  
    //  console.log('Message sent successfully');
      return { success: true, messageID: messageID, conversationID: conversationID };
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.code === 'ResourceNotFoundException') {
        console.error('One or more required tables do not exist.');
      } else if (error.code === 'AccessDeniedException') {
        console.error('Insufficient permissions to perform the operation.');
      } else {
        console.error('An unexpected error occurred:', error);
      }
      throw error;
    }
  };
  
  // Function to get messages
const getMessages = async (userID, conversationID) => {
const queryParams = {
    TableName: 'Messages',
    IndexName: 'ConversationID-Timestamp-index', // Assuming you have a GSI on ConversationID and Timestamp
    KeyConditionExpression: 'ConversationID = :conversationID',
    ExpressionAttributeValues: {
    ':conversationID': conversationID,
    },
    ScanIndexForward: false, // to get the latest messages first
};

try {
    const { Items } = await docClient.send(new QueryCommand(queryParams));
    return Items;
} catch (error) {
    console.error('Error getting messages:', error);
    throw error;
}
}; 

const uploadToS3 = async (base64Data, key, contentType, bucketName) => {
    if (typeof key !== 'string') {
      console.error('Invalid key type:', typeof key);
      throw new Error('Invalid key type for S3 upload');
    }
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, 'base64');
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };
    try {
      const command = new PutObjectCommand(params);
      const result = await s3Client.send(command);
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error in uploadToS3:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  };

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        let requestBody;
        if (event.body) {
            requestBody = JSON.parse(event.body);
        } else if (event.operation) {
            requestBody = event;
        } else {
            return createResponse(400, 'No valid request body or operation found');
        }

        const { operation } = requestBody;

        let verifiedUser = null;

        if (!publicOperations.includes(operation)) {
            const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];

            if (!token) {
                return createResponse(401, 'No token provided');
            }

            try {
                const payload = await verifier.verify(token);
                verifiedUser = payload;
            } catch (error) {
                console.error('Token verification failed:', error);
                return createResponse(401, 'Invalid token');
            }
        }

        switch (operation) {
            case 'sendMessage': {
                const { senderID, receiverID, content } = requestBody;
                if (!senderID || !receiverID || !content) {
                  return createResponse(400, 'senderID, receiverID, and content are required for sending a message.');
                }
                try {
                  const result = await sendMessage(senderID, receiverID, content);
                  return createResponse(200, 'Message sent successfully.', result);
                } catch (error) {
                  console.error(`Error sending message: ${error}`);
                  return createResponse(500, 'Failed to send message.');
                }
              }
              case 'getMessages': {
                const { userID, conversationID } = requestBody;
                if (!userID || !conversationID) {
                  return createResponse(400, 'userID and conversationID are required for getting messages.');
                }
                try {
                  const messages = await getMessages(userID, conversationID);
                  return createResponse(200, 'Messages retrieved successfully.', messages);
                } catch (error) {
              console.error(`Error getting message: ${error}`);
                  return createResponse(500, 'Failed to get messages.');
                }
              }
              case 'getConversations': {
                const { userID } = requestBody;
                  if (!userID) {
                    return createResponse(400, 'userID is required for fetching conversations.');
                  }
              
                try {
                // Query for conversations where userID is the primary key
                const primaryConversationsParams = {
                  TableName: 'UserConversations',
                  KeyConditionExpression: 'UserID = :userID',
                  ExpressionAttributeValues: {
                    ':userID': userID
                  }
                };
                const primaryConversations = await docClient.send(new QueryCommand(primaryConversationsParams));
              
                // Scan for conversations where userID is part of the ConversationID but not the primary key
                const secondaryConversationsParams = {
                  TableName: 'UserConversations',
                  FilterExpression: 'contains(ConversationID, :userID) AND NOT begins_with(UserID, :userID)',
                  ExpressionAttributeValues: {
                    ':userID': userID
                  }
                };
                const secondaryConversations = await docClient.send(new ScanCommand(secondaryConversationsParams));
              
                // Combine both primary and secondary conversations
                const allConversationsItems = [...primaryConversations.Items, ...secondaryConversations.Items];
              
                // Use a Set to track unique conversation IDs
                const uniqueConversationIds = new Set();
                const uniqueConversations = [];
              
                for (const item of allConversationsItems) {
                  if (!uniqueConversationIds.has(item.ConversationID)) {
                    uniqueConversationIds.add(item.ConversationID);
                    uniqueConversations.push(item);
                  }
                }
              
                // Fetch additional details for each unique conversation
                const conversationsWithDetails = await Promise.all(uniqueConversations.map(async (item) => {
                  const conversationID = item.ConversationID;
              
                  // Fetch the last message
                  const messageParams = {
                    TableName: 'Messages',
                    IndexName: 'ConversationID-Timestamp-index',
                    KeyConditionExpression: 'ConversationID = :conversationID',
                    ExpressionAttributeValues: {
                      ':conversationID': conversationID
                    },
                    ScanIndexForward: false,
                    Limit: 1
                  };
                  const { Items: messages } = await docClient.send(new QueryCommand(messageParams));
                  const lastMessage = messages.length > 0 ? messages[0] : { Content: null, Timestamp: null };
              
                  // Fetch partner user details
                  const partnerUserID = conversationID.split('#').find(id => id !== userID);
                  const userParams = {
                    TableName: 'Profiles',
                    Key: { email: partnerUserID }
                  };
                  const profileResponse = await docClient.send(new GetCommand(userParams));
                  const partnerUserDetails = profileResponse.Item || { username: null, profilePic: null };
              
                  return {
                    ...item,
                    lastMessage,
                    partnerUser: {
                      email: partnerUserID,
                      username: partnerUserDetails.username,
                      profilePic: partnerUserDetails.profilePic
                    }
                  };
                }));
                  return createResponse(200, 'Conversations retrieved successfully.', { conversations: conversationsWithDetails });
                  } catch (error) {
                    console.error('Error fetching conversations:', error);
                  return createResponse(500, 'Failed to fetch conversations.');
                }
              }
              case 'shareMeme': {
                const { memeID, email, username, catchUser, message } = requestBody;
                if (!memeID || !email || !username || !catchUser) {
                  return createResponse(400, 'MemeID, email, username, and catchUser are required for sharing a meme.');
                }
                try {
                  const shareType = 'general';
                  await recordShare(memeID, email, shareType, username, catchUser, message);
                  return createResponse(200, 'Meme shared successfully and message sent.');
                } catch (error) {
                  console.error(`Error sharing meme: ${error}`);
                  return createResponse(500, 'Failed to share meme or send message.');
                }
                }
            case 'updateUserProfile':
                // Implementation here
                break;
            case 'getTotalUsers':
                // Implementation here
                break;
            case 'getUserGrowthRate':
                // Implementation here
                break;
            case 'getDAU':
                // Implementation here
                break;
            case 'addFollow':
                // Implementation here
                break;
            case 'removeFollow':
                // Implementation here
                break;
            case 'getFollowing':
                // Implementation here
                break;
            case 'getFollowers':
                // Implementation here
                break;
            case 'checkFollowStatus':
                // Implementation here
                break;
            case 'getAllUsers':
                // Implementation here
                break;
            case 'batchCheckStatus':
                // Implementation here
                break;
            default:
                return createResponse(400, `Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Unexpected error in Lambda:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message });
    }
};

const getUser = async (identifier) => {
    const getParams = {
        TableName: 'Profiles',
        Key: { email: identifier },
    };
    try {
        const { Item } = await docClient.send(new GetCommand(getParams));
        return Item;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

const createResponse = (statusCode, message, data = null) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({ message, data }),
});
