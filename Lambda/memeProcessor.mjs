// memeProcessor.mjs

import { awardBadge } from './badgeServices.mjs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  BatchGetCommand,
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
import redis from './redisClient.js';// Import shared Redis client

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

/**
 * Helper function to create standardized responses.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Response message.
 * @param {Object|null} data - Additional data to include in the response.
 * @returns {Object} - Lambda response object.
 */
const createResponse = (statusCode, message, data = null) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  body: JSON.stringify({ message, data }),
});

/**
 * Helper function to convert stream to buffer.
 * @param {Stream} stream - Readable stream.
 * @returns {Promise<Buffer>} - Buffer containing stream data.
 */
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

/**
 * Function to get meme share count with caching.
 * @param {string} email - User's email.
 * @returns {Promise<number>} - Number of shares.
 */
async function getMemeShareCountForUser(email) {
  const cacheKey = `memeShareCount:${email}`;
  let shareCount = await redis.get(cacheKey);

  if (shareCount !== null) {
    return parseInt(shareCount, 10);
  }

  const params = {
    TableName: 'Messages',
    IndexName: 'SenderID-index', // Ensure this GSI exists
    KeyConditionExpression: 'SenderID = :senderID',
    FilterExpression: 'begins_with(Content, :memeSharePrefix)',
    ExpressionAttributeValues: {
      ':senderID': email,
      ':memeSharePrefix': '{"type":"meme_share"',
    },
    Select: 'COUNT', // We only need the count
  };

  try {
    const result = await docClient.send(new QueryCommand(params));
    shareCount = result.Count || 0;
    // Cache the share count for 10 minutes
    await redis.set(cacheKey, shareCount, 'EX', 600);
    return shareCount;
  } catch (error) {
    console.error('Error getting meme share count for user:', error);
    throw error;
  }
}

/**
 * Function to get user profile with caching.
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} - User profile or null if not found.
 */
