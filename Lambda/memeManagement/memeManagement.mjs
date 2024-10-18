
import { awardBadge, getUserBadges } from "./badgeServices.mjs"; 

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  connectTimeout: 5000,
  maxRetriesPerRequest: 1
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});


const publicOperations = [
  "updateMemeReaction",
  "postComment",
  "updateCommentReaction",
  "getComments",
  "deleteComment",
  "replyToComment",
  "awardBadge",
  "getUserBadges",
];

/**
 * Main Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
//  console.log("Handler function started");
  try {
    let requestBody;

    if (event.body && typeof event.body === "string") {
      requestBody = JSON.parse(event.body);
    } else if (event.body && typeof event.body === "object") {
      requestBody = event.body;
    } else {
      requestBody = event;
    }

    const { operation } = requestBody;

 //   console.log("Request Body:", requestBody);
 //   console.log("Operation:", operation);

    if (!publicOperations.includes(operation)) {
      const token =
        event.headers?.Authorization?.split(" ")[1] ||
        event.headers?.authorization?.split(" ")[1];
      if (!token) {
        return createResponse(401, "No token provided");
      }
      try {
        await verifier.verify(token);
      } catch (error) {
        console.error("Token verification failed:", error);
        return createResponse(401, "Invalid token");
      }
    }

    switch (operation) {
      case "updateMemeReaction":
        return await handleUpdateMemeReaction(requestBody);
      case "postComment":
        return await handlePostComment(requestBody);
      case "updateCommentReaction":
        return await handleUpdateCommentReaction(requestBody);
      case "getComments":
        return await handleGetComments(requestBody);
      case "deleteComment":
        return await handleDeleteComment(requestBody);
      case "replyToComment":
        return await handleReplyToComment(requestBody);
      case "awardBadge":
        return await handleAwardBadge(requestBody);
      case "getUserBadges":
        return await handleGetUserBadges(requestBody);
      default:
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error("Unexpected error in Lambda:", error);
    return createResponse(500, "Internal Server Error", { error: error.message });
  }
};

/**
 * Handler for updating meme reactions.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleUpdateMemeReaction({
  memeID,
  incrementLikes,
  doubleLike,
  incrementDownloads,
  email,
}) {
  const userLikeKey = { email, MemeID: memeID };

  // Removed badge awarding logic from here
  // The client will handle when to request badge awarding

  const getUserLike = {
    TableName: "UserLikes",
    Key: userLikeKey,
  };

  const userLikeStatus = await docClient.send(new GetCommand(getUserLike));
  let updateExpression = "";
  let expressionAttributeValues = {};

  if (userLikeStatus.Item) {
    if (doubleLike) {
      updateExpression = "SET DoubleLiked = :newState, Liked = :likeState";
      expressionAttributeValues[":newState"] = !userLikeStatus.Item.DoubleLiked;
      expressionAttributeValues[":likeState"] = false;
    } else if (incrementLikes && !userLikeStatus.Item.DoubleLiked) {
      updateExpression = "SET Liked = :newState";
      expressionAttributeValues[":newState"] = !userLikeStatus.Item.Liked;
    }
  } else {
    await docClient.send(
      new PutCommand({
        TableName: "UserLikes",
        Item: {
          email,
          MemeID: memeID,
          Liked: !doubleLike && incrementLikes,
          DoubleLiked: doubleLike,
          Timestamp: new Date().toISOString(),
        },
      })
    );
  }

  if (updateExpression) {
    await docClient.send(
      new UpdateCommand({
        TableName: "UserLikes",
        Key: userLikeKey,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  }

  if (incrementLikes) {
    await docClient.send(
      new UpdateCommand({
        TableName: "Memes",
        Key: { MemeID: memeID },
        UpdateExpression: "ADD LikeCount :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
        },
      })
    );
  }

  if (doubleLike) {
    await docClient.send(
      new UpdateCommand({
        TableName: "Memes",
        Key: { MemeID: memeID },
        UpdateExpression: "ADD LikeCount :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
        },
      })
    );
  }

  if (incrementDownloads) {
    await docClient.send(
      new UpdateCommand({
        TableName: "Memes",
        Key: { MemeID: memeID },
        UpdateExpression: "ADD DownloadCount :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
        },
      })
    );
  }

  return createResponse(200, "Meme reaction updated successfully.");
}

/**
 * Handler for posting a comment.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handlePostComment({
  memeID,
  text,
  email,
  username,
  profilePic,
  parentCommentID = null,
}) {
  if (!memeID || !text || !email || !username || !profilePic) {
    return createResponse(400, "Missing required fields for posting a comment.");
  }

  const commentID = uuidv4();
  const commentTimestamp = new Date().toISOString();

  const comment = {
    MemeID: memeID,
    CommentID: commentID,
    Text: text,
    Email: email,
    ProfilePicUrl: profilePic,
    Username: username,
    Timestamp: commentTimestamp,
    LikesCount: 0,
    DislikesCount: 0,
    ParentCommentID: parentCommentID,
  };

  const transactItems = [
    {
      Put: {
        TableName: "Comments",
        Item: comment,
      },
    },
    {
      Update: {
        TableName: "Memes",
        Key: { MemeID: memeID },
        UpdateExpression:
          "SET CommentCount = if_not_exists(CommentCount, :zero) + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
        },
      },
    },
  ];

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));

    // Removed badge awarding logic from here

    return createResponse(200, "Comment posted successfully.", { comment });
  } catch (error) {
    console.error("Error posting comment:", error);
    return createResponse(500, "Failed to post comment.");
  }
}

/**
 * Handler for updating comment reactions.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleUpdateCommentReaction({
  commentID,
  memeID,
  incrementLikes,
  incrementDislikes,
  userEmail,
}) {
  let updateExpression = "SET ";
  const expressionAttributeValues = {};

  if (incrementLikes) {
    updateExpression += "LikesCount = LikesCount + :inc";
    expressionAttributeValues[":inc"] = 1;
  }
  if (incrementDislikes) {
    updateExpression += (incrementLikes ? ", " : "") + "DislikesCount = DislikesCount + :dec";
    expressionAttributeValues[":dec"] = 1;
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: "Comments",
        Key: { MemeID: memeID, CommentID: commentID },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
      })
    );
    return createResponse(200, "Comment reaction updated successfully.", result.Attributes);
  } catch (error) {
    console.error("Error updating comment reaction:", error);
    return createResponse(500, "Failed to update comment reaction.");
  }
}

/**
 * Handler for retrieving comments.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleGetComments({ memeID, lastEvaluatedKey, limit = 20 }) {
  const queryParams = {
    TableName: "Comments",
    KeyConditionExpression: "MemeID = :memeID",
    ExpressionAttributeValues: { ":memeID": memeID },
    ScanIndexForward: false,
    Limit: limit,
  };

  if (lastEvaluatedKey) {
    queryParams.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
  }

  try {
    const result = await docClient.send(new QueryCommand(queryParams));
    return createResponse(200, "Comments retrieved successfully.", {
      comments: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : null,
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return createResponse(500, "Failed to retrieve comments.");
  }
}

/**
 * Handler for deleting a comment.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleDeleteComment({ commentID, memeID, email }) {
  try {
    const comment = await docClient.send(
      new GetCommand({
        TableName: "Comments",
        Key: { MemeID: memeID, CommentID: commentID },
      })
    );

    if (!comment.Item) {
      return createResponse(404, "Comment not found.");
    }

    if (comment.Item.Email !== email) {
      return createResponse(403, "You are not authorized to delete this comment.");
    }

    const transactItems = [
      {
        Delete: {
          TableName: "Comments",
          Key: { MemeID: memeID, CommentID: commentID },
        },
      },
      {
        Update: {
          TableName: "Memes",
          Key: { MemeID: memeID },
          UpdateExpression: "SET CommentCount = CommentCount - :dec",
          ConditionExpression: "CommentCount > :zero",
          ExpressionAttributeValues: { ":dec": 1, ":zero": 0 },
        },
      },
    ];

    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return createResponse(200, "Comment deleted successfully.");
  } catch (error) {
    console.error("Error deleting comment:", error);
    return createResponse(500, "Failed to delete comment.");
  }
}

/**
 * Handler for replying to a comment.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleReplyToComment({
  parentCommentID,
  memeID,
  text,
  email,
  username,
  profilePic,
}) {
  if (!parentCommentID || !memeID || !text || !email || !username || !profilePic) {
    return createResponse(400, "Missing required fields for replying to a comment.");
  }

  const commentID = uuidv4();
  const commentTimestamp = new Date().toISOString();

  const reply = {
    MemeID: memeID,
    CommentID: commentID,
    Text: text,
    ProfilePicUrl: profilePic,
    Username: username,
    Email: email,
    Timestamp: commentTimestamp,
    LikesCount: 0,
    DislikesCount: 0,
    ParentCommentID: parentCommentID,
  };

  const transactItems = [
    {
      Put: {
        TableName: "Comments",
        Item: reply,
      },
    },
    {
      Update: {
        TableName: "Memes",
        Key: { MemeID: memeID },
        UpdateExpression:
          "SET CommentCount = if_not_exists(CommentCount, :zero) + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
        },
      },
    },
    {
      Update: {
        TableName: "Comments",
        Key: { MemeID: memeID, CommentID: parentCommentID },
        UpdateExpression:
          "SET ReplyCount = if_not_exists(ReplyCount, :zero) + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
        },
      },
    },
  ];

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return createResponse(200, "Reply posted successfully.", { reply });
  } catch (error) {
    console.error("Error posting reply:", error);
    return createResponse(500, "Failed to post reply.");
  }
}

/**
 * Handler for awarding a badge.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleAwardBadge({ email, badgeType }) {
  if (!email || !badgeType) {
    return createResponse(400, "Email and badgeType are required to award a badge.");
  }
  try {
    const badgeDetails = await awardBadge(email, badgeType);
    if (badgeDetails) {
      // Notify the client to display a popup
      return createResponse(200, `Badge '${badgeType}' awarded successfully.`, {
        badgeDetails,
      });
    } else {
      return createResponse(400, `Badge '${badgeType}' not awarded.`);
    }
  } catch (error) {
    console.error(`Error awarding badge '${badgeType}' to '${email}':`, error);
    return createResponse(500, "Failed to award badge.");
  }
}

/**
 * Handler for retrieving user badges.
 * @param {Object} params
 * @returns {Object} - Lambda response.
 */
async function handleGetUserBadges({ email }) {
  if (!email) {
    return createResponse(400, "Email is required to get user badges.");
  }
  try {
    const badges = await getUserBadges(email);
    return createResponse(200, "User badges retrieved successfully.", { badges });
  } catch (error) {
    console.error(`Error retrieving badges for '${email}':`, error);
    return createResponse(500, "Failed to retrieve user badges.");
  }
}

/**
 * Helper function to create standardized response
 * @param {number} statusCode
 * @param {string} message
 * @param {Object|null} data
 * @returns {Object}
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
