const AWS = require('@aws-sdk/client-dynamodb');
const { S3 } = require('@aws-sdk/client-s3');

const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  BatchWriteCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient, BatchGetItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

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

function generateAccessToken() {
  // Generate 32 random bytes and convert to a hex string
  return crypto.randomBytes(32).toString('hex');
}

const uploadToS3 = async (base64Data, key, contentType, bucketName) => {
  if (typeof key !== 'string') {
    console.error('Invalid key type:', typeof key);
    throw new Error('Invalid key type for S3 upload');
  }

  // Remove the "data:image/jpeg;base64," prefix if present
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Image, 'base64');

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  try {
   // console.log('S3 upload params:', JSON.stringify({ ...params, Body: 'BINARY_DATA' }));
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
  //  console.log('S3 upload result:', JSON.stringify(result));
    return `https://${bucketName}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error in uploadToS3:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};


const getUser = async (identifier) => {
 // console.log(`Attempting to fetch user with identifier: ${identifier}`);
  const getParams = {
    TableName: 'Profiles',
    Key: { email: identifier },  // Assuming email is the primary key
  };
  try {
 //   console.log('GetCommand params:', JSON.stringify(getParams, null, 2));
    const { Item } = await docClient.send(new GetCommand(getParams));
    if (Item) {
  //    console.log('User found:', JSON.stringify(Item, null, 2));
      return Item;
    } else {
  //    console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};



const updateUserProfile = async (email, username, profilePicUrl, displayName, bio, lastLogin, headerPicUrl, accessToken) => {
  const updateParams = {
    TableName: 'Profiles',
    Key: { email: email },
    UpdateExpression: "set username = :username, profilePic = :profilePic, displayName = :displayName, bio = :bio, headerPic = :headerPic, LastLogin = :lastLogin, accessToken = :accessToken",
    ExpressionAttributeValues: {
      ':username': username,
      ':profilePic': profilePicUrl,
      ':displayName': displayName,
      ':bio': bio,
      ':headerPic': headerPicUrl,
      ':lastLogin': lastLogin,
      ':accessToken': accessToken,
    },
  };

  try {
    await docClient.send(new UpdateCommand(updateParams));
    //console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

const batchCheckFollowStatus = async (followerId, followeeIDs) => {
  const batchGetParams = {
    RequestItems: {
      'UserRelationships': {
        Keys: followeeIDs.map(followeeId => ({
          UserID: { S: followerId },
          RelationUserID: { S: followeeId }
        })),
        ProjectionExpression: 'RelationUserID'
      }
    }
  };

  try {
    const { Responses } = await docClient.send(new BatchGetItemCommand(batchGetParams));
    const followStatuses = {};

    if (Responses && Responses.UserRelationships) {
      // Initialize all followees as not followed
      followeeIDs.forEach(followeeId => {
        followStatuses[followeeId] = false;
      });

      // Update status for found relationships
      Responses.UserRelationships.forEach(item => {
        if (item.RelationUserID && item.RelationUserID.S) {
          followStatuses[item.RelationUserID.S] = true;
        }
      });
    } else {
      console.warn('No UserRelationships found in batchGet response');
      // Initialize all as not followed if no relationships found
      followeeIDs.forEach(followeeId => {
        followStatuses[followeeId] = false;
      });
    }

    return followStatuses;
  } catch (error) {
    console.error('Error checking batch follow status:', error);
    throw error;
  }
};

const addFollow = async (followerId, followeeId) => {
  if (followerId === followeeId) {
  //  console.log('User attempted to follow themselves');
    return { success: false, message: 'Users cannot follow themselves' };
  }

  const followParams = {
    TableName: 'UserRelationships',
    Item: {
      UserID: followerId,
      RelationUserID: followeeId,
      RelationshipType: 'follows'
    }
  };

  const updateFollowerParams = {
    TableName: 'Profiles',
    Key: { email: followeeId },
    UpdateExpression: 'SET FollowersCount = if_not_exists(FollowersCount, :zero) + :inc',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1
    }
  };

  const updateFollowingParams = {
    TableName: 'Profiles',
    Key: { email: followerId },
    UpdateExpression: 'SET FollowingCount = if_not_exists(FollowingCount, :zero) + :inc',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':inc': 1
    }
  };

 try {
    await docClient.send(new PutCommand(followParams));
    await docClient.send(new UpdateCommand(updateFollowerParams));
    await docClient.send(new UpdateCommand(updateFollowingParams));
   // console.log('Follow added successfully and counts updated');
    return { success: true, message: 'Follow added successfully' };
  } catch (error) {
    console.error('Error adding follow or updating counts:', error);
    throw error;
  }
};

const removeFollow = async (followerId, followeeId) => {
  const unfollowParams = {
    TableName: 'UserRelationships',
    Key: {
      UserID: followerId,
      RelationUserID: followeeId
    }
  };

  const updateFollowerParams = {
    TableName: 'Profiles',
    Key: { email: followeeId },
    UpdateExpression: 'SET FollowersCount = if_not_exists(FollowersCount, :zero) - :dec',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':dec': 1
    },
    ConditionExpression: 'FollowersCount > :zero'
  };

  const updateFollowingParams = {
    TableName: 'Profiles',
    Key: { email: followerId },
    UpdateExpression: 'SET FollowingCount = if_not_exists(FollowingCount, :zero) - :dec',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':dec': 1
    },
    ConditionExpression: 'FollowingCount > :zero'
  };

  try {
    await docClient.send(new DeleteCommand(unfollowParams));
    await docClient.send(new UpdateCommand(updateFollowerParams));
    await docClient.send(new UpdateCommand(updateFollowingParams));
  //  console.log('Unfollowed successfully and counts updated');
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
   //   console.log('Follow counts already at zero, no update needed');
    } else {
      console.error('Error removing follow or updating counts:', error);
      throw error;
    }
  }
};

// Function to get all users a user is following
const getFollowing = async (userId) => {
  const queryParams = {
    TableName: 'UserRelationships',
    KeyConditionExpression: 'UserID = :userId',
    FilterExpression: 'RelationshipType = :type',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':type': 'follows'
    }
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(queryParams));
    return Items.map(item => item.RelationUserID); // Return list of UserIDs that the given user is following
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

// Function to get all followers of a user
const getFollowers = async (userId) => {
  const scanParams = {
    TableName: 'UserRelationships',
    FilterExpression: 'RelationUserID = :userId AND RelationshipType = :type',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':type': 'follows'
    }
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(scanParams));
    return Items.map(item => item.UserID); // Return list of UserIDs who follow the given user
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

// Function to check if one user follows another
const checkFollowStatus = async (followerId, followeeId) => {
  // First, check if the user is trying to follow themselves
  if (followerId === followeeId) {
  //  console.log('User attempted to follow themselves');
    return { isFollowing: false, canFollow: false };
  }

  const queryParams = {
    TableName: 'UserRelationships',
    KeyConditionExpression: 'UserID = :followerId AND RelationUserID = :followeeId',
    ExpressionAttributeValues: {
      ':followerId': followerId,
      ':followeeId': followeeId
    },
    Limit: 1
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(queryParams));
    return { isFollowing: Items.length > 0, canFollow: true };
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

// Function to record a share
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

exports.handler = async (event) => {
 //   console.log('Received event:', JSON.stringify(event, null, 2));
 // console.log('Headers:', JSON.stringify(event.headers, null, 2));
 // console.log('Body:', event.body);
    try {
      // Parse the event body and extract the operation
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
  const publicOperations = [
    'signup',
    'signin',
    'uploadMeme',
    'getPopularMemes',
    'getUser',
    'fetchMemes',
    'getTotalUsers',
    'getTotalMemes',
    'updateBio',
    'sendMessage',
    'getMessages',
    'getConversations',
    'getAllUsers',
    'getLikeStatus',
    'getUserMemes',
    'addFollow',
    'removeFollow',
    'getFollowing',
    'fetchLikedMemes',
    'fetchDownloadedMemes',
    'updateProfileImage',
    'checkFollowStatus',
    'fetchViewHistory',
    'getFollowers',
    'getDAU',
    'getUser',
    'getUserGrowthRate',
    'shareMeme',
    'postComment',
    'updateCommentReaction',
    'getComments',
    'updateUserProfile',
    'completeProfile',
    'updateMemeReaction',
    'recordMemeView',
    'getPresignedUrl',
    'removeDownloadedMeme',
    'deleteMeme',
  ];

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

    case 'uploadMeme': {
      const { email, username, caption, tags, mediaType, memeKey } = requestBody;
      if (!email || !username || !mediaType || !memeKey) {
        return createResponse(400, 'Email, username, media type, and meme key are required.');
      }
    
      try {
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
            mediaType: mediaType
          },
        };
        await docClient.send(new PutCommand(memeMetadataParams));
   //     console.log('Meme metadata stored successfully in DynamoDB');
        return createResponse(200, 'Meme metadata processed successfully.', { url: `https://${BUCKET_NAME}.s3.amazonaws.com/${memeKey}` });
      } catch (error) {
        console.error('Error storing meme metadata in DynamoDB:', error);
        return createResponse(500, `Failed to store meme metadata: ${error.message}`);
      }
    }
    
    case 'getPresignedUrl': {
  //    console.log('Entering getPresignedUrl case');
      const { fileName, fileType } = requestBody;
  //    console.log('Received request for:', { fileName, fileType });
      
      const fileKey = `Memes/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType
      });
    
      try {
   //     console.log('Generating presigned URL with params:', { Bucket: BUCKET_NAME, Key: fileKey, ContentType: fileType });
        const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
   //     console.log('Generated presigned URL:', uploadURL);
        return createResponse(200, 'Presigned URL generated successfully', { uploadURL, fileKey });
      } catch (error) {
   //     console.error('Error generating presigned URL:', error);
        return createResponse(500, 'Failed to generate presigned URL', { error: error.message });
      }
    }
    
    case 'fetchMemes': {
      const { lastEvaluatedKey, limit = 5, userEmail } = requestBody;
      
      try {
        // First, get the memes the user has already seen
        const userViewsParams = {
          TableName: 'UserViewHistory',
          IndexName: 'email-Timestamp-index',
          KeyConditionExpression: 'email = :email AND #ts > :timestamp',
          ExpressionAttributeNames: {
            '#ts': 'Timestamp'
          },
          ExpressionAttributeValues: {
            ':email': userEmail,
            ':timestamp': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
          },
          ProjectionExpression: 'MemeID'
        };
        
        const userViewsResult = await docClient.send(new QueryCommand(userViewsParams));
        const seenMemeIDs = new Set(userViewsResult.Items.map(item => item.MemeID));
    
        let unseenMemes = [];
        let lastEvaluatedKeyForMemes = lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined;
        let attempts = 0;
        const maxAttempts = 10;
    
        while (unseenMemes.length < limit && attempts < maxAttempts) {
          attempts++;
    
          const memesParams = {
            TableName: 'Memes',
            Limit: 100,
            ExclusiveStartKey: lastEvaluatedKeyForMemes
          };
          
          const result = await docClient.send(new ScanCommand(memesParams));
    
          const newUnseenMemes = result.Items.filter(meme => !seenMemeIDs.has(meme.MemeID));
          unseenMemes = [...unseenMemes, ...newUnseenMemes];
     
          lastEvaluatedKeyForMemes = result.LastEvaluatedKey;
          
          if (!lastEvaluatedKeyForMemes) {
            console.log('No more memes to fetch');
            break;
          }
        }
    
        // Map the memes to the desired format
        const memes = unseenMemes.slice(0, limit).map(item => ({
          memeID: item.MemeID,
          email: item.Email,
          url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.MemeID}`,
          uploadTimestamp: item.UploadTimestamp,
          username: item.Username,
          caption: item.Caption,
          likeCount: item.LikeCount || 0,
          downloadCount: item.DownloadsCount || 0,
          commentCount: item.CommentCount || 0,
          shareCount: item.ShareCount || 0,
          profilePicUrl: item.ProfilePicUrl || '',
          mediaType: item.MemeID.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
          memeUser: {
            email: item.Email,
            username: item.Username,
            profilePic: item.ProfilePicUrl || '',
            displayName: item.Username,
            headerPic: '',
            creationDate: item.UploadTimestamp
          }
        }));
    
      //  console.log('Number of memes being returned:', memes.length);
    
        return createResponse(200, 'Memes retrieved successfully.', {
          memes: memes,
          lastEvaluatedKey: lastEvaluatedKeyForMemes ? JSON.stringify(lastEvaluatedKeyForMemes) : null
        });
      } catch (error) {
        console.error('Error fetching memes:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message, stack: error.stack });
      }
    }

    case 'getUser': {
   //   console.log('getUser operation triggered');
      const { identifier } = requestBody;
   //   console.log('Identifier:', identifier);
      if (!identifier) {
  //      console.log('Identifier not provided in request');
        return createResponse(400, 'Identifier is required for getting user details.');
      }
      try {
        const user = await getUser(identifier);
        if (user) {
    //      console.log('User retrieved:', JSON.stringify(user, null, 2));
          return createResponse(200, 'User details retrieved successfully.', user);
        } else {
          return createResponse(404, 'User not found');
        }
      } catch (error) {
        console.error(`Error getting user details: ${error}`);
        return createResponse(500, 'Failed to get user details.');
      }
    }
    
    case 'updateBio': {
      const { email, bio } = requestBody;
 //     console.log('Updating bio for email:', email);
 //     console.log('New bio:', bio);

      if (!email || bio === undefined) {
        return createResponse(400, 'Email and bio are required for updating bio.');
      }

      const updateParams = {
        TableName: 'Profiles',
        Key: { email: email },
        UpdateExpression: 'set bio = :b, Bio = :b',
        ExpressionAttributeValues: {
          ':b': bio
        },
        ReturnValues: 'UPDATED_NEW'
      };

      try {
        const result = await docClient.send(new UpdateCommand(updateParams));
 //       console.log('Bio updated successfully:', JSON.stringify(result, null, 2));
        return createResponse(200, 'Bio updated successfully.', { data: { updatedBio: bio } });
      } catch (error) {
        console.error('Error updating bio:', error);
        return createResponse(500, 'Failed to update bio.');
      }
    }

    case 'deleteMeme': {
      const { memeID, userEmail } = requestBody;
      if (!memeID || !userEmail) {
        return createResponse(400, 'MemeID and userEmail are required for deleting a meme.');
      }
    
      try {
        // First, check if the user is the owner of the meme
        const getMemeParams = {
          TableName: 'Memes',
          Key: { MemeID: memeID },
        };
    
        const memeData = await docClient.send(new GetCommand(getMemeParams));
        if (!memeData.Item || memeData.Item.Email !== userEmail) {
          return createResponse(403, 'You are not authorized to delete this meme');
        }
    
        // If the user is the owner, proceed with deletion
        const deleteParams = {
          TableName: 'Memes',
          Key: { MemeID: memeID },
        };
    
        await docClient.send(new DeleteCommand(deleteParams));
    
        return createResponse(200, 'Meme deleted successfully');
      } catch (error) {
        console.error('Error deleting meme:', error);
        return createResponse(500, 'Error deleting meme');
      }
    }
    
    case 'removeDownloadedMeme': {
      const { userEmail, memeID } = requestBody;
      if (!userEmail || !memeID) {
        return createResponse(400, 'UserEmail and memeID are required for removing a downloaded meme.');
      }
    
      try {
        const params = {
          TableName: 'UserDownloads',
          Key: {
            email: userEmail,
            MemeID: memeID,
          },
        };
    
        await docClient.send(new DeleteCommand(params));
        return createResponse(200, 'Downloaded meme removed successfully');
      } catch (error) {
        console.error('Error removing downloaded meme:', error);
        return createResponse(500, 'Error removing downloaded meme');
      }
    }
    
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

  case 'getAllUsers': {
  const params = {
    TableName: 'Profiles',
    ProjectionExpression: 'email, username, profilePic'
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    const users = Items.map(item => ({
      email: item.email,
      username: item.username,
      profilePic: item.profilePic
    }));
    return createResponse(200, 'Users retrieved successfully.', users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return createResponse(500, 'Failed to fetch users.');
  }
}
    
case 'getLikeStatus': {
  const { memeID, userEmail } = requestBody;
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
    
    let { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
    
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

case 'getUserMemes': {
  const { email } = requestBody;
  if (!email) {
    return createResponse(400, 'Email is required to fetch user memes.');
  }

  const queryParams = {
    TableName: 'Memes',
    IndexName: 'Email-UploadTimestamp-index', // Assuming you have a GSI on Email and UploadTimestamp
    KeyConditionExpression: 'Email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    ScanIndexForward: false, // to get the latest memes first
    Limit: 50 // Limit the results to 50 items
  };

  try {
    const { Items, LastEvaluatedKey } = await docClient.send(new QueryCommand(queryParams));
    const userMemes = Items.map(item => ({
      memeID: item.MemeID,
      caption: item.Caption,
      url: item.MemeURL,
      uploadTimestamp: item.UploadTimestamp,
      likeCount: item.LikeCount || 0,
      downloadCount: item.DownloadsCount || 0,
      commentCount: item.CommentCount || 0,
      shareCount: item.ShareCount || 0
    }));
    return createResponse(200, 'User memes retrieved successfully.', {
      memes: userMemes,
      lastEvaluatedKey: LastEvaluatedKey || null
    });
  } catch (error) {
    console.error('Error fetching user memes:', error);
    return createResponse(500, 'Failed to fetch user memes.');
  }
}

  case 'addFollow':
 // console.log('Entered addFollow case');
  const { followerId, followeeId } = requestBody;
  if (!followerId || !followeeId) {
    return createResponse(400, 'followerId and followeeId are required.');
  }
  try {
    await (async () => {
      await addFollow(followerId, followeeId);
    })();
    return createResponse(200, 'Follow added successfully.');
  } catch (error) {
      console.error('Error adding Follow', error);
    return createResponse(500, 'Failed to add follow.');
  }
  
  case 'removeFollow':
    const { unfollowerId, unfolloweeId } = requestBody;
    if (!unfollowerId || !unfolloweeId) {
      return createResponse(400, 'unfollowerId and unfolloweeId are required.');
    }
    try {
      await removeFollow(unfollowerId, unfolloweeId);
      return createResponse(200, 'Unfollowed successfully.');
    } catch (error) {
        console.error('Error ', error);
      return createResponse(500, 'Failed to remove follow.');
    }

  case 'getFollowing':
  const { userId } = requestBody;
  if (!userId) {
    return createResponse(400, 'userId is required.');
  }
  try {
    const following = await getFollowing(userId);
    return createResponse(200, 'Following retrieved successfully.', following);
  } catch (error) {
      console.error('Error ', error);
    return createResponse(500, 'Failed to get following.');
  }
  
case 'fetchLikedMemes': {
    const { email, lastEvaluatedKey, limit = 10 } = requestBody;
    if (!email) {
        console.error('Email is required to fetch liked memes.');
        return createResponse(400, 'Email is required to fetch liked memes.');
    }
    
    const queryParams = {
        TableName: 'UserLikes',
        IndexName: 'email-Timestamp-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email,
        },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
    };
    
    try {
     //   console.log('Querying UserLikes with params:', queryParams);
        const result = await docClient.send(new QueryCommand(queryParams));
     //   console.log('UserLikes query result:', result);

        // Fetch additional meme details
      const memeDetails = await Promise.all(result.Items.map(async (item) => {
        const memeParams = {
            TableName: 'Memes',
            Key: { MemeID: item.MemeID }
        };
        try {
            const { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
            if (!memeItem) {
                console.warn(`Meme not found for MemeID: ${item.MemeID}`);
                return null;
            }
            return {
                ...item,
                MemeURL: memeItem.MemeURL,
                Caption: memeItem.Caption,
                LikeCount: memeItem.LikeCount || 0,
                DownloadsCount: memeItem.DownloadsCount || 0,
                CommentCount: memeItem.CommentCount || 0,
                ShareCount: memeItem.ShareCount || 0,
                mediaType: memeItem.mediaType || 'image' // Add this line
            };
        } catch (memeError) {
            console.error(`Error fetching meme details for MemeID: ${item.MemeID}`, memeError);
            return null;
        }
    }));

        const validMemeDetails = memeDetails.filter(meme => meme !== null);
   //     console.log('Valid meme details:', validMemeDetails);

        return createResponse(200, 'Liked memes retrieved successfully.', {
            data: {
                memes: validMemeDetails,
                lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
            }
        });
    } catch (error) {
        console.error('Error fetching liked memes:', error);
        return createResponse(500, 'Failed to fetch liked memes.');
    }
}

case 'fetchDownloadedMemes': {
  const { email, lastEvaluatedKey, limit = 10 } = requestBody;
  if (!email) {
    return createResponse(400, 'Email is required to fetch downloaded memes.');
  }
  const queryParams = {
    TableName: 'UserDownloads',
    IndexName: 'email-Timestamp-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
  };
  try {
    const result = await docClient.send(new QueryCommand(queryParams));
    if (!result.Items || result.Items.length === 0) {
      return createResponse(200, 'No downloaded memes found.', { data: { memes: [], lastEvaluatedKey: null } });
    }
    // Fetch additional meme details
   const memeDetails = await Promise.all(result.Items.map(async (item) => {
        const memeParams = {
            TableName: 'Memes',
            Key: { MemeID: item.MemeID }
        };
        try {
            const { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
            if (!memeItem) {
                console.warn(`Meme not found for MemeID: ${item.MemeID}`);
                return null;
            }
            return {
                ...item,
                MemeURL: memeItem.MemeURL,
                Caption: memeItem.Caption,
                LikeCount: memeItem.LikeCount || 0,
                DownloadsCount: memeItem.DownloadsCount || 0,
                CommentCount: memeItem.CommentCount || 0,
                ShareCount: memeItem.ShareCount || 0,
                mediaType: memeItem.mediaType || 'image' // Add this line
            };
        } catch (memeError) {
            console.error(`Error fetching meme details for MemeID: ${item.MemeID}`, memeError);
            return null;
        }
    }));
    const validMemeDetails = memeDetails.filter(meme => meme !== null);
    return createResponse(200, 'Downloaded memes retrieved successfully.', {
      data: {
        memes: validMemeDetails,
        lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
      }
    });
  } catch (error) {
    console.error('Error fetching downloaded memes:', error);
    return createResponse(500, 'Failed to fetch downloaded memes.');
  }
}
  case 'updateProfileImage': {
  //  console.log('Entering updateProfileImage case');
    const { email, imageType, image } = requestBody;
    if (!email || !imageType || !image) {
      console.error('Missing required fields for updateProfileImage');
      return createResponse(400, 'Email, imageType, and image are required for updating profile image.');
    }
  
    try {
console.log(`Updating ${imageType} image for ${email}`);
      const imageBuffer = Buffer.from(image, 'base64');
  
      let newImageUrl;
      if (imageType === 'profile') {
       const profilePicKey = `${email}-profilePic-${Date.now()}.jpg`;
        await uploadToS3(imageBuffer, profilePicKey, 'ProfilePictures');
        newImageUrl = `https://jestr-bucket.s3.amazonaws.com/ProfilePictures/${profilePicKey}`;
      } else if (imageType === 'header') {
        const headerPicKey = `${email}-headerPic-${Date.now()}.jpg`;
        await uploadToS3(imageBuffer, headerPicKey, 'HeaderPictures');
        newImageUrl = 'https://jestr-bucket.s3.amazonaws.com/HeaderPictures/${headerPicKey}';
      } else {
        throw new Error('Invalid image type');
      }
  
   //   console.log('New image URL:', newImageUrl);
  
      // Update user profile
      const updateProfileParams = {
        TableName: 'Profiles',
        Key: { email },
        UpdateExpression: 'SET #imagePic = :url',
        ExpressionAttributeNames: {
          '#imagePic': `${imageType}Pic`
        },
        ExpressionAttributeValues: {
          ':url': newImageUrl
        },
        ReturnValues: 'ALL_NEW'
      };
  
  //    console.log('DynamoDB update params for profile:', JSON.stringify(updateProfileParams));
      const updateProfileResult = await docClient.send(new UpdateCommand(updateProfileParams));
  //    console.log('DynamoDB update result for profile:', JSON.stringify(updateProfileResult));
  
      // If it's a profile picture update, we need to update all memes
      if (imageType === 'profile') {
        // Query all memes by this user
        const queryMemesParams = {
          TableName: 'Memes',
          IndexName: 'Email-UploadTimestamp-index', // Assuming you have this GSI
          KeyConditionExpression: 'Email = :email',
          ExpressionAttributeValues: {
            ':email': email
          }
        };
  
        const memesResult = await docClient.send(new QueryCommand(queryMemesParams));
        
        // Update ProfilePicUrl for each meme
        for (const meme of memesResult.Items) {
          const updateMemeParams = {
            TableName: 'Memes',
            Key: { MemeID: meme.MemeID },
            UpdateExpression: 'SET ProfilePicUrl = :newUrl',
            ExpressionAttributeValues: {
              ':newUrl': newImageUrl
            }
          };
          await docClient.send(new UpdateCommand(updateMemeParams));
        }
      }
  
      // Verify the profile update
      const getParams = { TableName: 'Profiles', Key: { email } };
      const { Item } = await docClient.send(new GetCommand(getParams));
    //  console.log('Updated user profile:', JSON.stringify(Item));
  
      return createResponse(200, 'Profile image updated successfully.', { [imageType + 'Pic']: newImageUrl });
    } catch (error) {
      console.error('Error updating profile image:', error);
      return createResponse(500, 'Failed to update profile image.');
    }
  }
  
  case 'checkFollowStatus': {
    const { followerId, followeeId } = requestBody;
    if (!followerId || !followeeId) {
      return createResponse(400, 'followerId and followeeId are required.');
    }
    try {
      const followStatus = await checkFollowStatus(followerId, followeeId);
      return createResponse(200, 'Follow status checked successfully.', followStatus);
    } catch (error) {
      console.error(`Error checking follow status: ${error}`);
      return createResponse(500, 'Failed to check follow status.');
    }
  }
  
case 'fetchViewHistory': {
  const { email, lastEvaluatedKey, limit = 50 } = requestBody;
  if (!email) {
    console.error('Email is required to fetch view history.');
    return createResponse(400, 'Email is required to fetch view history.');
  }

  const queryParams = {
    TableName: 'UserViewHistory',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
  };

  try {
   // console.log('Querying UserViewHistory with params:', queryParams);
    const result = await docClient.send(new QueryCommand(queryParams));
   // console.log('UserViewHistory query result:', result);

    if (!result.Items || result.Items.length === 0) {
      return createResponse(200, 'No view history found.', { data: { memes: [], lastEvaluatedKey: null } });
    }

    // Fetch additional meme details
    const memeDetails = await Promise.all(result.Items.map(async (item) => {
        const memeParams = {
            TableName: 'Memes',
            Key: { MemeID: item.MemeID }
        };
        try {
            const { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
            if (!memeItem) {
                console.warn(`Meme not found for MemeID: ${item.MemeID}`);
                return null;
            }
            return {
                ...memeItem,
                viewedAt: item.Timestamp,
                mediaType: memeItem.mediaType || 'image' // Add this line
            };
        } catch (memeError) {
            console.error(`Error fetching meme details for MemeID: ${item.MemeID}`, memeError);
            return null;
        }
    }));


    const validMemeDetails = memeDetails.filter(meme => meme !== null);
   // console.log('Valid meme details:', validMemeDetails);

    return createResponse(200, 'View history retrieved successfully.', {
      data: {
        memes: validMemeDetails,
        lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
      }
    });
  } catch (error) {
    console.error('Error fetching view history:', error);
    return createResponse(500, 'Failed to fetch view history.');
  }
}

case 'getFollowers': {
  const { userId } = requestBody;
  if (!userId) {
    return createResponse(400, 'userId is required.');
  }
  try {
    const followers = await getFollowers(userId);
    return createResponse(200, 'Followers retrieved successfully.', followers);
  } catch (error) {
    console.error('Error getting followers:', error);
    return createResponse(500, 'Failed to get followers.');
  }
}

case 'getTotalUsers':
  try {
    const params = {
      TableName: 'Profiles',
      Select: 'COUNT'
    };
    const result = await docClient.send(new ScanCommand(params));
    return createResponse(200, 'Total users retrieved successfully.', { totalUsers: result.Count });
  } catch (error) {
    console.error('Error getting total users:', error);
    return createResponse(500, 'Failed to get total users');
  }

case 'getTotalMemes':
  try {
    const params = {
      TableName: 'Memes',
      Select: 'COUNT'
    };
    const result = await docClient.send(new ScanCommand(params));
    return createResponse(200, 'Total memes retrieved successfully.', { totalMemes: result.Count });
  } catch (error) {
    console.error('Error getting total memes:', error);
    return createResponse(500, 'Failed to get total memes');
  }

case 'getDAU':
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTimestamp = yesterday.toISOString();

    const params = {
      TableName: 'UserViewHistory',
      FilterExpression: '#ts > :yesterday',
      ExpressionAttributeNames: {
        '#ts': 'ViewTimestamp'
      },
      ExpressionAttributeValues: {
        ':yesterday': yesterdayTimestamp
      },
      Select: 'COUNT'
    };
    const result = await docClient.send(new ScanCommand(params));
    return createResponse(200, 'Daily active users retrieved successfully.', { dailyActiveUsers: result.Count });
  } catch (error) {
    console.error('Error getting DAU:', error);
    return createResponse(500, 'Failed to get DAU');
  }
  
case 'getPopularMemes':
  try {
   // console.log('Attempting to get popular memes');
    const params = {
      TableName: 'Memes',
      IndexName: 'LikeCount-index',
      Limit: 100,  // Increase this if necessary to ensure we get enough items to sort
      ScanIndexForward: false
    };
   // console.log('Scan params:', JSON.stringify(params));
    const result = await docClient.send(new ScanCommand(params));
  //  console.log('Scan result:', JSON.stringify(result));

    // Sort the results by LikeCount in descending order and take the top 5
    const sortedMemes = result.Items.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0)).slice(0, 5);

    return createResponse(200, 'Popular memes retrieved successfully.', { popularMemes: sortedMemes });
  } catch (error) {
    console.error('Error getting popular memes:', error);
    return createResponse(500, 'Failed to get popular memes', { error: error.message });
  }
  
case 'getUserGrowthRate':
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const paramsToday = {
      TableName: 'Profiles',
      Select: 'COUNT'
    };
    const paramsLastWeek = {
      TableName: 'Profiles',
      FilterExpression: '#cd <= :lastWeek',
      ExpressionAttributeNames: {
        '#cd': 'creationDate'
      },
      ExpressionAttributeValues: {
        ':lastWeek': lastWeek.toISOString()
      },
      Select: 'COUNT'
    };
    
    const [resultToday, resultLastWeek] = await Promise.all([
      docClient.send(new ScanCommand(paramsToday)),
      docClient.send(new ScanCommand(paramsLastWeek))
    ]);
    
    const growthRate = resultLastWeek.Count === 0 
      ? 100  // If there were no users last week, set growth rate to 100%
      : ((resultToday.Count - resultLastWeek.Count) / resultLastWeek.Count) * 100;
    
    return createResponse(200, 'User growth rate calculated successfully.', { userGrowthRate: growthRate.toFixed(2) });
  } catch (error) {
    console.error('Error calculating user growth rate:', error);
    return createResponse(500, 'Failed to calculate user growth rate');
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

    case 'updateUserProfile': {
      const { email, username, displayName, bio, profilePic, headerPic, lastLogin } = requestBody;
      if (!email || !username || !displayName) {
        return createResponse(400, 'Email, username, and display name are required for updating the user profile.');
      }

      let updateExpression = 'set username = :username, displayName = :displayName';
      let expressionAttributeValues = {
        ':username': username,
        ':displayName': displayName,
      };

      if (bio) {
        updateExpression += ', bio = :bio';
        expressionAttributeValues[':bio'] = bio;
      }

      if (profilePic) {
        updateExpression += ', profilePic = :profilePic';
        expressionAttributeValues[':profilePic'] = profilePic;
      }

      if (headerPic) {
        updateExpression += ', headerPic = :headerPic';
        expressionAttributeValues[':headerPic'] = headerPic;
      }

      if (lastLogin) {
        updateExpression += ', LastLogin = :lastLogin';
        expressionAttributeValues[':lastLogin'] = lastLogin;
      }

      const updateParams = {
        TableName: 'Profiles',
        Key: { email: email },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      };

      try {
        await docClient.send(new UpdateCommand(updateParams));
     //   console.log('Profile updated successfully');
        return createResponse(200, 'User profile updated successfully.');
      } catch (error) {
        console.error('Error updating user profile:', error);
        return createResponse(500, 'Failed to update user profile.');
      }
    }

    case 'batchCheckStatus': {
      try {
        const { memeIDs, userEmail, followeeIDs } = JSON.parse(event.body);
        if (!memeIDs || !Array.isArray(memeIDs) || memeIDs.length === 0) {
          return createResponse(400, 'memeIDs is required and must be a non-empty array.');
        }
        if (!userEmail) {
          return createResponse(400, 'userEmail is required.');
        }
        if (!followeeIDs || !Array.isArray(followeeIDs) || followeeIDs.length === 0) {
          return createResponse(400, 'followeeIDs is required and must be a non-empty array.');
        }
    
        console.log('Processing batch status check:', { userEmail, followeeIDs });
        const followStatuses = await batchCheckFollowStatus(userEmail, followeeIDs);
        console.log('Batch status check successful:', { followStatuses });
        return createResponse(200, 'Batch status check successful.', {
          followStatuses
        });
      } catch (error) {
        console.error(`Error in batch status check: ${error}`);
        return createResponse(500, 'Failed to perform batch status check.', { error: error.message });
      }
    }
    

    case 'completeProfile': {
     // console.log('Received completeProfile request:', JSON.stringify(requestBody));
    
      const { email, username, profilePic, headerPic, displayName, bio } = requestBody;
    
    //  console.log('Parsed request data:', { email, username, displayName, bio });
    //  console.log('Profile pic:', profilePic ? 'Exists' : 'Not provided');
    //  console.log('Header pic:', headerPic ? 'Exists' : 'Not provided');
    
      if (!email || !username) {
        return createResponse(400, 'Email and username are required for profile completion.');
      }
    
      try {
        const bucketName = 'jestr-bucket'; // Replace with your actual S3 bucket name
        let profilePicUrl = 'https://jestr-bucket.s3.us-east-2.amazonaws.com/HeaderPictures/b%40b-headerPic.jpg';
        let headerPicUrl = 'https://jestr-bucket.s3.us-east-2.amazonaws.com/ProfilePictures/default-profile-pic.jpg';
    
        if (profilePic) {
          const profilePicKey = `ProfilePictures/${email}-${Date.now()}.jpg`;
          profilePicUrl = await uploadToS3(profilePic, profilePicKey, 'image/jpeg', bucketName);
        }
    
        if (headerPic) {
          const headerPicKey = `HeaderPictures/${email}-${Date.now()}.jpg`;
          headerPicUrl = await uploadToS3(headerPic, headerPicKey, 'image/jpeg', bucketName);
        }
    
        const creationDate = new Date().toISOString();
        const accessToken = generateAccessToken();
    
        const user = {
          email,
          username,
          profilePic: profilePicUrl,
          displayName: displayName || username,
          headerPic: headerPicUrl,
          bio: bio || '',
          CreationDate: creationDate,
          LastLogin: creationDate,
          accessToken,
          darkMode: requestBody.darkMode || false,
          likesPublic: requestBody.likesPublic || true,
          notificationsEnabled: requestBody.notificationsEnabled || true,
          userId: uuidv4(), // Generate a userId here
        };
    
        // Save user to DynamoDB
        const putParams = {
          TableName: 'Profiles',
          Item: user,
        };
    
        await docClient.send(new PutCommand(putParams));
    
      //  console.log('User profile completed:', JSON.stringify(user));
    
        return createResponse(200, 'Profile completed successfully.', user);
      } catch (error) {
        console.error('Error completing profile:', error);
        return createResponse(500, `Failed to complete profile: ${error.message}`);
      }
    }

  
    case 'updateMemeReaction': {
      const { memeID, incrementLikes, doubleLike, incrementDownloads, email } = requestBody;

      const userLikeKey = { email: email, MemeID: memeID };
      const getUserLike = {
        TableName: 'UserLikes',
        Key: userLikeKey
      };

      const userLikeStatus = await docClient.send(new GetCommand(getUserLike));

      // If user has a record, check their like status
      if (userLikeStatus.Item) {
        let shouldUpdate = false;
        let updateExpression = 'SET ';
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};

        // Determine if the user is toggling the like or double-like state
        if (doubleLike) {
          shouldUpdate = true;
          updateExpression += '#LC = #LC + :val';
          expressionAttributeNames['#LC'] = 'LikeCount';
          expressionAttributeValues[':val'] = userLikeStatus.Item.DoubleLiked ? -2 : 2;
          // Update the double-liked status
          const updateDoubleLike = {
            TableName: 'UserLikes',
            Key: userLikeKey,
            UpdateExpression: 'set DoubleLiked = :newState, Liked = :likeState',
            ExpressionAttributeValues: {
              ':newState': !userLikeStatus.Item.DoubleLiked,
              ':likeState': false
            }
          };
          await docClient.send(new UpdateCommand(updateDoubleLike));
        } else if (incrementLikes && !userLikeStatus.Item.DoubleLiked) {
          shouldUpdate = true;
          updateExpression += '#LC = #LC + :val';
          expressionAttributeNames['#LC'] = 'LikeCount';
          expressionAttributeValues[':val'] = userLikeStatus.Item.Liked ? -1 : 1;
          // Update the liked status
          const updateLike = {
            TableName: 'UserLikes',
            Key: userLikeKey,
            UpdateExpression: 'set Liked = :newState',
            ExpressionAttributeValues: {
              ':newState': !userLikeStatus.Item.Liked
            }
          };
          await docClient.send(new UpdateCommand(updateLike));
        }

        if (shouldUpdate) {
          const updateMeme = {
            TableName: 'Memes',
            Key: { MemeID: memeID },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
          };
          await docClient.send(new UpdateCommand(updateMeme));
        }
      } else {
        // User has not interacted with this meme before, insert new like or double-like record
        const putUserLike = {
          TableName: 'UserLikes',
          Item: {
            email: email,
            MemeID: memeID,
            Liked: !doubleLike && incrementLikes,
            DoubleLiked: doubleLike,
            Timestamp: new Date().toISOString()
          }
        };
        await docClient.send(new PutCommand(putUserLike));
        // Also update the meme count
        const initialLikeUpdate = {
          TableName: 'Memes',
          Key: { MemeID: memeID },
          UpdateExpression: 'SET LikeCount = if_not_exists(LikeCount, :zero) + :inc',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':inc': doubleLike ? 2 : (incrementLikes ? 1 : 0)
          }
        };
        await docClient.send(new UpdateCommand(initialLikeUpdate));
      }
  if (incrementDownloads) {
    // Update UserDownloads table
    const userDownloadKey = { email: email, MemeID: memeID };
    const getUserDownload = {
      TableName: 'UserDownloads',
      Key: userDownloadKey
    };
    const userDownloadStatus = await docClient.send(new GetCommand(getUserDownload));

    if (!userDownloadStatus.Item) {
      // User hasn't downloaded this meme before, add a new record
      const putUserDownload = {
        TableName: 'UserDownloads',
        Item: {
          email: email,
          MemeID: memeID,
          Timestamp: new Date().toISOString()
        }
      };
      await docClient.send(new PutCommand(putUserDownload));

      // Update the download count in the Memes table
      const updateMemeDownloads = {
        TableName: 'Memes',
        Key: { MemeID: memeID },
        UpdateExpression: 'SET DownloadCount = if_not_exists(DownloadCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1
        }
      };
      await docClient.send(new UpdateCommand(updateMemeDownloads));
    }
    // If the user has already downloaded the meme, we don't need to do anything
  }

  return createResponse(200, 'Meme reaction updated successfully.');
}

case 'recordMemeView':
  try {
    const { memeViews } = requestBody;
    if (!Array.isArray(memeViews) || memeViews.length === 0) {
      return createResponse(400, 'memeViews array is required and must not be empty.');
    }

    console.log('Received meme views:', JSON.stringify(memeViews, null, 2));

    // Deduplicate meme views
    const uniqueMemeViews = memeViews.reduce((acc, view) => {
      const key = `${view.email}-${view.memeID}`;
      if (!acc[key]) {
        acc[key] = view;
      }
      return acc;
    }, {});

    const batchWriteParams = {
      RequestItems: {
        'UserViewHistory': Object.values(uniqueMemeViews).map((view, index) => ({
          PutRequest: {
            Item: {
              email: { S: view.email },
              MemeID: { S: view.memeID },
              Timestamp: { S: new Date(Date.now() + index).toISOString() },
              ViewTimestamp: { S: new Date().toISOString() }
            }
          }
        }))
      }
    };

    console.log('BatchWrite params:', JSON.stringify(batchWriteParams, null, 2));

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