const getUserProfile = async (email) => {
  const cacheKey = `userProfile:${email}`;
  let userProfile = await redis.get(cacheKey);

  if (userProfile) {
    return JSON.parse(userProfile);
  }

  // If not in cache, fetch from DynamoDB
  const params = {
    TableName: "Profiles",
    Key: { email: email },
    ProjectionExpression: "email, username, profilePic, endpointArn"
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (Item) {
      // Cache the profile for future requests
      await redis.set(cacheKey, JSON.stringify(Item), 'EX', 3600); // Cache for 1 hour
      return Item;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Function to get cached meme data.
 * @param {string} memeID - Meme ID.
 * @returns {Promise<Object|null>} - Meme data or null if not found.
 */
async function getCachedMemeData(memeID) {
  const memeKey = `meme:${memeID}`;
  let memeData = await redis.hgetall(memeKey);
  if (Object.keys(memeData).length === 0) {
    const memeParams = {
      TableName: 'Memes',
      Key: { MemeID: memeID }
    };
    try {
      const { Item } = await docClient.send(new GetCommand(memeParams));
      if (Item) {
        memeData = {
          memeID: Item.MemeID,
          email: Item.Email || '',
          url: `${CLOUDFRONT_URL}/${Item.MemeID}`,
          uploadTimestamp: Item.UploadTimestamp || '',
          username: Item.Username || '',
          caption: Item.Caption || '',
          likeCount: Item.LikeCount || 0,
          downloadCount: Item.DownloadsCount || 0,
          commentCount: Item.CommentCount || 0,
          shareCount: Item.ShareCount || 0,
          profilePicUrl: Item.ProfilePicUrl || '',
          mediaType: Item.MemeID.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
        };
        await redis.hmset(memeKey, memeData);
        await redis.expire(memeKey, 43200); // 12 hours
      }
    } catch (error) {
      console.error('Error fetching meme data from DynamoDB:', error);
    }
  }
  return memeData;
}

/**
 * Function to record a meme share.
 * @param {string} memeID 
 * @param {string} userEmail 
 * @param {string} shareType 
 * @param {string} username 
 * @param {string} catchUser 
 * @param {string} message 
 */
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
      // Use a transaction to ensure atomicity
      const transactParams = {
        TransactItems: [
          { Put: { TableName: 'Shares', Item: putParams.Item } },
          { Update: updateShareCountParams },
          { Put: { TableName: 'Notis', Item: putNotificationParams.Item } },
        ]
      };
      await docClient.send(new UpdateCommand(transactParams));

      // Update the share count in Redis cache
      const cacheKey = `memeShareCount:${userEmail}`;
      const currentShareCount = await getMemeShareCountForUser(userEmail);
      await redis.set(cacheKey, currentShareCount, 'EX', 600); // Refresh cache

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

/**
 * Function to send a message between users.
 * @param {string} senderID 
 * @param {string} receiverID 
 * @param {string} content 
 * @returns {Promise<Object>}
 */
const sendMessage = async (senderID, receiverID, content) => {
  const messageID = uuidv4();
  const timestamp = new Date().toISOString();
  const conversationID = [senderID, receiverID].sort().join("#");
  
  console.log(`sendMessage called with: senderID=${senderID}, receiverID=${receiverID}, content=${content}`);
  console.log(`Generated messageID=${messageID}, conversationID=${conversationID}`);

  try {
    // 1. Insert message into Messages table
    const messageParams = {
      TableName: "Messages",
      Item: {
        MessageID: messageID,
        SenderID: senderID,
        ReceiverID: receiverID,
        Content: JSON.stringify(content),
        Timestamp: timestamp,
        Status: "sent",
        ConversationID: conversationID
      },
    };
    console.log("Putting message into Messages table:", JSON.stringify(messageParams, null, 2));
    await docClient.send(new PutCommand(messageParams));
    console.log("Message inserted successfully.");

    // 2. Update Conversations table
    const conversationParams = {
      TableName: "Conversations",
      Key: { ConversationID: conversationID },
      UpdateExpression: "SET LastMessageID = :messageID, LastUpdated = :timestamp",
      ExpressionAttributeValues: {
        ":messageID": messageID,
        ":timestamp": timestamp
      },
    };
    console.log("Updating Conversations table:", JSON.stringify(conversationParams, null, 2));
    await docClient.send(new UpdateCommand(conversationParams));
    console.log("Conversations table updated successfully.");

    // 3. Update UserConversations for sender
    console.log(`Updating UserConversations for sender: ${senderID}, ConversationID: ${conversationID}`);
    await updateUserConversations(senderID, conversationID, messageID, 0);

    // 4. Update UserConversations for receiver
    console.log(`Updating UserConversations for receiver: ${receiverID}, ConversationID: ${conversationID}`);
    await updateUserConversations(receiverID, conversationID, null, 1);

    // 5. Get receiver's endpoint ARN with caching
    const receiverProfile = await getUserProfile(receiverID);

    if (receiverProfile && receiverProfile.endpointArn) {
      console.log(`Attempting to send notification to ${receiverID} with endpointArn: ${receiverProfile.endpointArn}`);
      try {
        const result = await snsClient.send(new PublishCommand({
          TargetArn: receiverProfile.endpointArn,
          Message: JSON.stringify({
            default: JSON.stringify({
              messageId: messageID,
              senderEmail: senderID,
              content: content
            }),
            GCM: JSON.stringify({
              data: {
                messageId: messageID,
                senderEmail: senderID,
                content: content
              }
            })
          }),
          MessageStructure: 'json'
        }));
        console.log(`Notification sent successfully. MessageId: ${result.MessageId}`);
      } catch (error) {
        console.error(`Failed to send notification: ${error.message}`);
      }
    } else {
      console.log(`No endpointArn found for receiver ${receiverID}. Notification not sent.`);
    }

    return { success: true, messageID, conversationID };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Function to update UserConversations table.
 * @param {string} userId - User's email.
 * @param {string} conversationId - Conversation ID.
 * @param {string|null} lastReadMessageId - Last read message ID.
 * @param {number} unreadCount - Number of unread messages.
 */
async function updateUserConversations(userId, conversationId, lastReadMessageId, unreadCount) {
  const updateParams = {
    TableName: 'UserConversations_v2',
    Key: {
      UserID: userId,
      ConversationID: conversationId
    },
    UpdateExpression: 'SET LastReadMessageID = :messageID, UnreadCount = :unreadCount',
    ExpressionAttributeValues: {
      ':messageID': lastReadMessageId,
      ':unreadCount': unreadCount
    },
    ReturnValues: 'ALL_NEW'
  };
  console.log(`updateUserConversations called with: userId=${userId}, conversationId=${conversationId}, lastReadMessageId=${lastReadMessageId}, unreadCount=${unreadCount}`);
  console.log(`UpdateParams: ${JSON.stringify(updateParams, null, 2)}`);
  
  try {
    await docClient.send(new UpdateCommand(updateParams));
    console.log(`Successfully updated UserConversations for userId=${userId}, conversationId=${conversationId}`);
  } catch (error) {
    console.error(`Error updating UserConversations for userId=${userId}, conversationId=${conversationId}:`, error);
    throw error;
  }
}

/**
 * Function to get all meme IDs from cache or DynamoDB and cache them in Redis.
 * @returns {Promise<Array>} - List of all meme IDs.
 */
async function getAllMemeIDs() {
  const cacheKey = 'allMemeIDs';
  let allMemeIDs = await redis.zrange(cacheKey, 0, -1);

  if (allMemeIDs.length === 0) {
    console.log('Cache miss for all meme IDs, fetching from DynamoDB');
    const queryParams = {
      TableName: 'Memes',
      IndexName: 'ByStatusAndTimestamp',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'Status' },
      ExpressionAttributeValues: { ':status': 'active' },
      ScanIndexForward: false,
      Limit: 500 
    };

    let fetchedMemeItems = [];
    let ExclusiveStartKey = null;

    do {
      if (ExclusiveStartKey) {
        queryParams.ExclusiveStartKey = ExclusiveStartKey;
      }
      const result = await docClient.send(new QueryCommand(queryParams));
      fetchedMemeItems.push(...result.Items);
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    allMemeIDs = fetchedMemeItems.map(item => item.MemeID);

    if (allMemeIDs.length > 0) {
      const pipeline = redis.pipeline();
      const successfullyCachedMemeIDs = [];
      const uploadTimestamps = [];

      fetchedMemeItems.forEach(item => {
        if (!item.UploadTimestamp) {
          console.error(`Missing UploadTimestamp for memeID ${item.MemeID}. Skipping.`);
          return; // Skip this memeID
        }

        const uploadTimestamp = new Date(item.UploadTimestamp).getTime();
        if (isNaN(uploadTimestamp)) {
          console.error(`Invalid UploadTimestamp for memeID ${item.MemeID}: ${item.UploadTimestamp}. Skipping.`);
          return; // Skip this memeID
        }

        pipeline.zadd(cacheKey, uploadTimestamp, item.MemeID);
        successfullyCachedMemeIDs.push(item.MemeID);
        uploadTimestamps.push(uploadTimestamp);
      });

      pipeline.expire(cacheKey, 10800); // 3 hours
      await pipeline.exec();
      console.log(`Cached a total of ${successfullyCachedMemeIDs.length} meme IDs in Redis.`);
    }
  } else {
    console.log(`Cache hit: Retrieved ${allMemeIDs.length} meme IDs from cache.`);
  }

  return allMemeIDs;
}

/**
 * Function to get cached memes data.
 * @param {Array} memeIDs - List of meme IDs.
 * @returns {Promise<Array>} - List of meme data.
 */
async function getCachedMemesData(memeIDs) {
  if (memeIDs.length === 0) return [];

  const pipeline = redis.pipeline();
  memeIDs.forEach(memeID => {
    pipeline.hgetall(`meme:${memeID}`);
  });
  const results = await pipeline.exec();

  const cachedMemes = [];
  const uncachedMemeIDs = [];

  results.forEach(([err, result], index) => {
    if (!err && Object.keys(result).length > 0) {
      cachedMemes.push(result);
    } else {
      uncachedMemeIDs.push(memeIDs[index]);
    }
  });

  if (uncachedMemeIDs.length > 0) {
    try {
      const batchGetParams = {
        RequestItems: {
          'Memes': {
            Keys: uncachedMemeIDs.map(memeID => ({ MemeID: memeID }))
          }
        }
      };

      // Use BatchGetCommand from DynamoDBDocumentClient
      const command = new BatchGetCommand(batchGetParams);
      const response = await docClient.send(command);

      if (response.Responses && response.Responses.Memes) {
        const pipeline = redis.pipeline();
        response.Responses.Memes.forEach(item => {
          if (item && item.MemeID) {
            const memeData = {
              mediaType: item.MemeID.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
              url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.MemeID}`,
              memeID: item.MemeID,
              email: item.Email || '',
              uploadTimestamp: item.UploadTimestamp || '',
              username: item.Username || '',
              caption: item.Caption || '',
              likeCount: item.LikeCount || 0,
              downloadCount: item.DownloadsCount || 0,
              commentCount: item.CommentCount || 0,
              shareCount: item.ShareCount || 0,
              profilePicUrl: item.ProfilePicUrl || ''
            };
            cachedMemes.push(memeData);
            pipeline.hmset(`meme:${item.MemeID}`, memeData);
            pipeline.expire(`meme:${item.MemeID}`, 43200); // 12 hours
          }
        });
        await pipeline.exec();
        console.log(`Cached ${response.Responses.Memes.length} uncached meme IDs in Redis.`);
      }
    } catch (error) {
      console.error('Error fetching uncached meme data:', error);
    }
  }

  return cachedMemes;
}

/**
 * Function to record meme views.
 * @param {string} userEmail - User's email.
 * @param {Array} memeIDs - List of meme IDs viewed.
 */
async function recordMemeViews(userEmail, memeIDs) {
  if (memeIDs.length === 0) return;

  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  const expirationTime = Math.floor(now.getTime() / 1000) + (30 * 24 * 60 * 60);

  const redisKey = `userViews:${userEmail}:${dateString}`;
  const pipeline = redis.pipeline();
  pipeline.sadd(redisKey, ...memeIDs);
  pipeline.expire(redisKey, 86400); // 24 hours
  pipeline.incrby(`viewCount:${userEmail}`, memeIDs.length);
  pipeline.get(`lastWriteTime:${userEmail}`);
  const results = await pipeline.exec();

  const viewCount = results[2][1];
  const lastWriteTime = results[3][1];
  const currentTime = Date.now();

  if (viewCount >= 100 || (lastWriteTime && currentTime - parseInt(lastWriteTime) > 300000)) {
    const allMemeIDs = await redis.smembers(redisKey);

    const putCommand = new PutCommand({
      TableName: 'UserMemeViews',
      Item: {
        email: userEmail,
        date: dateString,
        viewedMemes: allMemeIDs,
        expirationTime: expirationTime
      }
    });

    try {
      await docClient.send(putCommand);
      await redis.set(`lastWriteTime:${userEmail}`, currentTime);
      await redis.set(`viewCount:${userEmail}`, 0);
      console.log(`Recorded meme views for user ${userEmail} in DynamoDB.`);
    } catch (error) {
      console.error('Error recording meme views in DynamoDB:', error);
    }
  }
}

/**
 * Function to fetch user memes for data archive.
 * @param {string} email - User's email.
 * @returns {Promise<Array>} - List of user's memes.
 */
async function getUserMemes(email) {
  const queryParams = {
    TableName: 'Memes',
    IndexName: 'Email-UploadTimestamp-index',
    KeyConditionExpression: 'Email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    ScanIndexForward: false
  };

  try {
    const result = await docClient.send(new QueryCommand(queryParams));
    return result.Items.map(item => ({
      memeID: item.MemeID,
      url: item.MemeURL,
      uploadTimestamp: item.UploadTimestamp,
      caption: item.Caption,
      likeCount: item.LikeCount || 0,
      downloadCount: item.DownloadsCount || 0,
      commentCount: item.CommentCount || 0,
      shareCount: item.ShareCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching user memes:', error);
    throw error;
  }
}

/**
 * Function to handle sharing a meme.
 * @param {string} memeID 
 * @param {string} email 
 * @param {string} username 
 * @param {string} catchUser 
 * @param {string} message 
 * @returns {Promise<Object>} - Result of the share operation.
 */
const shareMeme = async (memeID, email, username, catchUser, message) => {
  console.log("Operation: shareMeme");
  console.log(`Parameters: memeID=${memeID}, email=${email}, username=${username}, catchUser=${catchUser}, message=${message}`);

  if (!memeID || !email || !username || !catchUser) {
    console.error("Missing required parameters for shareMeme.");
    throw new Error('MemeID, email, username, and catchUser are required for sharing a meme.');
  }

  try {
    const shareType = 'general';
    console.log(`Recording share: memeID=${memeID}, email=${email}, shareType=${shareType}, username=${username}, catchUser=${catchUser}, message=${message}`);
    await recordShare(memeID, email, shareType, username, catchUser, message);
    
    // Check for viralSensation badge
    const shareCount = await getMemeShareCountForUser(email);
    let badgeEarned = null;
    
    if (shareCount >= 25) {
      console.log(`User ${email} has reached ${shareCount} shares. Awarding 'viralSensation' badge.`);
      badgeEarned = await awardBadge(email, 'viralSensation');
    }
    
    return { badgeEarned };
  } catch (error) {
    console.error(`Error sharing meme: ${error}`);
    throw error;
  }
};

/**
 * Function to generate a presigned URL for uploading a meme.
 * @param {string} fileName - Name of the file.
 * @param {string} fileType - MIME type of the file.
 * @returns {Promise<Object>} - Presigned URL and file key.
 */
const getPresignedUrl = async (fileName, fileType) => {
  const fileKey = `Memes/${fileName}`;
  
  const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType
  });

  try {
      const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return { uploadURL, fileKey };
  } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
  }
};

/**
 * Function to upload and process a meme.
 * @param {string} email - User's email.
 * @param {string} username - User's username.
 * @param {string} caption - Meme caption.
 * @param {Array} tags - Tags for the meme.
 * @param {string} mediaType - Type of media ('image' or 'video').
 * @param {string} memeKey - S3 object key for the meme.
 * @returns {Promise<Object>} - Result of the upload and processing.
 */
const uploadMeme = async (email, username, caption, tags, mediaType, memeKey) => {
  console.log("Operation: uploadMeme");
  console.log(`Parameters: email=${email}, username=${username}, caption=${caption}, tags=${tags}, mediaType=${mediaType}, memeKey=${memeKey}`);

  if (!email || !username || !mediaType || !memeKey) {
    console.error("Missing required parameters for uploadMeme.");
    throw new Error("Email, username, media type, and meme key are required.");
  }
  try {
    const userProfileParams = {
      TableName: "Profiles",
      Key: { email: email },
    };

    const userProfileResult = await docClient.send(new GetCommand(userProfileParams));
    const userProfile = userProfileResult.Item;

    if (!userProfile) {
      throw new Error("User profile not found");
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
        throw new Error("Inappropriate content detected. Your meme was not uploaded.");
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

    // Cache the meme data in Redis
    const memeData = {
      mediaType: mediaType,
      url: `${CLOUDFRONT_URL}/${memeKey}`,
      memeID: memeKey,
      email: email,
      uploadTimestamp: memeMetadataParams.Item.UploadTimestamp,
      username: username,
      caption: caption || '',
      likeCount: 0,
      downloadCount: 0,
      commentCount: 0,
      shareCount: 0,
      profilePicUrl: profilePicUrl
    };
    await redis.hmset(`meme:${memeKey}`, memeData);
    await redis.expire(`meme:${memeKey}`, 43200); // 12 hours
    console.log(`Cached meme data for ${memeKey} in Redis.`);

    return createResponse(200, "Meme uploaded and processed successfully.", {
      url: `${CLOUDFRONT_URL}/${memeKey}`,
      profilePicUrl: profilePicUrl,
    });
  } catch (error) {
    console.error("Error during meme upload and processing:", error);
    return createResponse(500, `Failed to upload and process meme: ${error.message}`);
  }
};

/**
 * Function to fetch memes.
 * @param {string} lastViewedMemeId - Last viewed meme ID for pagination.
 * @param {string} userEmail - User's email.
 * @param {number} limit - Number of memes to fetch.
 * @returns {Promise<Object>} - List of memes and last viewed meme ID.
 */
const fetchMemes = async (lastViewedMemeId, userEmail, limit = 5) => {
  console.log("Operation: fetchMemes");
  console.log(`Parameters: lastViewedMemeId=${lastViewedMemeId}, userEmail=${userEmail}, limit=${limit}`);

  if (!userEmail) {
    throw new Error("userEmail is required.");
  }

  try {
    const redisKey = `viewedMemeIDs:${userEmail}`;
    let viewedMemeIDs = new Set(await redis.smembers(redisKey));
    const allMemeIDs = await getAllMemeIDs();

    let startIndex = 0;
    if (lastViewedMemeId) {
      const lastIndex = allMemeIDs.indexOf(lastViewedMemeId);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }

    // Slice the meme IDs starting from startIndex
    const slicedMemeIDs = allMemeIDs.slice(startIndex);

    // Filter out viewed memes and limit the result
    const unseenMemeIDs = slicedMemeIDs.filter(memeID => !viewedMemeIDs.has(memeID)).slice(0, limit);
    const memes = await getCachedMemesData(unseenMemeIDs);

    if (unseenMemeIDs.length > 0) {
      await redis.sadd(redisKey, ...unseenMemeIDs);
    }

    await recordMemeViews(userEmail, unseenMemeIDs);
    return {
      memes,
      lastViewedMemeId: memes.length > 0 ? memes[memes.length - 1].memeID : lastViewedMemeId
    };
  } catch (error) {
    console.error('Error fetching memes:', error);
    throw error;
  }
};

/**
 * Main Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
  console.log("Received event in memeProcessor:", JSON.stringify(event, null, 2));

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
        try {
          const result = await shareMeme(memeID, email, username, catchUser, message);
          return createResponse(200, 'Meme shared successfully and message sent.', { badgeEarned: result.badgeEarned });
        } catch (error) {
          console.error(`Error sharing meme: ${error}`);
          return createResponse(500, 'Failed to share meme or send message.');
        }
      }

      case 'getPresignedUrl': {
          const { fileName, fileType } = requestBody;
          if (!fileName || !fileType) {
            return createResponse(400, 'fileName and fileType are required.');
          }
          try {
              const { uploadURL, fileKey } = await getPresignedUrl(fileName, fileType);
              return createResponse(200, 'Presigned URL generated successfully', { uploadURL, fileKey });
          } catch (error) {
              console.error('Error generating presigned URL:', error);
            return createResponse(500, 'Failed to generate presigned URL', { error: error.message });
          }
      }

      case "uploadMeme": {
        const { email, username, caption, tags, mediaType, memeKey } = requestBody;
        try {
          const result = await uploadMeme(email, username, caption, tags, mediaType, memeKey);
          return createResponse(200, "Meme uploaded and processed successfully.", result.data);
        } catch (error) {
          console.error("Error during meme upload and processing:", error);
          return createResponse(500, `Failed to upload and process meme: ${error.message}`);
        }
      }

      case 'getUserMemes': {
        const { email, lastEvaluatedKey, limit } = requestBody;
        if (!email) {
          return createResponse(400, 'Email is required to fetch user memes.');
        }

        try {
          const result = await getUserMemes(email);
          return createResponse(200, 'User memes retrieved successfully.', { memes: result });
        } catch (error) {
          console.error('Error fetching user memes:', error);
          return createResponse(500, 'Failed to fetch user memes.', { memes: [], lastEvaluatedKey: null });
        }
      }

      default:
        console.warn(`Unsupported operation: ${operation}`);
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error('Unexpected error in Lambda handler:', error);
    return createResponse(500, 'Internal Server Error', { error: error.message });
  }
};
