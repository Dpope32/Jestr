// followManagement.mjs

// addFollow, removeFollow, getFollowers, getFollowing, checkFollowStatus, batchCheckStatus
// // must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand, GetCommand, QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = ['addFollow', 'removeFollow', 'getFollowers', 'getFollowing', 'checkFollowStatus', 'batchCheckStatus'];

//**********************************************************************************************************
// HELPER FUNCTIONS //
//**********************************************************************************************************

/**
 * Function to add a follow relationship.
 * @param {string} followerId - Email of the follower.
 * @param {string} followeeId - Email of the followee.
 * @returns {Promise<Object>} - Result of the operation.
 */
const addFollow = async (followerId, followeeId) => {
  if (followerId === followeeId) {
    return { success: false, message: 'Users cannot follow themselves' };
  }

  // Check if the relationship already exists
  const existingFollow = await docClient.send(
    new GetCommand({
      TableName: 'UserRelationships',
      Key: { UserID: followerId, RelationUserID: followeeId },
    })
  );

  if (existingFollow.Item) {
    return { success: false, message: 'Already following this user' };
  }

  const transactParams = {
    TransactItems: [
      {
        Put: {
          TableName: 'UserRelationships',
          Item: {
            UserID: followerId,
            RelationUserID: followeeId,
            RelationshipType: 'follows',
          },
        },
      },
      {
        Update: {
          TableName: 'Profiles',
          Key: { email: followeeId },
          UpdateExpression: 'SET FollowersCount = if_not_exists(FollowersCount, :zero) + :inc',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':inc': 1,
          },
        },
      },
      {
        Update: {
          TableName: 'Profiles',
          Key: { email: followerId },
          UpdateExpression: 'SET FollowingCount = if_not_exists(FollowingCount, :zero) + :inc',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':inc': 1,
          },
        },
      },
    ],
  };

  try {
    await docClient.send(new TransactWriteCommand(transactParams));
    return { success: true, message: 'Follow added successfully' };
  } catch (error) {
    console.error('Error adding follow:', error);
    throw error;
  }
};

/**
 * Function to remove a follow relationship.
 * @param {string} followerId - Email of the follower.
 * @param {string} followeeId - Email of the followee.
 * @returns {Promise<Object>} - Result of the operation.
 */
const removeFollow = async (followerId, followeeId) => {
  // Check if the relationship exists
  const existingFollow = await docClient.send(
    new GetCommand({
      TableName: 'UserRelationships',
      Key: { UserID: followerId, RelationUserID: followeeId },
    })
  );

  if (!existingFollow.Item) {
    return { success: false, message: 'Not following this user' };
  }

  const transactParams = {
    TransactItems: [
      {
        Delete: {
          TableName: 'UserRelationships',
          Key: { UserID: followerId, RelationUserID: followeeId },
        },
      },
      {
        Update: {
          TableName: 'Profiles',
          Key: { email: followeeId },
          UpdateExpression: 'SET FollowersCount = if_not_exists(FollowersCount, :zero) - :dec',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':dec': 1,
          },
          ConditionExpression: 'FollowersCount > :zero',
        },
      },
      {
        Update: {
          TableName: 'Profiles',
          Key: { email: followerId },
          UpdateExpression: 'SET FollowingCount = if_not_exists(FollowingCount, :zero) - :dec',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':dec': 1,
          },
          ConditionExpression: 'FollowingCount > :zero',
        },
      },
    ],
  };

  try {
    await docClient.send(new TransactWriteCommand(transactParams));
    return { success: true, message: 'Unfollowed successfully' };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      console.warn('Follower or following count is already zero.');
      return { success: false, message: 'Counts are already zero.' };
    } else {
      console.error('Error removing follow:', error);
      throw error;
    }
  }
};

/**
 * Function to get followers of a user.
 * @param {string} userId - Email of the user.
 * @returns {Promise<Array>} - List of follower IDs.
 */
