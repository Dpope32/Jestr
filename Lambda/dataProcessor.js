// dataProcessor.js
// fetchMemes, getLikeStatus, requestDataArchive, recordMemeView
// New implementation 09/22/2024 that uses new Redis refactoring and not serverless redis and 0 replicas to save money
// must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const Redis = require('ioredis');

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379, 
  connectTimeout: 5000,
  maxRetriesPerRequest: 1
});

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const VIEWED_MEMES_EXPIRATION = 86400; // 24 hours
const MEME_METADATA_EXPIRATION = 43200; // 12 hours
const ALL_MEMES_CACHE_EXPIRATION = 10800; // 3 hours
const BUCKET_NAME = 'jestr-meme-uploads';
const ALL_MEMES_CACHE_KEY = 'allMemeIDs';
const publicOperations = ['fetchMemes', 'requestDataArchive', 'getLikeStatus', 'recordMemeView'];

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

// Helper functions for encoding and decoding likeStatus to reduce Redis memory usage
const encodeLikeStatus = (liked, doubleLiked) => `${liked ? '1' : '0'}${doubleLiked ? '1' : '0'}`;
const decodeLikeStatus = (status) => ({ liked: status[0] === '1', doubleLiked: status[1] === '1'});

// Function to get all meme IDs from cache or DynamoDB and cache them in Redis
async function getAllMemeIDs() {
  let allMemeIDs = await redis.zrange(ALL_MEMES_CACHE_KEY, 0, -1);

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

        pipeline.zadd(ALL_MEMES_CACHE_KEY, uploadTimestamp, item.MemeID);
        successfullyCachedMemeIDs.push(item.MemeID);
        uploadTimestamps.push(uploadTimestamp);
      });

      pipeline.expire(ALL_MEMES_CACHE_KEY, ALL_MEMES_CACHE_EXPIRATION);
      const execResults = await pipeline.exec();
    //  console.log(`Cached a total of ${successfullyCachedMemeIDs.length} meme IDs in Redis.`);
    //  console.log(`Cached a total of ${successfullyCachedMemeIDs.length} meme IDs in Redis.`);
    }
  } else {
    console.log(`Cache hit: Retrieved ${allMemeIDs.length} meme IDs from cache.`);
  }

  return allMemeIDs;
}

// Function to get cached memes data
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
            pipeline.expire(`meme:${item.MemeID}`, MEME_METADATA_EXPIRATION);
          }
        });
        await pipeline.exec();
      //  console.log(`Cached ${response.Responses.Memes.length} uncached meme IDs in Redis.`);
      }
    } catch (error) {
      console.error('Error fetching uncached meme data:', error);
    }
  }

  return cachedMemes;
}

// Function to record meme views
async function recordMemeViews(userEmail, memeIDs) {
  if (memeIDs.length === 0) return;

  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  const expirationTime = Math.floor(now.getTime() / 1000) + (30 * 24 * 60 * 60);

  const redisKey = `userViews:${userEmail}:${dateString}`;
  const pipeline = redis.pipeline();
  pipeline.sadd(redisKey, ...memeIDs);
  pipeline.expire(redisKey, VIEWED_MEMES_EXPIRATION);
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
    //  console.log(`Recorded meme views for user ${userEmail} in DynamoDB.`);
    } catch (error) {
      console.error('Error recording meme views in DynamoDB:', error);
    }
  }
}

// Function to get cached meme data
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
        await redis.expire(memeKey, MEME_METADATA_EXPIRATION);
      }
    } catch (error) {
      console.error('Error fetching meme data from DynamoDB:', error);
    }
  }
  return memeData;
}

