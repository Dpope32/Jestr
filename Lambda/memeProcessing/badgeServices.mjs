// badgeServices.mjs

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const badgeDetailsMap = {
  memeLiker: {
    name: "Meme Liker",
    description: "Liked 5 memes.",
    threshold: 5
  },
  socialButterfly: {
    name: "Social Butterfly",
    description: "Have 10 relationships (followers or following).",
    threshold: 10
  },
  memeMaster: {
    name: "Meme Master",
    description: "Uploaded 5 memes.",
    threshold: 5
  },
  trendSetter: {
    name: "Trend Setter",
    description: "Accumulated 100 likes on memes.",
    threshold: 100
  },
  messenger: {
    name: "Messenger",
    description: "Participated in 10 conversations.",
    threshold: 10
  },
  commentator: {
    name: "Commentator",
    description: "Commented on 10 memes.",
    threshold: 10
  },
  memeCreator: {
    name: "Meme Creator",
    description: "Created 10 memes.",
    threshold: 10
  },
  viralSensation: {
    name: "Viral Sensation",
    description: "Shared memes 25 times.",
    threshold: 25
  },
  memeCollector: {
    name: "Meme Collector",
    description: "Downloaded 50 memes.",
    threshold: 50
  },
};

/**
 * Function to normalize a badge object.
 * @param {Object} rawBadge - Raw badge data from DynamoDB.
 * @param {number} currentCounts - The current count towards the badge threshold.
 * @returns {Object} - Normalized badge object.
 */
const normalizeBadge = (rawBadge, currentCounts = 0) => {
  const badgeType = rawBadge.BadgeType || rawBadge.badgeType;
  if (!badgeType) {
    console.error("Missing BadgeType in rawBadge:", rawBadge);
    throw new Error("BadgeType is missing in rawBadge");
  }

  const threshold = badgeDetailsMap[badgeType]?.threshold || 1; // Avoid division by zero

  return {
    BadgeType: badgeType,
    BadgeName:
      badgeDetailsMap[badgeType]?.name ||
      rawBadge.BadgeName ||
      `Unknown Badge: ${badgeType}`,
    Description:
      badgeDetailsMap[badgeType]?.description ||
      rawBadge.Description ||
      `Description for ${badgeType} badge`,
    AwardedDate: rawBadge.AwardedDate || rawBadge.awardedDate || "",
    Earned: rawBadge.Earned === true,
    Progress: rawBadge.Earned
      ? 100
      : Math.min(Math.floor((currentCounts / threshold) * 100), 100),
    HoldersCount: rawBadge.HoldersCount || rawBadge.holdersCount || 0,
  };
};

/**
 * Function to check badge eligibility based on action.
 * @param {string} userEmail - The email of the user.
 * @param {string} action - The badge action to check.
 * @returns {Promise<boolean>} - Returns true if eligible, else false.
 */
const checkBadgeEligibility = async (userEmail, action) => {
  console.log(`Checking eligibility for badge: ${action}, user: ${userEmail}`);

  const badgeCriteria = {
    memeLiker: { 
      table: "UserLikes", 
      partitionKey: "email", 
      filterExpression: "Liked = :liked",
      expressionAttributeValues: { ":liked": true },
      threshold: 5
    },
    memeCollector: { 
      table: "UserDownloads", 
      partitionKey: "email",
      threshold: 50
    },
    viralSensation: { 
      table: "Shares", 
      indexName: "UserEmail-index",
      partitionKey: "UserEmail",
      threshold: 25,
      aggregateAttribute: "ShareCount"
    },
    commentator: { 
      table: "Comments", 
      indexName: "Email-index", 
      partitionKey: "Email",
      threshold: 10
    },
    memeMaster: { 
      table: "Memes", 
      indexName: "Email-UploadTimestamp-index", 
      partitionKey: "Email",
      threshold: 5
    },
    trendSetter: { 
      table: "Memes", 
      indexName: "Email-UploadTimestamp-index", 
      partitionKey: "Email", 
      aggregateAttribute: "LikeCount",
      threshold: 100
    },
    socialButterfly: {
      table: "UserRelationships",
      partitionKey: "UserID",
      threshold: 10
    },
    messenger: {
      table: "UserConversations_v2",
      partitionKey: "UserID",
      threshold: 10
    },
    memeCreator: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email",
      threshold: 10
    }
  };

  const { table, partitionKey, filterExpression, expressionAttributeValues, indexName, aggregateAttribute, threshold } = badgeCriteria[action] || {};
  
  if (!table || !partitionKey || !threshold) {
    console.log(`No criteria found for badge: ${action}`);
    return false;
  }

  const params = {
    TableName: table,
    KeyConditionExpression: `${partitionKey} = :partitionValue`,
    ExpressionAttributeValues: { 
      ":partitionValue": userEmail,
      ...expressionAttributeValues
    },
    Select: aggregateAttribute ? "SPECIFIC_ATTRIBUTES" : "COUNT",
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  if (filterExpression) {
    params.FilterExpression = filterExpression;
  }

  if (aggregateAttribute) {
    params.ProjectionExpression = aggregateAttribute;
  }

  console.log(`Query params for ${action}:`, JSON.stringify(params, null, 2));

  try {
    const result = await docClient.send(new QueryCommand(params));
    console.log(`Query result for ${action}:`, JSON.stringify(result, null, 2));

    let count;
    if (aggregateAttribute) {
      count = result.Items.reduce((sum, item) => sum + (item[aggregateAttribute] || 0), 0);
    } else {
      count = result.Count;
    }

    console.log(`Count for ${action}: ${count}`);
    console.log(`Threshold for ${action}: ${threshold}`);
    console.log(`Eligibility result: ${count >= threshold}`);
    return count >= threshold;
  } catch (error) {
    console.error(`Error checking eligibility for ${action}:`, error);
    return false;
  }
};

