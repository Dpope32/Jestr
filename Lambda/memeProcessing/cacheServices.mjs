// cacheServices.mjs

import redis from './redisClient.js'; // Import shared Redis client
import { DynamoDBDocumentClient, GetCommand, BatchGetCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

/**
 * Function to get meme share count with caching.
 * @param {string} email - User's email.
 * @returns {Promise<number>} - Number of shares.
 */
export const getMemeShareCountForUser = async (email) => {
    const cacheKey = `memeShareCount:${email}`;
    let shareCount = await redis.get(cacheKey);
  
    if (shareCount !== null) {
      return parseInt(shareCount, 10);
    }
  
    const params = {
      TableName: 'Messages',
      IndexName: 'SenderID-index',
      KeyConditionExpression: 'SenderID = :senderID',
      FilterExpression: 'begins_with(Content, :memeSharePrefix)',
      ExpressionAttributeValues: {
        ':senderID': email,
        ':memeSharePrefix': '{"type":"meme_share"',
      },
      Select: 'COUNT',
    };
  
    try {
      const result = await docClient.send(new QueryCommand(params));
      shareCount = result.Count || 0;
      await redis.set(cacheKey, shareCount, 'EX', 600);
      return shareCount;
    } catch (error) {
      console.error('Error getting meme share count for user:', error);
      throw error;
    }
  };

/**
 * Function to get user profile with caching.
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} - User profile or null if not found.
 */
export const getUserProfile = async (email) => {
    const cacheKey = `userProfile:${email}`;
    let userProfile = await redis.get(cacheKey);
  
    if (userProfile) {
      return JSON.parse(userProfile);
    }
  
    const params = {
      TableName: "Profiles",
      Key: { email: email },
      ProjectionExpression: "email, username, profilePic, endpointArn",
    };
  
    try {
      const { Item } = await docClient.send(new GetCommand(params));
      if (Item) {
        await redis.set(cacheKey, JSON.stringify(Item), 'EX', 3600);
        return Item;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };
/**
 * Function to get cached meme data.
 * @param {string} memeID - Meme ID.
 * @returns {Promise<Object|null>} - Meme data or null if not found.
 */
export const getCachedMemeData = async (memeID) => { 
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
 * Function to get all meme IDs from cache or DynamoDB and cache them in Redis.
 * @returns {Promise<Array>} - List of all meme IDs.
 */
export const getAllMemeIDs = async () => {
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
export const getCachedMemesData = async (memeIDs) => {
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
export const recordMemeViews = async (userEmail, memeIDs) => {
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
  
