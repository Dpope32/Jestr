// memeProcessor.mjs
// shareMeme, getPresignedUrl, uploadMeme, getUserMemes
// Must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });
const rekognitionClient = new RekognitionClient({ region: "us-east-2" });

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

const publicOperations = ["shareMeme", "getPresignedUrl", "uploadMeme", "getUserMemes"];


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
      await docClient.send(new UpdateCommand(updateShareCountParams));
      await docClient.send(new PutCommand(putNotificationParams));
  
       const messageContent = JSON.stringify({
        type: 'meme_share',
        memeID: memeID,
        message: message || ''
      });
      await sendMessage(userEmail, catchUser, messageContent);
  
    } catch (error) {
      console.error('Error recording share, updating share count, Notis, or sending message:', error);
      throw error;
    }
};

const sendMessage = async (senderID, receiverID, content) => {
  const messageID = uuidv4();
  const timestamp = new Date().toISOString();
  const conversationID = [senderID, receiverID].sort().join('#');
  try {
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

      case 'shareMeme': {
        const { memeID, email, username, catchUser, message } = requestBody;
        if (!memeID || !email || !username || !catchUser) {
          return createResponse(400, 'MemeID, email, username, and catchUser are required for sharing a meme.');
        }
        try {
          const shareType = 'general';
          await recordShare(memeID, email, shareType, username, catchUser, message);
          
          // Create a structured content for the message
          const messageContent = JSON.stringify({
            type: 'meme_share',
            memeID: memeID,
            message: message || ''
          });
          
          // Send the structured message
          await sendMessage(email, catchUser, messageContent);
          
          return createResponse(200, 'Meme shared successfully and message sent.');
        } catch (error) {
          console.error(`Error sharing meme: ${error}`);
          return createResponse(500, 'Failed to share meme or send message.');
        }
      }

        case 'getPresignedUrl': {
            const { fileName, fileType } = requestBody;
            const fileKey = `Memes/${fileName}`;
          
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
                ContentType: fileType
            });
    
            try {
                const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                return createResponse(200, 'Presigned URL generated successfully', { uploadURL, fileKey });
            } catch (error) {
                console.error('Error generating presigned URL:', error);
              return createResponse(500, 'Failed to generate presigned URL', { error: error.message });
            }
        }

        case "uploadMeme": {
          const { email, username, caption, tags, mediaType, memeKey } = requestBody;
          if (!email || !username || !mediaType || !memeKey) {
            return createResponse(400, "Email, username, media type, and meme key are required.");
          }
          try {
            const userProfileParams = {
              TableName: "Profiles",
              Key: { email: email },
            };
  
            const userProfileResult = await docClient.send(new GetCommand(userProfileParams));
            const userProfile = userProfileResult.Item;
  
            if (!userProfile) {
              return createResponse(404, "User profile not found");
            }
  
            const profilePicUrl = userProfile.profilePic || "";
  
            let generatedTags = [];
            let inappropriateContent = false;
  
            if (mediaType === "image") {
              // Fetch the image from S3
              const getObjectCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: memeKey,
              });
              const { Body } = await s3Client.send(getObjectCommand);
              const imageBuffer = await streamToBuffer(Body);
  
              // Process the image with Rekognition synchronously
              console.log("Starting Rekognition processing...");
              // Detect moderation labels
              const moderationParams = {
                Image: {
                  Bytes: imageBuffer,
                },
                MinConfidence: 70,
              };
  
              const moderationCommand = new DetectModerationLabelsCommand(moderationParams);
              const moderationResponse = await rekognitionClient.send(moderationCommand);
              const moderationLabels = moderationResponse.ModerationLabels;
              console.log("Moderation labels detected:", moderationLabels);
  
              // Check for inappropriate content
              inappropriateContent = moderationLabels.some((label) => {
                return ["Explicit Nudity", "Nudity", "Graphic Violence"].includes(label.Name);
              });
  
              if (inappropriateContent) {
                // Delete the meme from S3 and DynamoDB
                await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: memeKey }));
                await docClient.send(new DeleteCommand({ TableName: "Memes", Key: { MemeID: memeKey } }));
                console.error("Inappropriate content detected. Meme deleted.");
                // Optionally, notify the user
                return createResponse(400, "Inappropriate content detected. Your meme was not uploaded.");
              }
  
              // Detect labels for tags
              const labelsParams = {
                Image: {
                  Bytes: imageBuffer,
                },
                MaxLabels: 10,
                MinConfidence: 70,
              };
  
              const labelsCommand = new DetectLabelsCommand(labelsParams);
              const labelsResponse = await rekognitionClient.send(labelsCommand);
              const labels = labelsResponse.Labels;
              console.log("Labels detected:", labels);
  
              // Generate tags from labels
              generatedTags = labels.slice(0, 5).map((label) => label.Name);
              console.log("Generated tags:", generatedTags);
            } else {
              // For videos, we can skip Rekognition processing for now
              console.log("Skipping Rekognition processing for video.");
            }
  
            const allTags = tags ? tags.concat(generatedTags) : generatedTags;
  
            const memeMetadataParams = {
              TableName: "Memes",
              Item: {
                MemeID: memeKey,
                Email: email,
                UploadTimestamp: new Date().toISOString(),
                MemeURL: `${CLOUDFRONT_URL}/${memeKey}`,
                Username: username,
                Caption: caption || "",
                Tags: allTags,
                LikeCount: 0,
                DownloadsCount: 0,
                CommentCount: 0,
                ShareCount: 0,
                mediaType: mediaType,
                ProfilePicUrl: profilePicUrl,
              },
            };
  
            await docClient.send(new PutCommand(memeMetadataParams));
            console.log("Meme metadata stored successfully with tags.");
  
            return createResponse(200, "Meme uploaded and processed successfully.", {
              url: `${CLOUDFRONT_URL}/${memeKey}`,
              profilePicUrl: profilePicUrl,
            });
          } catch (error) {
            console.error("Error during meme upload and processing:", error);
            return createResponse(500, `Failed to upload and process meme: ${error.message}`);
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
              url: item.MemeURL.replace(`https://${BUCKET_NAME}.s3.amazonaws.com`, CLOUDFRONT_URL),
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

  // Helper function to convert stream to buffer
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};