const getFollowers = async (userId) => {
  // Requires a GSI on RelationUserID
  const queryParams = {
    TableName: 'UserRelationships',
    IndexName: 'RelationUserID-UserID-index', // Ensure this index exists
    KeyConditionExpression: 'RelationUserID = :userId AND RelationshipType = :type',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':type': 'follows',
    },
  };

  try {
    const followers = [];
    let lastEvaluatedKey = null;
    do {
      const response = await docClient.send(new QueryCommand(queryParams));
      followers.push(...response.Items.map((item) => item.UserID));
      lastEvaluatedKey = response.LastEvaluatedKey;
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    } while (lastEvaluatedKey);

    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

/**
 * Function to get users that a user is following.
 * @param {string} userId - Email of the user.
 * @returns {Promise<Array>} - List of followee IDs.
 */
const getFollowing = async (userId) => {
  const queryParams = {
    TableName: 'UserRelationships',
    KeyConditionExpression: 'UserID = :userId AND RelationshipType = :type',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':type': 'follows',
    },
  };

  try {
    const following = [];
    let lastEvaluatedKey = null;
    do {
      const response = await docClient.send(new QueryCommand(queryParams));
      following.push(...response.Items.map((item) => item.RelationUserID));
      lastEvaluatedKey = response.LastEvaluatedKey;
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    } while (lastEvaluatedKey);

    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

/**
 * Function to check follow status between two users.
 * @param {string} followerId - Email of the follower.
 * @param {string} followeeId - Email of the followee.
 * @returns {Promise<Object>} - Follow status.
 */
const checkFollowStatus = async (followerId, followeeId) => {
  if (!followerId || !followeeId) {
    return { isFollowing: false, canFollow: true };
  }

  if (followerId === followeeId) {
    return { isFollowing: false, canFollow: false };
  }

  const getParams = {
    TableName: 'UserRelationships',
    Key: { UserID: followerId, RelationUserID: followeeId },
  };

  try {
    const response = await docClient.send(new GetCommand(getParams));
    const isFollowing = !!response.Item;
    return { isFollowing, canFollow: true };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false, canFollow: true };
  }
};

/**
 * Function to batch check follow status for multiple users.
 * @param {string} userEmail - Email of the follower.
 * @param {Array<string>} followeeIDs - List of followee emails.
 * @returns {Promise<Object>} - Mapping of followeeID to follow status.
 */
const batchCheckFollowStatus = async (userEmail, followeeIDs) => {
  const followStatuses = {};

  for (const followeeId of followeeIDs) {
    const status = await checkFollowStatus(userEmail, followeeId);
    followStatuses[followeeId] = status.isFollowing;
  }

  return followStatuses;
};

/**
 * Main Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
  try {
    let requestBody;
    if (event.body && typeof event.body === 'string') {
      requestBody = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      requestBody = event.body;
    } else {
      requestBody = event;
    }

    const { operation } = requestBody;

    console.log('Request Body:', requestBody);
    console.log('Operation:', operation);

    if (!publicOperations.includes(operation)) {
      const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];

      if (!token) {
        return createResponse(401, 'No token provided');
      }

      try {
        const payload = await verifier.verify(token);
        requestBody.verifiedUser = payload;
        console.log('User verified:', payload.username || payload.email);
      } catch (error) {
        console.error('Token verification failed:', error);
        return createResponse(401, 'Invalid token');
      }
    }

    switch (operation) {

      case 'addFollow': {
        const { followerId, followeeId } = requestBody;
        if (!followerId || !followeeId) {
          return createResponse(400, 'followerId and followeeId are required.');
        }
        try {
          const result = await addFollow(followerId, followeeId);
          if (result.success) {
            // Fetch updated counts
            const followeeProfile = await docClient.send(
              new GetCommand({
                TableName: 'Profiles',
                Key: { email: followeeId },
              })
            );
      
            const followerProfile = await docClient.send(
              new GetCommand({
                TableName: 'Profiles',
                Key: { email: followerId },
              })
            );
      
            return createResponse(200, result.message, {
              followersCount: followeeProfile.Item?.FollowersCount || 0,
              followingCount: followerProfile.Item?.FollowingCount || 0,
            });
          } else {
            return createResponse(400, result.message);
          }
        } catch (error) {
          console.error('Error adding follow:', error);
          return createResponse(500, 'Failed to add follow.');
        }
      }

      case 'removeFollow': {
        const { followerId, followeeId } = requestBody;
        if (!followerId || !followeeId) {
          return createResponse(400, 'followerId and followeeId are required.');
        }
        try {
          const result = await removeFollow(followerId, followeeId);
          if (result.success) {
            return createResponse(200, result.message);
          } else {
            return createResponse(400, result.message);
          }
        } catch (error) {
          console.error('Error removing follow:', error);
          return createResponse(500, 'Failed to remove follow.');
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

      case 'getFollowing': {
        const { userId } = requestBody;
        if (!userId) {
          return createResponse(400, 'userId is required.');
        }
        try {
          const following = await getFollowing(userId);
          return createResponse(200, 'Following retrieved successfully.', following);
        } catch (error) {
          console.error('Error getting following:', error);
          return createResponse(500, 'Failed to get following.');
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
          return createResponse(500, 'Failed to check follow status.', { error: error.message });
        }
      }

      case 'batchCheckStatus': {
        const { userEmail, followeeIDs } = requestBody;

        if (!userEmail || !followeeIDs) {
          return createResponse(400, 'userEmail and followeeIDs are required.');
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
