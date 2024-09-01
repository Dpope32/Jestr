const {DynamoDBDocumentClient,GetCommand,DeleteCommand,BatchWriteCommand,PutCommand,UpdateCommand,ScanCommand,QueryCommand} = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient, BatchGetItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

const BUCKET_NAME = 'jestr-meme-uploads';

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

// Function to send a message
const batchCheckFollowStatus = async (followerId, followeeIDs) => {
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

exports.handler = async (event) => {
 //   console.log('Received event:', JSON.stringify(event, null, 2));
 // console.log('Headers:', JSON.stringify(event.headers, null, 2));
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
    //  console.log('Received event:', JSON.stringify(event, null, 2));
   //   console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));

  // List of operations that don't require authentication
  const publicOperations = [
    'fetchMemes','uploadMeme','getPresignedUrl','getLikeStatus','getUserMemes',
    'updateMemeReaction','recordMemeView','deleteMeme','removeDownloadedMeme','getPopularMemes','getTotalMemes',
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

      case 'fetchMemes': {
     //   console.log('Processing operation: fetchMemes');
        const { lastViewedMemeId, userEmail, limit = 5 } = requestBody;
        if (!userEmail) {
          return createResponse(400, 'userEmail is required.');
        }
        try {
          // Fetch user's entire view history
          const viewHistoryCommand = new QueryCommand({
            TableName: 'UserMemeViews',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': userEmail }
          });
      
          const viewHistoryResponse = await docClient.send(viewHistoryCommand);
      
          // Extract all viewed meme IDs
          const viewedMemeIDs = new Set(
            viewHistoryResponse.Items.flatMap(item =>
              (item.viewedMemes || []).map(meme => typeof meme === 'string' ? meme : meme.S)
            )
          );
      
          // Fetch memes, excluding viewed ones
          let unseenMemes = [];
          let scanParams = {
            TableName: 'Memes',
            Limit: 100,
          };
      
          if (lastViewedMemeId) {
            scanParams.ExclusiveStartKey = { MemeID: lastViewedMemeId };
          }
      
          while (unseenMemes.length < limit) {
            const scanCommand = new ScanCommand(scanParams);
            const result = await docClient.send(scanCommand);
      
            const newUnseenMemes = result.Items.filter(meme => !viewedMemeIDs.has(meme.MemeID));
         //   console.log(`Fetched ${result.Items.length} memes, ${newUnseenMemes.length} are unseen`);
      
            unseenMemes = [...unseenMemes, ...newUnseenMemes];
            
            if (!result.LastEvaluatedKey) break;
            scanParams.ExclusiveStartKey = result.LastEvaluatedKey;
          }
      
          // Extract unique followee IDs
          const followeeIDs = [...new Set(unseenMemes.slice(0, limit).map(item => item.Email).filter(email => email !== userEmail))];
          
          // Batch check follow status
          const followStatuses = await batchCheckFollowStatus(userEmail, followeeIDs);
      
          // Process memes and attach follow status
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
            },
            isFollowed: item.Email !== userEmail ? followStatuses[item.Email] || false : null
          }));
      
          // Record meme views
          await recordMemeViews(userEmail, memes.map(meme => meme.memeID));
      
          return createResponse(200, 'Memes retrieved successfully.', {
            memes,
            lastEvaluatedKey: scanParams.ExclusiveStartKey ? JSON.stringify(scanParams.ExclusiveStartKey) : null
          });
        } catch (error) {
          console.error('Error fetching memes:', error);
          return createResponse(500, 'Internal Server Error', { error: error.message, stack: error.stack });
        }
      }

      case 'uploadMeme': {
    //    console.log('Processing operation:', event.operation);
        const { email, username, caption, tags, mediaType, memeKey } = requestBody;
        if (!email || !username || !mediaType || !memeKey) {
          return createResponse(400, 'Email, username, media type, and meme key are required.');
        }

        try {
          // First, fetch the user's profile to get the ProfilePicUrl
          const userProfileParams = {
            TableName: 'Profiles',
            Key: { email: email }
          };

          const userProfileResult = await docClient.send(new GetCommand(userProfileParams));
          const userProfile = userProfileResult.Item;

          if (!userProfile) {
            return createResponse(404, 'User profile not found');
          }

          const profilePicUrl = userProfile.profilePic || ''; // Assuming 'profilePic' is the correct attribute name

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
              ProfilePicUrl: profilePicUrl // Add this line to include the ProfilePicUrl
            },
          };

          await docClient.send(new PutCommand(memeMetadataParams));
      //    console.log('Meme metadata stored successfully in DynamoDB');

          return createResponse(200, 'Meme metadata processed successfully.', { 
            url: `https://${BUCKET_NAME}.s3.amazonaws.com/${memeKey}`,
            profilePicUrl: profilePicUrl // Include this in the response
          });
        } catch (error) {
          console.error('Error storing meme metadata in DynamoDB:', error);
          return createResponse(500, `Failed to store meme metadata: ${error.message}`);
        }
      }

      case 'getPresignedUrl': {
     //   console.log('Processing operation:', event.operation);
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

      case 'deleteMeme': {
        const { memeID, userEmail } = requestBody;
   //     console.log(`Attempting to delete meme. MemeID: ${memeID}, UserEmail: ${userEmail}`);

        if (!memeID || !userEmail) {
        console.log('Missing required fields for deleting a meme');
          return createResponse(400, 'MemeID and userEmail are required for deleting a meme.');
        }

        try {
          // First, check if the meme exists
          const getMemeParams = {
            TableName: 'Memes',
            Key: { MemeID: memeID },
          };

       //   console.log('Fetching meme data:', JSON.stringify(getMemeParams));
          const memeData = await docClient.send(new GetCommand(getMemeParams));
        //  console.log('Meme data fetched:', JSON.stringify(memeData.Item));

          if (!memeData.Item) {
            console.log(`Meme not found. MemeID: ${memeID}`);
            return createResponse(404, 'Meme not found');
          }

          if (memeData.Item.Email !== userEmail) {
            console.log(`Unauthorized delete attempt. Meme owner: ${memeData.Item.Email}, Requester: ${userEmail}`);
            return createResponse(403, 'You are not authorized to delete this meme');
          }

          // If the meme exists and the user is the owner, proceed with deletion
          const deleteParams = {
            TableName: 'Memes',
            Key: { MemeID: memeID },
          };

       //   console.log('Deleting meme:', JSON.stringify(deleteParams));
          await docClient.send(new DeleteCommand(deleteParams));
        //  console.log('Meme deleted successfully');

          return createResponse(200, 'Meme deleted successfully');
        } catch (error) {
          console.error('Error deleting meme:', error);
          return createResponse(500, 'Error deleting meme', { error: error.message });
        }
      }

      case 'removeDownloadedMeme': {
        const { userEmail, memeID } = requestBody;
        //console.log(`Attempting to remove downloaded meme. MemeID: ${memeID}, UserEmail: ${userEmail}`);

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
          console.log('Downloaded meme removed successfully');
          return createResponse(200, 'Downloaded meme removed successfully');
        } catch (error) {
          console.error('Error removing downloaded meme:', error);
          return createResponse(500, 'Error removing downloaded meme', { error: error.message });
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
      const { email, lastEvaluatedKey, limit = 50 } = requestBody;
      if (!email) {
      return createResponse(400, 'Email is required to fetch user memes.');
      }

      const queryParams = {
      TableName: 'Memes',
      IndexName: 'Email-UploadTimestamp-index',
      KeyConditionExpression: 'Email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
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