/**
 * Function to retrieve a specific badge for a user.
 * @param {string} userEmail - The email of the user.
 * @param {string} badgeType - The type of the badge.
 * @returns {Promise<Object|null>} - The badge object or null if not found.
 */
const getUserBadge = async (userEmail, badgeType) => {
  const params = {
    TableName: "UserBadges_v2",
    KeyConditionExpression: "Email = :email AND BadgeType = :badgeType",
    ExpressionAttributeValues: {
      ":email": userEmail,
      ":badgeType": badgeType,
    },
  };

  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    if (!Items || Items.length === 0) {
      console.log(
        `No badge found for type '${badgeType}' for user '${userEmail}'`
      );
      // Even if no badge exists, show progress based on current counts
      const currentCounts = await getCurrentCounts(userEmail, badgeType);
      const threshold = badgeDetailsMap[badgeType].threshold;
      const progress = Math.min(Math.floor((currentCounts / threshold) * 100), 100);

      return {
        BadgeType: badgeType,
        BadgeName: badgeDetailsMap[badgeType].name,
        Description: badgeDetailsMap[badgeType].description,
        AwardedDate: "",
        Earned: false,
        Progress: progress,
        HoldersCount: (await getBadgeHoldersCounts([badgeType]))[badgeType] || 0,
        currentCounts: currentCounts,
      };
    }
    const badge = Items[0];
    const currentCounts = await getCurrentCounts(userEmail, badgeType);
    const normalizedBadge = normalizeBadge(badge, currentCounts);

    // Fetch HoldersCount separately to ensure accuracy
    const holdersCount = await getBadgeHoldersCounts([badgeType]);
    normalizedBadge.HoldersCount = holdersCount[badgeType] || 0;

    return normalizedBadge;
  } catch (error) {
    console.error(
      `Failed to get badge '${badgeType}' for user '${userEmail}':`,
      error
    );
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

    if (!Items || Items.length === 0) {
      console.log(`No badges found for user: ${userEmail}`);
    }

    const badgeTypes = Object.keys(badgeDetailsMap);
    const holdersCounts = await getBadgeHoldersCounts(badgeTypes);

    const processedBadges = await Promise.all(
      badgeTypes.map(async (badgeType) => {
        const existingBadge = Items.find(item => item.BadgeType === badgeType);
        const currentCounts = await getCurrentCounts(userEmail, badgeType);

        let normalizedBadge;
        if (existingBadge && existingBadge.BadgeType) {
          normalizedBadge = normalizeBadge(existingBadge, currentCounts);
        } else {
          normalizedBadge = {
            BadgeType: badgeType,
            BadgeName: badgeDetailsMap[badgeType].name,
            Description: badgeDetailsMap[badgeType].description,
            Earned: false,
            Progress: Math.min(Math.floor((currentCounts / badgeDetailsMap[badgeType].threshold) * 100), 100),
          };
        }

        normalizedBadge.HoldersCount = holdersCounts[badgeType] || 0;
        normalizedBadge.currentCounts = currentCounts;

        return normalizedBadge;
      })
    );

    return processedBadges;
  } catch (error) {
    console.error(`Failed to get badges for user '${userEmail}':`, error);
    throw error;
  }
};

/**
 * Function to increment the holders count for a badge.
 * @param {string} badgeType - The type of the badge.
 * @returns {Promise<void>}
 */