exports.handler = async (event) => {
 //console.log('Received event in dataProcessor:', JSON.stringify(event, null, 2));
 //console.log('Headers:', JSON.stringify(event.headers, null, 2));
 //console.log('Processing operation:', event.operation);
 //console.log('Request body:', JSON.stringify(event.body));
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
      case 'fetchMemes': {
       // const timeLabel = `fetchMemes-${Date.now()}-${Math.random()}`;
      //  console.time(timeLabel);
        const { lastViewedMemeId, userEmail, limit = 5 } = requestBody;
        if (!userEmail) {
      //    console.timeEnd(timeLabel);
          return createResponse(400, 'userEmail is required.');
        }
      
        try {
          const redisKey = `viewedMemeIDs:${userEmail}`;
          let viewedMemeIDs = new Set(await redis.smembers(redisKey));
      
          console.log(`Cache hit: Found ${viewedMemeIDs.size} viewed memes for user ${userEmail}`);

          // Fetch all meme IDs from cache or DynamoDB
          const allMemeIDs = await getAllMemeIDs();

          // If lastViewedMemeId is provided, find its index and slice from there
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
        //  console.log(`Retrieved ${unseenMemeIDs.length} unseen meme IDs for user ${userEmail}`);
      
          const memes = await getCachedMemesData(unseenMemeIDs);
        //  console.log(`Retrieved ${memes.length} unseen memes for user ${userEmail}`);
      
          if (unseenMemeIDs.length > 0) {
            await redis.sadd(redisKey, ...unseenMemeIDs);
            await redis.expire(redisKey, VIEWED_MEMES_EXPIRATION);
          //  console.log(`Added ${unseenMemeIDs.length} new meme IDs to Redis for user ${userEmail}`);
          }
      
          await recordMemeViews(userEmail, unseenMemeIDs);
      
          // End timing
        //  console.timeEnd(timeLabel);
          return createResponse(200, 'Memes retrieved successfully.', {
            memes,
            lastViewedMemeId: memes.length > 0 ? memes[memes.length - 1].memeID : lastViewedMemeId
          });
        } catch (error) {
          console.error('Error fetching memes:', error);
          console.timeEnd(timeLabel);
          return createResponse(500, 'Internal Server Error', { error: error.message });
        }
      }

      // Refactored 'getLikeStatus' operation
      case 'getLikeStatus': {
        const { memeID, userEmail } = requestBody;
        if (!memeID || !userEmail) {
          return createResponse(400, 'memeID and userEmail are required.');
        }
        try {
          let memeItem = await getCachedMemeData(memeID);

          
        if (!memeItem) {
          const newMemeParams = {
            TableName: 'Memes',
            Item: {
              MemeID: memeID,
              Email: 'pope.dawson@gmail.com',
              UploadTimestamp: new Date().toISOString(),
              LikeCount: 0,
              ShareCount: 0,
              CommentCount: 0,
              DownloadsCount: 0,
              Username: 'Admin',
              ProfilePicUrl: 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/pope.dawson@gmail.com-profilePic-1719862276108.jpg',
              mediaType: memeID.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
              MemeURL: `${CLOUDFRONT_URL}/${memeID}`
            }
          };
            await docClient.send(new PutCommand(newMemeParams));
            memeItem = newMemeParams.Item;
          //  console.log(`Created new meme entry for memeID ${memeID}.`);
          }

          const likeStatusKey = `likeStatus:${userEmail}:${memeID}`;
          let likeStatus = await redis.get(likeStatusKey);

          if (!likeStatus) {
            const userLikeParams = {
              TableName: 'UserLikes',
              Key: {
                email: userEmail,
                MemeID: memeID
              }
            };

            const { Item: userLikeItem } = await docClient.send(new GetCommand(userLikeParams));

            likeStatus = encodeLikeStatus(userLikeItem ? userLikeItem.Liked : false, userLikeItem ? userLikeItem.DoubleLiked : false);

            await redis.set(likeStatusKey, likeStatus, 'EX', MEME_METADATA_EXPIRATION);
            //console.log(`Cached like status for user ${userEmail} and memeID ${memeID}.`);
          } else {
            likeStatus = decodeLikeStatus(likeStatus);
          }

          const response = {
            ...memeItem,
            ...likeStatus
          };

          return createResponse(200, 'Meme info and like status retrieved successfully.', response);
        } catch (error) {
          console.error(`Error getting meme info and like status: ${error}`);
          return createResponse(500, 'Failed to get meme info and like status.', { error: error.message });
        }
      }

      case 'requestDataArchive': {
        const { email } = requestBody;
        if (!email) {
          return createResponse(400, 'Email is required to request data archive.');
        }
      
        try {
          // Fetch user's memes
          const userMemes = await getUserMemes(email);
      
          // Prepare data for archive
          const userData = {
            email: email,
            memes: userMemes,
          };
          const dataString = JSON.stringify(userData, null, 2);

          const fileName = `${email}_data_archive_${Date.now()}.json`;

          const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: dataString,
            ContentType: 'application/json'
          };
          await s3Client.send(new PutObjectCommand(uploadParams));
      
          // Generate a pre-signed URL for the uploaded file
          const url = await getSignedUrl(s3Client, new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName
          }), { expiresIn: 604800 }); // URL expires in 1 week
      
          return createResponse(200, 'Data archive created successfully', {
            message: 'Your data archive has been created.',
            downloadUrl: url,
            expiresIn: '7 days'
          });
        } catch (error) {
          console.error('Error processing data archive request:', error);
          return createResponse(500, 'Failed to process data archive request', { error: error.message });
        }
      }
      
      case 'recordMemeView':
        try {
          const { memeViews } = requestBody;
          if (!Array.isArray(memeViews) || memeViews.length === 0) {
            return createResponse(400, 'memeViews array is required and must not be empty.');
          }

          const pipeline = redis.pipeline();
          memeViews.forEach(view => {
            const uniqueMemeIDs = Array.from(new Set(view.memeIDs));
            const redisKey = `userViews:${view.email}:${new Date().toISOString().split('T')[0]}`;
            pipeline.sadd(redisKey, ...uniqueMemeIDs);
            pipeline.expire(redisKey, VIEWED_MEMES_EXPIRATION);
          });
          await pipeline.exec();

        //  console.log('Recorded meme views successfully.');
          return createResponse(200, 'Meme views recorded successfully.');
        } catch (error) {
          console.error('Error recording meme views:', error);
          return createResponse(500, 'Failed to record meme views', { error: error.message });
        }

      default:
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error('Unexpected error in Lambda:', error);
    return createResponse(500, 'Internal Server Error', { error: error.message });
  }
};

// Helper function to create HTTP responses
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

// Function to get user memes for data archive
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
