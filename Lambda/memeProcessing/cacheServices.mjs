// cacheServices.mjs
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Function to get meme share count for a user.
 * @param {string} email - User's email.
 * @returns {Promise<number>} - Number of shares.
 */
export const getMemeShareCountForUser = async (email) => {
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
    return result.Count || 0;
  } catch (error) {
    console.error('Error getting meme share count for user:', error);
    throw error;
  }
};

/**
 * Function to get user profile.
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} - User profile or null if not found.
 */
export const getUserProfile = async (email) => {
  const params = {
    TableName: "Profiles",
    Key: { email: email },
    ProjectionExpression: "email, username, profilePic, endpointArn",
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};