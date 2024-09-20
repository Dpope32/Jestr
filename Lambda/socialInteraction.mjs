import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";


// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = [
    'sendMessage', 'getMessages', 'getConversations',
    'postComment', 'updateCommentReaction', 'getComments', 'sendNotification'
];

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

              case 'postComment': {
                const { memeID, text, email, username, profilePic, parentCommentID = null } = requestBody;
                if (!memeID || !text || !email || !username || !profilePic) {
                  return createResponse(400, 'Missing required fields for posting a comment.');
                }
              
                const commentID = uuidv4();
                const commentTimestamp = new Date().toISOString();
                const putCommentParams = {
                  TableName: 'Comments',
                  Item: {
                    MemeID: memeID,
                    CommentID: commentID,
                    Text: text,
                    ProfilePicUrl: profilePic,
                    Username: username,
                    Timestamp: commentTimestamp,
                    LikesCount: 0,
                    DislikesCount: 0,
                    ParentCommentID: parentCommentID
                  },
                };
              
              //   console.log("Attempting to post comment:", putCommentParams);
              
                const updateCommentCountParams = {
                  TableName: 'Memes',
                  Key: { MemeID: memeID },
                  UpdateExpression: 'SET CommentCount = if_not_exists(CommentCount, :zero) + :inc',
                  ExpressionAttributeValues: {
                    ':inc': 1,
                    ':zero': 0
                  },
                  ReturnValues: "UPDATED_NEW"
                };
              
                try {
                  // Post the comment
                  const result = await docClient.send(new PutCommand(putCommentParams));
                //  console.log("Comment posted successfully, result:", result);
              
                  // Update the comment count
                  const updateResult = await docClient.send(new UpdateCommand(updateCommentCountParams));
                //   console.log("Comment count updated successfully, result:", updateResult);
              
                  return createResponse(200, 'Comment posted and comment count updated successfully.');
                } catch (error) {
                  console.error('Error posting comment or updating comment count:', error);
                  return createResponse(500, 'Failed to post comment or update comment count.');
                }
              }
              case 'updateCommentReaction': {
                const { commentID, memeID, incrementLikes, incrementDislikes } = requestBody;
              
                let updateExpression = 'SET ';
                const expressionAttributeValues = {};
                if (incrementLikes) {
                  updateExpression += 'LikesCount = LikesCount + :inc';
                  expressionAttributeValues[':inc'] = 1;
                }
                if (incrementDislikes) {
                  updateExpression += (incrementLikes ? ', ' : '') + 'DislikesCount = DislikesCount + :dec';
                  expressionAttributeValues[':dec'] = 1;
                }
              
                const updateCommentParams = {
                  TableName: 'Comments',
                  Key: { MemeID: memeID, CommentID: commentID },
                  UpdateExpression: updateExpression,
                  ExpressionAttributeValues: expressionAttributeValues,
                  ReturnValues: "UPDATED_NEW"
                };
              
                try {
                  await docClient.send(new UpdateCommand(updateCommentParams));
                  return createResponse(200, 'Comment updated successfully.');
                } catch (error) {
                  console.error('Error updating comment:', error);
                  return createResponse(500, 'Failed to update comment.');
                }
              }
              case 'getComments': {
                const { memeID } = requestBody;
                const queryParams = {
                  TableName: 'Comments',
                  KeyConditionExpression: 'MemeID = :memeID',
                  ExpressionAttributeValues: { ':memeID': memeID },
                  ScanIndexForward: false // if you have sort key setup and want latest comments first
                };
              
              //  console.log("Querying comments with params:", queryParams);
              
                try {
                  const { Items } = await docClient.send(new QueryCommand(queryParams));
                  return createResponse(200, 'Comments retrieved successfully.', Items);
                } catch (error) {
                  console.error(`Error  ${error}`);
                  return createResponse(500, 'Failed to retrieve comments.');
                }
              }
              case 'sendNotification': {
                const { memeID, catchUser, fromUser, type, message } = requestBody;
                if (!memeID || !catchUser || !fromUser || !type || !message) {
                  return createResponse(400, 'memeID, catchUser, fromUser, type, and message are required for sending a notification.');
                }
                try {
                  const notificationID = uuidv4();
                  const timestamp = new Date().toISOString();
                  const notificationParams = {
                    TableName: 'Notis',
                    Item: {
                      MemeID: memeID,
                      CatchUser: catchUser,
                      FromUser: fromUser,
                      NotificationID: notificationID,
                      Type: type,
                      Message: message,
                      Seen: false,
                      Timestamp: timestamp
                    }
                  };
                  await docClient.send(new PutCommand(notificationParams));
                  return createResponse(200, 'Notification sent successfully.', { notificationID });
                } catch (error) {
                  console.error(`Error sending notification: ${error}`);
                  return createResponse(500, 'Failed to send notification.');
                }
              }
            default:
                return createResponse(400, `Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Unexpected error in Lambda:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message });
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
