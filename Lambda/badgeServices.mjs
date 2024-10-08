// badgeServices.mjs
// checkBadgeEligibility, awardBadge, getUserBadges
// must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS


import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = ["checkBadgeEligibility", "getUserBadges", "awardBadge"];

const badgeDetailsMap = {
  memeLiker: {
    name: "Meme Liker",
    description: "Liked 10 memes.",
  },
  socialButterfly: {
    name: "Social Butterfly",
    description: "Have 10 relationships.",
  },
  memeMaster: {
    name: "Meme Master",
    description: "Uploaded 5 memes.",
  },
  trendSetter: {
    name: "Trend Setter",
    description: "Accumulated 100 likes on memes.",
  },
  // Add other badge types as needed
};

/**
 * Simple email validation function.
 * @param {string} email - Email address to validate.
 * @returns {boolean} - True if valid, else false.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Function to check badge eligibility based on action.
 * @param {string} userEmail - The email of the user.
 * @param {string} action - The badge action to check.
 * @returns {Promise<string|null>} - Returns the badge type if eligible, else null.
 */
const checkBadgeEligibility = async (userEmail, action) => {
  const badgeCriteria = {
    memeLiker: {
      table: "UserLikes",
      partitionKey: "email",
      threshold: 10,
      filterExpression: "Liked = :liked",
      expressionAttributeValues: { ":liked": true },
      countType: "items",
    },
    socialButterfly: {
      table: "UserRelationships",
      partitionKey: "UserID",
      threshold: 10,
      countType: "items",
    },
    memeMaster: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email",
      threshold: 5,
      countType: "items",
    },
    trendSetter: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email",
      threshold: 100,
      sumAttribute: "LikeCount",
      countType: "sum",
    },
    // Add other badge types as needed
  };

  if (!badgeCriteria[action]) {
    console.error(`Action '${action}' is not supported or cannot be implemented with current schema.`);
    return null;
  }

  const {
    table,
    indexName,
    partitionKey,
    threshold,
    filterExpression,
    expressionAttributeValues = {},
    sumAttribute,
    countType,
  } = badgeCriteria[action];

  if (!table || !partitionKey || !threshold || !countType) {
    console.error(`Incomplete badge criteria for action '${action}'.`);
    return null;
  }

  let count = 0;

  try {
    const params = {
      TableName: table,
      KeyConditionExpression: `${partitionKey} = :partitionValue`,
      ExpressionAttributeValues: { 
        ":partitionValue": userEmail,
        ...expressionAttributeValues
      },
      Select: countType === "items" ? "COUNT" : "SPECIFIC_ATTRIBUTES",
    };

    if (countType === "sum" && sumAttribute) {
      params.ProjectionExpression = sumAttribute;
    }

    if (indexName) {
      params.IndexName = indexName;
    }

    if (filterExpression && countType !== "sum") {
      params.FilterExpression = filterExpression;
    }

    const command = new QueryCommand(params);
    const response = await docClient.send(command);

    if (countType === "sum" && sumAttribute) {
      // When using SPECIFIC_ATTRIBUTES, Items will contain only the sumAttribute
      count = response.Items.reduce((sum, item) => sum + (item[sumAttribute] || 0), 0);
    } else if (countType === "items") {
      count = response.Count || 0;
    }

    if (count >= threshold) {
      return action;
    }

    return null;
  } catch (error) {
    console.error(`Error in checkBadgeEligibility for action '${action}' with userEmail '${userEmail}':`, error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

/**
 * Function to award a badge to a user and update holders count.
 * @param {string} userEmail -
 * @param {string} badgeType 
 * @returns {Promise<void>}
 */
const awardBadge = async (userEmail, badgeType) => {
  try {
    
    const existingBadges = await getUserBadges(userEmail);
    
    if (existingBadges.some((badge) => badge.BadgeType === badgeType)) {
      return;
    }

    // Retrieve badge details from the map
    const badgeDetails = badgeDetailsMap[badgeType];
    if (!badgeDetails) {
      console.error(`No badge details found for badge type: '${badgeType}'`);
      return;
    }

    const params = {
      TableName: "UserBadges_v2", 
      Item: {
        Email: userEmail,
        BadgeType: badgeType, // Sort Key
        BadgeName: badgeDetails.name,
        Description: badgeDetails.description,
        AwardedDate: new Date().toISOString(),
      },
    };
    await docClient.send(new PutCommand(params));

    await updateBadgeHoldersCount(badgeType);
  } catch (error) {
    console.error(`Failed to award badge '${badgeType}' to ${userEmail}:`, error);
    throw error;
  }
};

/**
 * Function to update the holders count for a badge.
 * @param {string} badgeType - The type of the badge.
 * @returns {Promise<void>}
 */
const updateBadgeHoldersCount = async (badgeType) => {
  const params = {
    TableName: "BadgeStats",
    Key: { BadgeType: badgeType },
    UpdateExpression: "SET HoldersCount = if_not_exists(HoldersCount, :start) + :inc",
    ExpressionAttributeValues: {
      ":inc": 1,
      ":start": 0,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error(`Failed to update holders count for badge '${badgeType}':`, error);
    throw error;
  }
};


/**
 * Function to retrieve all badges awarded to a user with holders count.
 * @param {string} userEmail - The email of the user.
 * @returns {Promise<Array>} - Array of badge items.
 */
const getUserBadges = async (userEmail) => {
  const params = {
    TableName: "UserBadges_v2",
    KeyConditionExpression: "Email = :email",
    ExpressionAttributeValues: { ":email": userEmail },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));

    // Fetch holders count for each badge
    for (const item of Items) {
      const holdersCount = await getBadgeHoldersCount(item.BadgeType);
      item.HoldersCount = holdersCount;
    }

    return Items;
  } catch (error) {
    console.error(`Failed to get user badges for ${userEmail}:`, error);
    throw error;
  }
};

/**
 * Function to get the holders count for a badge.
 * @param {string} badgeType - The type of the badge.
 * @returns {Promise<number>} - Number of holders.
 */
const getBadgeHoldersCount = async (badgeType) => {
  const params = {
    TableName: "BadgeStats",
    Key: { BadgeType: badgeType },
    ProjectionExpression: "HoldersCount",
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item?.HoldersCount || 0;
  } catch (error) {
    console.error(`Failed to get holders count for badge '${badgeType}':`, error);
    return 0;
  }
};

/**
 * Main Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
  try {
    let requestBody;
    if (event.body) {
      requestBody = JSON.parse(event.body);
    } else if (event.operation) {
      requestBody = event;
    } else {
      return createResponse(400, "No valid request body or operation found");
    }

    const { operation } = requestBody;

    // Verify token if operation is not public
    let verifiedUser = null;
    if (!publicOperations.includes(operation)) {
      const token =
        event.headers?.Authorization?.split(" ")[1] ||
        event.headers?.authorization?.split(" ")[1];

      if (!token) {
        return createResponse(401, "No token provided");
      }

      try {
        const payload = await verifier.verify(token);
        verifiedUser = payload;
   //     console.log(`Token verified for user: ${payload.email || payload.sub}`);
      } catch (error) {
        console.error("Token verification failed:", error);
        return createResponse(401, "Invalid token");
      }
    }

    switch (operation) {
      case "checkBadgeEligibility": {
        const { userEmail, action } = requestBody;
        if (!userEmail || !action) {
          return createResponse(400, "userEmail and action are required for checking badge eligibility.");
        }

        if (!isValidEmail(userEmail)) {
          return createResponse(400, "Invalid email format.");
        }

        try {
          const eligibleBadge = await checkBadgeEligibility(userEmail, action);
          return createResponse(200, eligibleBadge ? "Eligible for badge." : "Not eligible for badge.", { badgeType: eligibleBadge });
        } catch (error) {
          console.error(`Error checking badge eligibility:`, error);
          return createResponse(500, "Failed to check badge eligibility.", { error: error.message });
        }
      }

      case "awardBadge": {
        const { userEmail, badgeType } = requestBody;
        if (!userEmail || !badgeType) {
          return createResponse(400, "userEmail and badgeType are required for awarding badges.");
        }

        if (!isValidEmail(userEmail)) {
          return createResponse(400, "Invalid email format.");
        }

        try {
          await awardBadge(userEmail, badgeType);
          return createResponse(200, "Badge awarded successfully.", { badgeType });
        } catch (error) {
          console.error(`Error awarding badge:`, error);
          return createResponse(500, "Failed to award badge.", { error: error.message });
        }
      }

      case "getUserBadges": {
        const { userEmail } = requestBody;
        if (!userEmail) {
          return createResponse(
            400,
            "userEmail is required for getting user badges."
          );
        }

        // Validate email format
        if (!isValidEmail(userEmail)) {
          return createResponse(400, "Invalid email format.");
        }

        try {
          const badges = await getUserBadges(userEmail);
          return createResponse(
            200,
            "User badges retrieved successfully.",
            { badges }
          );
        } catch (error) {
          console.error(`Error getting user badges: ${error}`);
          return createResponse(500, "Failed to get user badges.");
        }
      }

      default:
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error("Unexpected error in Lambda:", error);
    return createResponse(500, "Internal Server Error", {
      error: error.message,
    });
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
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
  body: JSON.stringify({ message, data }),
});
