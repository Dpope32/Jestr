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
  },
  socialButterfly: {
    name: "Social Butterfly",
    description: "Have 10 relationships (followers or following).",
  },
  memeMaster: {
    name: "Meme Master",
    description: "Uploaded 5 memes.",
  },
  trendSetter: {
    name: "Trend Setter",
    description: "Accumulated 100 likes on memes.",
  },
  messenger: {
    name: "Messenger",
    description: "Participated in 10 conversations.",
  },
  commentator: {
    name: "Commentator",
    description: "Commented on 10 memes.",
  },
  memeCreator: {
    name: "Meme Creator",
    description: "Created 10 memes.",
  },
  viralSensation: {
    name: "Viral Sensation",
    description: "Had memes shared 100 times in total.",
  },
  memeCollector: {
    name: "Meme Collector",
    description: "Downloaded 50 memes.",
  },
};

/**
 * Function to normalize a badge object.
 * @param {Object} rawBadge - Raw badge data from DynamoDB.
 * @returns {Object} - Normalized badge object.
 */
const normalizeBadge = (rawBadge) => {
  const badgeType = rawBadge.BadgeType || rawBadge.badgeType;
  if (!badgeType) {
    console.error("Missing BadgeType in rawBadge:", rawBadge);
    throw new Error("BadgeType is missing in rawBadge");
  }

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
    Progress: rawBadge.Earned ? 100 : rawBadge.Progress || 0,
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
    messenger: {
      table: "UserConversations_v2",
      partitionKey: "UserID",
      threshold: 10,
      countType: "items",
    },
    commentator: {
      table: "Comments",
      indexName: "Username-index",
      partitionKey: "Username",
      threshold: 10,
      countType: "items",
    },
    memeCreator: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email",
      threshold: 10,
      countType: "items",
    },
    viralSensation: {
      table: "Memes",
      indexName: "Email-UploadTimestamp-index",
      partitionKey: "Email",
      threshold: 25,
      sumAttribute: "ShareCount",
      countType: "sum",
    },
    memeCollector: {
      table: "UserDownloads",
      partitionKey: "email",
      threshold: 50,
      countType: "items",
    },
  };
  if (!badgeCriteria[action]) {
    console.error(
      `Action '${action}' is not supported or cannot be implemented with current schema.`
    );
    return false;
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
    return false;
  }

  let count = 0;

  try {
    const params = {
      TableName: table,
      KeyConditionExpression: `${partitionKey} = :partitionValue`,
      ExpressionAttributeValues: {
        ":partitionValue": userEmail,
        ...expressionAttributeValues,
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
      count = response.Items.reduce(
        (sum, item) => sum + (item[sumAttribute] || 0),
        0
      );
    } else if (countType === "items") {
      count = response.Count || 0;
    }
    return count >= threshold;
  } catch (error) {
    console.error(
      `Error in checkBadgeEligibility for action '${action}' with userEmail '${userEmail}':`,
      error
    );
    throw error;
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
      return null;
    }
    const badge = Items[0];
    const normalizedBadge = normalizeBadge(badge);

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
      return [];
    }

    const badgeTypes = Items.map((item) => item.BadgeType);

    const holdersCounts = await getBadgeHoldersCounts(badgeTypes);

    const processedBadges = Items.map((item) => {
      const normalizedBadge = normalizeBadge(item);
      normalizedBadge.HoldersCount = holdersCounts[item.BadgeType] || 0;
      return normalizedBadge;
    });

    return processedBadges;
  } catch (error) {
    console.error(`Failed to get user badges for ${userEmail}:`, error);
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
    const result = await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error(
      `Failed to update holders count for badge '${badgeType}':`,
      error
    );
    throw error;
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
 //   console.log(`Badge '${badgeType}' already awarded to ${userEmail}.`);
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