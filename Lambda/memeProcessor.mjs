// memeProcessor.mjs
// shareMeme, getPresignedUrl, uploadMeme, getUserMemes
// must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from "uuid";
// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const BUCKET_NAME = 'jestr-meme-uploads';
  // List of operations that don't require authentication
const publicOperations = ['shareMeme','getPresignedUrl','uploadMeme', 'getUserMemes'];

const recordShare = async (memeID, userEmail, shareType, username, catchUser, message) => {
    const shareID = uuidv4();
    const timestamp = new Date().toISOString();
    const notificationID = uuidv4();
    const notificationMessage = message ? `${username} sent you a meme: "${message}"` : `${username} sent you a meme`;
  
    const putParams = {
      TableName: 'Shares',
      Item: {
        MemeID: memeID,
        ShareID: shareID,
        UserEmail: userEmail,
        ShareType: shareType,
        Timestamp: timestamp,
        ShareCaption: message,
      },
    };
  
    const updateShareCountParams = {
      TableName: 'Memes',
      Key: { MemeID: memeID },
      UpdateExpression: 'SET ShareCount = if_not_exists(ShareCount, :start) + :inc',
      ExpressionAttributeValues: {
        ':start': 0,
        ':inc': 1
      }
    };
  
    const putNotificationParams = {
      TableName: 'Notis',
      Item: {
        MemeID: memeID,
        CatchUser: catchUser,
        FromUser: username,
        NotificationID: notificationID,
        Type: shareType,
        Message: notificationMessage,
        Seen: false,
        Timestamp: timestamp
      }
    };
  
    try {
      await docClient.send(new PutCommand(putParams));
     // console.log('Share recorded successfully');
      await docClient.send(new UpdateCommand(updateShareCountParams));
     // console.log('Share count updated successfully');
      await docClient.send(new PutCommand(putNotificationParams));
     // console.log('Noti recorded successfully');
  
      // Send a message with the meme
       const messageContent = JSON.stringify({
        type: 'meme_share',
        memeID: memeID,
        message: message || ''
      });
      await sendMessage(userEmail, catchUser, messageContent);
     // console.log('Meme share message sent successfully');
  
    } catch (error) {
      console.error('Error recording share, updating share count, Notis, or sending message:', error);
      throw error;
    }
};

// Brought in helper function to send message when user shares meme 
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
  

export const handler = async (event) => {
//console.log('Received event:', JSON.stringify(event, null, 2));
//console.log('Headers:', JSON.stringify(event.headers, null, 2));
//console.log('Processing operation:', event.operation);
//console.log('Request body:', JSON.stringify(event.body));R
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
    //console.log('Received event:', JSON.stringify(event, null, 2));
   //console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));

  let verifiedUser = null;

  if (!publicOperations.includes(operation)) {
    const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];
  
    if (!token) {
   //   console.log('No token found in headers:', event.headers);
      return createResponse(401, 'No token provided');
    }
  
    try {
      const payload = await verifier.verify(token);
    //  console.log("Token is valid. Payload:", payload);
      verifiedUser = payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return createResponse(401, 'Invalid token');
    }
  }

    switch (operation) {

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

        // Case to assist S3 upload
        case 'getPresignedUrl': {
            const { fileName, fileType } = requestBody;
            //console.log('Received request for:', { fileName, fileType });
            const fileKey = `Memes/${fileName}`;
            
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
                ContentType: fileType
            });
    
            try {
            //console.log('Generating presigned URL with params:', { Bucket: BUCKET_NAME, Key: fileKey, ContentType: fileType });
                const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            //console.log('Generated presigned URL:', uploadURL);
                return createResponse(200, 'Presigned URL generated successfully', { uploadURL, fileKey });
            } catch (error) {
                console.error('Error generating presigned URL:', error);
              return createResponse(500, 'Failed to generate presigned URL', { error: error.message });
            }
        }

        case 'uploadMeme': {
            const { email, username, caption, tags, mediaType, memeKey } = requestBody;
              if (!email || !username || !mediaType || !memeKey) {
                return createResponse(400, 'Email, username, media type, and meme key are required.');
              }
              try {
                // First, fetch the user's profile to get the latest ProfilePicUrl
                const userProfileParams = {
                    TableName: 'Profiles',
                    Key: { email: email }
                };
        
                const userProfileResult = await docClient.send(new GetCommand(userProfileParams));
                const userProfile = userProfileResult.Item;
        
                if (!userProfile) {
                    return createResponse(404, 'User profile not found');
                }
        
                const profilePicUrl = userProfile.profilePic || ''; 
        
                const memeMetadataParams = {
                    TableName: 'Memes',
                    Item: {
                    MemeID: memeKey,
                    Email: email,
                    UploadTimestamp: new Date().toISOString(),
                    MemeURL: `https://${BUCKET_NAME}.s3.amazonaws.com/${memeKey}`,
                    Username: username,
                    Caption: caption || '',
                    Tags: tags || [],
                    LikeCount: 0,
                    DownloadsCount: 0,
                    CommentCount: 0,
                    mediaType: mediaType,
                    ProfilePicUrl: profilePicUrl 
                    },
                };
        
                await docClient.send(new PutCommand(memeMetadataParams));
        
                return createResponse(200, 'Meme metadata processed successfully.', { 
                    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${memeKey}`,
                    profilePicUrl: profilePicUrl 
                });
                } catch (error) {
                    console.error('Error storing meme metadata in DynamoDB:', error);
                return createResponse(500, `Failed to store meme metadata: ${error.message}`);
                }
        }

        case 'getUserMemes': {
            const { email, lastEvaluatedKey, limit = 20 } = requestBody;
            if (!email) {
              return createResponse(400, 'Email is required to fetch user memes.');
            }

            const queryParams = {
              TableName: 'Memes',
              IndexName: 'Email-UploadTimestamp-index',
              KeyConditionExpression: 'Email = :email',
              ExpressionAttributeValues: {':email': email},
              ScanIndexForward: false,
              Limit: limit,
              ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
              };

          try {
            const result = await docClient.send(new QueryCommand(queryParams));

          const userMemes = result.Items ? result.Items.map(item => ({
              memeID: item.MemeID,
              email: item.Email,
              url: item.MemeURL,
              caption: item.Caption,
              uploadTimestamp: item.UploadTimestamp,
              likeCount: item.LikeCount || 0,
              downloadCount: item.DownloadsCount || 0,
              commentCount: item.CommentCount || 0,
              shareCount: item.ShareCount || 0,
              username: item.Username,
              profilePicUrl: item.ProfilePicUrl || '',
              mediaType: item.mediaType || 'image',
              liked: item.Liked || false,
              doubleLiked: item.DoubleLiked || false,
              memeUser: {
              email: item.Email,
              username: item.Username,
              profilePic: item.ProfilePicUrl || '',
              },
            })) : [];
          return createResponse(200, 'User memes retrieved successfully.', {
              memes: userMemes,
              lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
          });
          } catch (error) {
            console.error('Error fetching user memes:', error);
          return createResponse(500, 'Failed to fetch user memes.', { memes: [], lastEvaluatedKey: null });
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