import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand,DeleteCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = ['addFollow', 'removeFollow','getFollowers','getFollowing', 'checkFollowStatus', 'batchCheckStatus'];

//**********************************************************************************************************
// HELPER FUNCTIONS //
//**********************************************************************************************************

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
    // Return list of UserIDs that the given user is following
    return Items.map(item => item.RelationUserID); 
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

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
 //console.log('Received event in followManagement:', JSON.stringify(event, null, 2));
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