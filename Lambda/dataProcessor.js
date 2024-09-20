const {DynamoDBDocumentClient,GetCommand,BatchWriteCommand,PutCommand,QueryCommand} = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient, BatchGetItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const Redis = require('ioredis');

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  tls: {},
  connectTimeout: 5000, // 5 seconds timeout
  maxRetriesPerRequest: 1
});

const VIEWED_MEMES_EXPIRATION = 86400; // 24 hours
const MEME_METADATA_EXPIRATION = 3600; // 1 hour
const FOLLOW_STATUS_EXPIRATION = 3600; // 1 hour

// Handle Redis connection errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });
const cachedViewedMemes = {}; 
const BUCKET_NAME = 'jestr-meme-uploads';

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

async function testRedisConnection() {
  try {
    console.log('Starting Redis test');
    await Promise.race([
      redis.set('test_key', 'test_value'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis operation timed out')), 5000))
    ]);
    console.log('Redis set operation completed');
    const value = await redis.get('test_key');
    console.log('Redis test successful. Value:', value);
    return value === 'test_value';
  } catch (error) {
    console.error('Redis test failed:', error);
    return false;
  }
}

// Function to send a message
const batchCheckFollowStatus = async (followerId, followeeIDs) => {
  // Check if followeeIDs array is empty
  if (followeeIDs.length === 0) {
    console.log('No followee IDs provided. Returning empty follow statuses.');
    return followeeIDs.reduce((acc, followeeId) => {
      acc[followeeId] = false; // Default to false if no followee provided
      return acc;
    }, {});
  }

  const batchGetParams = {
    RequestItems: {
      'UserRelationships': {
        Keys: followeeIDs.map(followeeId => ({
          UserID: { S: followerId },
          RelationUserID: { S: followeeId }
        }))
      }
    }
  };

  try {
    const command = new BatchGetItemCommand(batchGetParams);
    const response = await ddbClient.send(command);

    const followStatuses = {};
    if (response.Responses && response.Responses.UserRelationships) {
      response.Responses.UserRelationships.forEach(item => {
        followStatuses[item.RelationUserID.S] = true;
      });
    }

    // For any followeeId not in the response, set it to false
    followeeIDs.forEach(followeeId => {
      if (!(followeeId in followStatuses)) {
        followStatuses[followeeId] = false;
      }
    });

    return followStatuses;
  } catch (error) {
    console.error('Error in batchCheckFollowStatus:', error);
    // Return an object with all followees set to false in case of error
    return followeeIDs.reduce((acc, followeeId) => {
      acc[followeeId] = false;
      return acc;
    }, {});
  }
};


async function recordMemeViews(userEmail, memeIDs) {
  const now = new Date();
  const offset = now.getTimezoneOffset() + (6 * 60); 
  now.setMinutes(now.getMinutes() + offset);
  
  const dateString = now.toISOString().split('T')[0];
  const expirationTime = Math.floor(now.getTime() / 1000) + (30 * 24 * 60 * 60); 

  const getCommand = new GetCommand({
    TableName: 'UserMemeViews',
    Key: {
      email: userEmail,
      date: dateString
    }
  });

  let existingItem;
  try {
    const response = await docClient.send(getCommand);
    existingItem = response.Item;
  } catch (error) {
    console.error('Error fetching existing meme views:', error);
  }

  // Combine existing and new meme IDs
  const allMemeIDs = new Set([
    ...(existingItem?.viewedMemes || []),
    ...memeIDs
  ]);

  const putCommand = new PutCommand({
    TableName: 'UserMemeViews',
    Item: {
      email: userEmail,
      date: dateString,
      viewedMemes: Array.from(allMemeIDs),
      expirationTime: expirationTime
    }
  });

  try {
    await docClient.send(putCommand);
  //  console.log(`Successfully recorded ${memeIDs.length} new meme views for ${userEmail}`);
  } catch (error) {
    console.error('Error recording meme views:', error);
  }
}

async function getCachedMemeData(memeID) {
  const memeKey = `meme:${memeID}`;
  let memeData = await redis.hgetall(memeKey);
  if (Object.keys(memeData).length === 0) {
    const memeParams = {
      TableName: 'Memes',
      Key: { MemeID: memeID }
    };
    const { Item } = await docClient.send(new GetCommand(memeParams));
    if (Item) {
      memeData = {
        memeID: Item.MemeID,
        email: Item.Email,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${Item.MemeID}`,
        uploadTimestamp: Item.UploadTimestamp,
        username: Item.Username,
        caption: Item.Caption,
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
  }
  return memeData;
}

async function getCachedFollowStatus(userEmail, followeeID) {
  const followStatusKey = `followStatus:${userEmail}:${followeeID}`;
  let status = await redis.get(followStatusKey);
  if (status === null) {
    const followStatus = await batchCheckFollowStatus(userEmail, [followeeID]);
    status = followStatus[followeeID];
    await redis.set(followStatusKey, status ? '1' : '0');
    await redis.expire(followStatusKey, FOLLOW_STATUS_EXPIRATION);
  }
  return status === '1';
}

exports.handler = async (event) => {
 //   console.log('Received event:', JSON.stringify(event, null, 2));
 // console.log('Headers:', JSON.stringify(event.headers, null, 2));
 //console.log('Processing operation:', event.operation);
//console.log('Request body:', JSON.stringify(event.body));
    console.log('Handler started');
    try {
      console.log('Testing Redis connection');
      const redisConnected = await testRedisConnection();
      console.log('Redis connection test result:', redisConnected);
      if (!redisConnected) {
        console.error('Redis connection failed');
        return createResponse(500, 'Internal Server Error - Redis connection failed');
      }
      let requestBody;
      if (event.body) {
        requestBody = JSON.parse(event.body);
      } else if (event.operation) {
        requestBody = event;
      } else {
        return createResponse(400, 'No valid request body or operation found');
      }
  
      const { operation } = requestBody;
    //  console.log('Received event:', JSON.stringify(event, null, 2));
   //   console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));

  // List of operations that don't require authentication
  const publicOperations = ['fetchMemes','requestDataArchive','getLikeStatus','recordMemeView'];

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

    
    case 'fetchMemes': {
      const { lastViewedMemeId, userEmail, limit = 5 } = requestBody;
      if (!userEmail) {
        return createResponse(400, 'userEmail is required.');
      }
      console.time('fetchMemes');
      try {
        const redisKey = `viewedMemes:${userEmail}`;
        let viewedMemeIDs = new Set(await redis.smembers(redisKey));

        if (viewedMemeIDs.size === 0) {
          console.log('Cache miss: Fetching viewed memes from DynamoDB');
        } else {
          console.log(`Cache hit: Found ${viewedMemeIDs.size} viewed memes in Redis`);
        }
        
        let queryParams = {
          TableName: 'Memes',
          IndexName: 'ByStatusAndTimestamp',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: { '#status': 'Status' },
          ExpressionAttributeValues: { ':status': 'active' },
          ScanIndexForward: false,
          Limit: 100
        };
    
        if (lastViewedMemeId) {
          const lastViewedMeme = await getCachedMemeData(lastViewedMemeId);
          if (lastViewedMeme) {
            queryParams.ExclusiveStartKey = { 
              Status: 'active',
              UploadTimestamp: lastViewedMeme.uploadTimestamp,
              MemeID: lastViewedMemeId
            };
          }
        }
    
        let unseenMemes = [];
        while (unseenMemes.length < limit) {
          const result = await docClient.send(new QueryCommand(queryParams));
          const newUnseenMemes = result.Items.filter(meme => !viewedMemeIDs.has(meme.MemeID));
          unseenMemes = [...unseenMemes, ...newUnseenMemes];
          if (!result.LastEvaluatedKey || unseenMemes.length >= limit) break;
          queryParams.ExclusiveStartKey = result.LastEvaluatedKey;
        }
    
        const memes = await Promise.all(unseenMemes.slice(0, limit).map(async (item) => {
          const memeData = await getCachedMemeData(item.MemeID);
          const isFollowed = item.Email !== userEmail ? await getCachedFollowStatus(userEmail, item.Email) : null;
          return { ...memeData, isFollowed };
        }));
    
        // Update viewed memes in Redis
        await redis.sadd(redisKey, ...memes.map(meme => meme.memeID));
        await redis.expire(redisKey, VIEWED_MEMES_EXPIRATION);
    
        // Record meme views in DynamoDB
        await recordMemeViews(userEmail, memes.map(meme => meme.memeID));
        console.timeEnd('fetchMemes');
        return createResponse(200, 'Memes retrieved successfully.', {
          memes,
          lastEvaluatedKey: queryParams.ExclusiveStartKey ? JSON.stringify(queryParams.ExclusiveStartKey) : null
        });
      } catch (error) {
        console.error('Error fetching memes:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message, stack: error.stack });
      }
    }

    case 'getLikeStatus': {
      console.log('Entering getLikeStatus case');
      const { memeID, userEmail } = requestBody;
      console.log('memeID:', memeID, 'userEmail:', userEmail);
      if (!memeID || !userEmail) {
      console.error('Invalid request parameters:', { memeID, userEmail });
      return createResponse(400, 'memeID and userEmail are required.');
      }
      try {
      //  console.log(`Getting like status for memeID: ${memeID}, userEmail: ${userEmail}`);

      // First, try to get the meme from the Memes table
      const memeParams = {
        TableName: 'Memes',
        Key: {
          MemeID: memeID
        }
      };

      console.log('Fetching meme from cache or DynamoDB');
      let memeItem = await getCachedMemeData(memeID);
      console.log('Meme item fetched:', memeItem ? 'Found' : 'Not Found');

      if (!memeItem) {
        // Meme doesn't exist in DynamoDB, let's create it
        const newMemeParams = {
          TableName: 'Memes',
          Item: {
            MemeID: memeID,
            Email: 'pope.dawson@gmail.com', // Set to your email as the default creator
            UploadTimestamp: new Date().toISOString(),
            LikeCount: 0,
            ShareCount: 0,
            CommentCount: 0,
            DownloadsCount: 0,
            Username: 'Admin',
            ProfilePicUrl: 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/pope.dawson@gmail.com-profilePic-1719862276108.jpg',
            mediaType: memeID.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
            MemeURL: `https://jestr-bucket.s3.amazonaws.com/${memeID}`
          }
        };
        await docClient.send(new PutCommand(newMemeParams));
      //   console.log('Created new meme entry in DynamoDB');
        memeItem = newMemeParams.Item;
      }

      // Now, get the like status from the UserLikes table
      const userLikeParams = {
        TableName: 'UserLikes',
        Key: {
          email: userEmail,
          MemeID: memeID
        }
      };

      const { Item: userLikeItem } = await docClient.send(new GetCommand(userLikeParams));

      const likeStatus = {
        liked: userLikeItem ? userLikeItem.Liked : false,
        doubleLiked: userLikeItem ? userLikeItem.DoubleLiked : false,
      };

      // Combine meme info with like status
      const response = {
        ...memeItem,
        ...likeStatus
      };

      // console.log('Response:', response);

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
          const userMemesResult = await getUserMemes(email);
      
          // Prepare data for archive
          const userData = {
            email: email,
            memes: userMemesResult.memes,

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
      
          // Return the URL in the response
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

      const now = new Date();
      const batchWriteParams = {
        RequestItems: {
          'UserViewHistory': memeViews.map(view => {
            const uniqueMemeIDs = Array.from(new Set(view.memeIDs)); // Deduplicate Meme IDs
            return {
              PutRequest: {
                Item: {
                  email: view.email,
                  Timestamp: now.toISOString(),
                  MemeIDs: uniqueMemeIDs, // Ensure this is a unique array
                  ViewTimestamp: now.toISOString(),
                  expirationTime: Math.floor(now.getTime() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
                }
              }
            };
          })
        }
      };


      await docClient.send(new BatchWriteCommand(batchWriteParams));
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