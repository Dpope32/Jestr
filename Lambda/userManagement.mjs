import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand,DeleteCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import * as accountServices from './accountServices.mjs';

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = [
    'getUser', 'updatePassword', 'resendConfirmationCode', 'forgotPassword', 'confirmForgotPassword', 
    'submitFeedback', 'updateFeedback', 'getFeedback', 'getAllFeedback', 
    'updateBio', 'updateProfileImage', 'completeProfile', 'updateUserProfile',
    'getUserGrowthRate', 'getTotalUsers', 'getDAU', 'addFollow', 'removeFollow',
    'getFollowing', 'getFollowers', 'getAllUsers','checkFollowStatus', 'batchCheckStatus', 'deleteAccount'
];

function generateAccessToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
//**********************************************************************************************************
// HELPER FUNCTIONS //
//**********************************************************************************************************

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

// Function to check if one user follows another
const checkFollowStatus = async (followerId, followeeId) => {
  if (!followerId || !followeeId) {
  //  console.log('Invalid followerId or followeeId:', followerId, followeeId);
    return { isFollowing: false, canFollow: true };
  }

  if (followerId === followeeId) {
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
  //  console.log('Checking follow status with params:', JSON.stringify(queryParams));
    const { Items } = await docClient.send(new QueryCommand(queryParams));
  //  console.log('Query result:', JSON.stringify(Items));
    return { isFollowing: Items && Items.length > 0, canFollow: true };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false, canFollow: true };
  }
};

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
   console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Processing operation:', event.operation);
 console.log('Request body:', JSON.stringify(event.body));
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

       if (!publicOperations.includes(operation)) {
         const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];
   
         if (!token) {
           return createResponse(401, 'No token provided');
         }
   
         try {
           const payload = await verifier.verify(token);
           requestBody.verifiedUser = payload;
         } catch (error) {
           console.error('Token verification failed:', error);
           return createResponse(401, 'Invalid token');
         }
       }

        switch (operation) {

            case 'getUser':
                const { identifier } = requestBody;
                if (!identifier) {
                    return createResponse(400, 'Identifier is required for getting user details.');
                }
                try {
                    const user = await getUser(identifier);
                    if (user) {
                        return createResponse(200, 'User details retrieved successfully.', user);
                    } else {
                        return createResponse(404, 'User not found');
                    }
                } catch (error) {
                    console.error(`Error getting user details: ${error}`);
                    return createResponse(500, 'Failed to get user details.');
              }

              case 'deleteAccount':
                if (!requestBody.email) {
                    return createResponse(400, 'Email is required for deleting an account.');
                }
                return await accountServices.deleteAccount(requestBody.email);

              case 'updateUserProfile':
                return await accountServices.updateUserProfile(requestBody);
              
              case 'updatePassword':
                return await accountServices.updatePassword(requestBody.username, requestBody.newPassword);
              
              case 'resendConfirmationCode':
                return await accountServices.resendConfirmationCode(requestBody.username);
              
              case 'forgotPassword':
                return await accountServices.forgotPassword(requestBody.username);
              
              case 'updateProfileImage':
                return await accountServices.updateProfileImage(requestBody);
              
              case 'confirmForgotPassword':
                return await accountServices.confirmForgotPassword(requestBody.username, requestBody.confirmationCode, requestBody.newPassword);
              
              case 'updateFeedback':
                return await accountServices.updateFeedback(requestBody);
              
              case 'getFeedback':
                return await accountServices.getFeedback(requestBody);
              
              case 'getAllFeedback':
                return await accountServices.getAllFeedback();
                

            case 'updateBio': {
                const { email, bio } = requestBody;              
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
                  return createResponse(200, 'Bio updated successfully.', { data: { updatedBio: bio } });
                } catch (error) {
                  console.error('Error updating bio:', error);
                  return createResponse(500, 'Failed to update bio.');
                }
              }

            case 'completeProfile': {
                const { email, username, profilePic, headerPic, displayName, bio } = requestBody;
                if (!email || !username) {
                  return createResponse(400, 'Email and username are required for profile completion.');
                }
              
                try {
                  const bucketName = 'jestr-bucket'; 
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
                    userId: uuidv4(), 
                  };
                  const putParams = {
                    TableName: 'Profiles',
                    Item: user,
                  };
                  await docClient.send(new PutCommand(putParams));
                  return createResponse(200, 'Profile completed successfully.', user);
                } catch (error) {
                  console.error('Error completing profile:', error);
                  return createResponse(500, `Failed to complete profile: ${error.message}`);
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

            case 'getDAU':
                try {
                  // Get the date for 3 days ago in UTC
                  const threeDaysAgo = new Date();
                  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                  const threeDaysAgoString = threeDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                
                  const params = {
                    TableName: 'UserMemeViews',
                    FilterExpression: '#date >= :threeDaysAgo',
                    ExpressionAttributeNames: {
                      '#date': 'date'
                    },
                    ExpressionAttributeValues: {
                      ':threeDaysAgo': threeDaysAgoString
                    }
                  };
                  
                //  console.log('DAU Params:', JSON.stringify(params));
                  const result = await docClient.send(new ScanCommand(params));
                //  console.log('DAU Result:', JSON.stringify(result));
                  
                  // Count unique emails
                  const uniqueEmails = new Set(result.Items.map(item => item.email));
                  const activeUsers = uniqueEmails.size;
                
                  return createResponse(200, 'Active users in the last 3 days retrieved successfully.', { 
                    activeUsers,
                    debugInfo: {
                      fromDate: threeDaysAgoString,
                      toDate: new Date().toISOString().split('T')[0],
                      scannedCount: result.ScannedCount,
                      matchedCount: result.Count,
                      uniqueEmailCount: activeUsers,
                      sampleItems: result.Items.slice(0, 5) // Include up to 5 sample items for debugging
                    }
                  });
                } catch (error) {
                  console.error('Error getting active users:', error);
                  return createResponse(500, 'Failed to get active users', { error: error.message });
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

            case 'checkFollowStatus': {
              const { followerId, followeeId } = JSON.parse(event.body);
              if (!followerId || !followeeId) {
                return createResponse(400, 'followerId and followeeId are required.');
              }
              try {
                const followStatus = await checkFollowStatus(followerId, followeeId);
                return createResponse(200, 'Follow status checked successfully.', followStatus);
              } catch (error) {
                console.error(`Error checking follow status: ${error}`);
                return createResponse(500, 'Failed to check follow status.', { error: error.message });
              }
            }

            case 'batchCheckStatus': {
              const { memeIDs, userEmail, followeeIDs } = requestBody;
              
              if (!memeIDs || !userEmail || !followeeIDs) {
              return createResponse(400, 'memeIDs, userEmail, and followeeIDs are required.');
              }
              
              try {
              const followStatuses = await batchCheckFollowStatus(userEmail, followeeIDs);
              
              return createResponse(200, 'Batch status check successful.', {
                followStatuses
              });
              } catch (error) {
              console.error(`Error in batch status check: ${error}`);
              return createResponse(500, 'Failed to perform batch status check.', { error: error.message });
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