const incrementBadgeHoldersCount = async (badgeType) => {
  const params = {
    TableName: "BadgeStats",
    Key: { BadgeType: badgeType },
    UpdateExpression:
      "SET HoldersCount = if_not_exists(HoldersCount, :zero) + :inc",
    ExpressionAttributeValues: {
      ":inc": 1,
      ":zero": 0,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error(
      `Failed to update holders count for badge '${badgeType}':`,
      error
    );
    throw error;
  }
};

const getCurrentCounts = async (userEmail, badgeType) => {
  console.log(`Getting count for badge: ${badgeType}, user: ${userEmail}`);

  const badgeCriteria = {
    memeLiker: { 
      table: "UserLikes", 
      partitionKey: "email", 
      filterExpression: "Liked = :liked",
      expressionAttributeValues: { ":liked": true }
    },
    memeCollector: { 
      table: "UserDownloads", 
      partitionKey: "email" 
    },
    viralSensation: { 
      table: "Shares", 
      indexName: "UserEmail-index",
      partitionKey: "UserEmail",
      aggregateAttribute: "ShareCount"
    },
    commentator: { 
      table: "Comments", 
      indexName: "Email-index", 
      partitionKey: "Email" 
    },
    memeMaster: { 
      table: "Memes", 
      indexName: "Email-UploadTimestamp-index", 
      partitionKey: "Email" 
    },
    trendSetter: { 
      table: "Memes", 
      indexName: "Email-UploadTimestamp-index", 
      partitionKey: "Email", 
      aggregateAttribute: "LikeCount" 
    },
    socialButterfly: {
      table: "UserRelationships",
      partitionKey: "UserID"
    },
    messenger: {
      table: "UserConversations_v2",
      partitionKey: "UserID"
    },
    memeCreator: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email"
    }
  };

  const { table, partitionKey, filterExpression, expressionAttributeValues, indexName, aggregateAttribute } = badgeCriteria[badgeType] || {};
  
  if (!table || !partitionKey) {
    console.log(`No criteria found for badge: ${badgeType}`);
    return 0;
  }

  const params = {
    TableName: table,
    KeyConditionExpression: `${partitionKey} = :partitionValue`,
    ExpressionAttributeValues: { 
      ":partitionValue": userEmail,
      ...expressionAttributeValues
    },
    Select: aggregateAttribute ? "SPECIFIC_ATTRIBUTES" : "COUNT",
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  if (filterExpression) {
    params.FilterExpression = filterExpression;
  }

  if (aggregateAttribute) {
    params.ProjectionExpression = aggregateAttribute;
  }

  console.log(`Query params for ${badgeType}:`, JSON.stringify(params, null, 2));

  try {
    const result = await docClient.send(new QueryCommand(params));
    console.log(`Query result for ${badgeType}:`, JSON.stringify(result, null, 2));

    let count;
    if (aggregateAttribute) {
      count = result.Items.reduce((sum, item) => sum + (item[aggregateAttribute] || 0), 0);
    } else {
      count = result.Count;
    }

    console.log(`Count for ${badgeType}: ${count}`);
    return count;
  } catch (error) {
    console.error(`Error getting count for badge '${badgeType}':`, error);
    return 0;
  }
};

/**
 * Function to get the holders count for badges.
 * @param {Array<string>} badgeTypes - Array of badge types.
 * @returns {Promise<Object>} - Object mapping badgeType to HoldersCount.
 */
const getBadgeHoldersCounts = async (badgeTypes) => {
  if (!badgeTypes || badgeTypes.length === 0) {
    return {};
  }

  const params = {
    RequestItems: {
      BadgeStats: {
        Keys: badgeTypes.map((type) => ({ BadgeType: type })),
        ProjectionExpression: "BadgeType, HoldersCount",
      },
    },
  };

  try {
    const result = await docClient.send(new BatchGetCommand(params));
    return result.Responses.BadgeStats.reduce((acc, item) => {
      acc[item.BadgeType] = item.HoldersCount || 0;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error getting badge holders counts:", error);
    return {};
  }
};

/**
 * Function to award a badge to a user if eligible.
 * @param {string} userEmail - The email of the user.
 * @param {string} badgeType - The type of the badge to award.
 * @returns {Promise<Object|null>}
 */
const awardBadge = async (userEmail, badgeType) => {
  // Check if the badge is already awarded
  const existingBadge = await getUserBadge(userEmail, badgeType);

  if (existingBadge && existingBadge.Earned) {
    // console.log(`Badge '${badgeType}' already awarded to ${userEmail}.`);
    return null; // Do not re-award the badge
  }

  // Check eligibility
  const isEligible = await checkBadgeEligibility(userEmail, badgeType);
  if (!isEligible) {
    console.log(
      `User '${userEmail}' is not eligible for badge '${badgeType}'.`
    );
    return null;
  }

  const badgeDetails = badgeDetailsMap[badgeType];

  if (!badgeDetails) {
    console.error(`No badge details found for badge type: '${badgeType}'`);
    return null;
  }

  const params = {
    TableName: "UserBadges_v2",
    Item: {
      Email: userEmail,
      BadgeType: badgeType,
      BadgeName: badgeDetails.name,
      Description: badgeDetails.description,
      AwardedDate: new Date().toISOString(),
      Earned: true,
      Progress: 100,
    },
    ConditionExpression:
      "attribute_not_exists(Email) AND attribute_not_exists(BadgeType)",
  };

  try {
    await docClient.send(new PutCommand(params));
    await incrementBadgeHoldersCount(badgeType);

    return badgeDetails;
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return null;
    } else {
      console.error(
        `Failed to award badge '${badgeType}' to ${userEmail}:`,
        error
      );
      throw error;
    }
  }
};

// Export the functions
export { awardBadge, getUserBadges, checkBadgeEligibility };
