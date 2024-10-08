// memeManagement.mjs
// Optimized version with improved comment management and performance

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const publicOperations = ['updateMemeReaction', 'postComment', 'updateCommentReaction', 'getComments', 'deleteComment', 'replyToComment'];

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

export const handler = async (event) => {
  try {
    let requestBody;

    // Check if the body is a string or an object and parse accordingly
    if (event.body && typeof event.body === 'string') {
      requestBody = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      requestBody = event.body;
    } else {
      requestBody = event;
    }

    const { operation } = requestBody;

    // Add logging for debugging
    console.log('Request Body:', requestBody);
    console.log('Operation:', operation);

    // Check if the operation is public
    if (!publicOperations.includes(operation)) {
      // Only perform token verification for non-public operations
      const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];
      if (!token) {
        return createResponse(401, 'No token provided');
      }
      try {
        await verifier.verify(token);
      } catch (error) {
        console.error('Token verification failed:', error);
        return createResponse(401, 'Invalid token');
      }
    }

    switch (operation) {
      case 'updateMemeReaction':
        return await handleUpdateMemeReaction(requestBody);
      case 'postComment':
        return await handlePostComment(requestBody);
      case 'updateCommentReaction':
        return await handleUpdateCommentReaction(requestBody);
      case 'getComments':
        return await handleGetComments(requestBody);
      case 'deleteComment':
        return await handleDeleteComment(requestBody);
      case 'replyToComment':
        return await handleReplyToComment(requestBody);
      default:
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error('Unexpected error in Lambda:', error);
    return createResponse(500, 'Internal Server Error', { error: error.message });
  }
};

async function handleUpdateMemeReaction({ memeID, incrementLikes, doubleLike, incrementDownloads, email }) {
  const userLikeKey = { email, MemeID: memeID };
  const getUserLike = {
    TableName: 'UserLikes',
    Key: userLikeKey
  };

  const userLikeStatus = await docClient.send(new GetCommand(getUserLike));
  let updateExpression = 'ADD ';
  let expressionAttributeValues = {};

  if (userLikeStatus.Item) {
    if (doubleLike) {
      updateExpression += 'LikeCount :val';
      expressionAttributeValues[':val'] = userLikeStatus.Item.DoubleLiked ? -2 : 2;
      await docClient.send(new UpdateCommand({
        TableName: 'UserLikes',
        Key: userLikeKey,
        UpdateExpression: 'SET DoubleLiked = :newState, Liked = :likeState',
        ExpressionAttributeValues: {
          ':newState': !userLikeStatus.Item.DoubleLiked,
          ':likeState': false
        }
      }));
    } else if (incrementLikes && !userLikeStatus.Item.DoubleLiked) {
      updateExpression += 'LikeCount :val';
      expressionAttributeValues[':val'] = userLikeStatus.Item.Liked ? -1 : 1;
      await docClient.send(new UpdateCommand({
        TableName: 'UserLikes',
        Key: userLikeKey,
        UpdateExpression: 'SET Liked = :newState',
        ExpressionAttributeValues: {
          ':newState': !userLikeStatus.Item.Liked
        }
      }));
    }
  } else {
    await docClient.send(new PutCommand({
      TableName: 'UserLikes',
      Item: {
        email,
        MemeID: memeID,
        Liked: !doubleLike && incrementLikes,
        DoubleLiked: doubleLike,
        Timestamp: new Date().toISOString()
      }
    }));
    updateExpression += 'LikeCount :inc';
    expressionAttributeValues[':inc'] = doubleLike ? 2 : (incrementLikes ? 1 : 0);
  }

  if (incrementDownloads) {
    const userDownloadStatus = await docClient.send(new GetCommand({
      TableName: 'UserDownloads',
      Key: { email, MemeID: memeID }
    }));

    if (!userDownloadStatus.Item) {
      await docClient.send(new PutCommand({
        TableName: 'UserDownloads',
        Item: {
          email,
          MemeID: memeID,
          Timestamp: new Date().toISOString()
        }
      }));
      updateExpression += 'DownloadCount :downloadInc';
      expressionAttributeValues[':downloadInc'] = 1;
    }
  }

  if (Object.keys(expressionAttributeValues).length > 0) {
    await docClient.send(new UpdateCommand({
      TableName: 'Memes',
      Key: { MemeID: memeID },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    }));
  }

  return createResponse(200, 'Meme reaction updated successfully.');
}

async function handlePostComment({ memeID, text, email, username, profilePic, parentCommentID = null }) {
  if (!memeID || !text || !email || !username || !profilePic) {
    return createResponse(400, 'Missing required fields for posting a comment.');
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
    ParentCommentID: parentCommentID
  };

  const transactItems = [
    {
      Put: {
        TableName: 'Comments',
        Item: comment
      }
    },
    {
      Update: {
        TableName: 'Memes',
        Key: { MemeID: memeID },
        UpdateExpression: 'SET CommentCount = if_not_exists(CommentCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':zero': 0
        }
      }
    }
  ];

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return createResponse(200, 'Comment posted successfully.', { comment });
  } catch (error) {
    console.error('Error posting comment:', error);
    return createResponse(500, 'Failed to post comment.');
  }
}

async function handleUpdateCommentReaction({ commentID, memeID, incrementLikes, incrementDislikes, userEmail }) {
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

  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: 'Comments',
      Key: { MemeID: memeID, CommentID: commentID },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW"
    }));
    return createResponse(200, 'Comment reaction updated successfully.', result.Attributes);
  } catch (error) {
    console.error('Error updating comment reaction:', error);
    return createResponse(500, 'Failed to update comment reaction.');
  }
}

async function handleGetComments({ memeID, lastEvaluatedKey, limit = 20 }) {
  const queryParams = {
    TableName: 'Comments',
    KeyConditionExpression: 'MemeID = :memeID',
    ExpressionAttributeValues: { ':memeID': memeID },
    ScanIndexForward: false,
    Limit: limit
  };

  if (lastEvaluatedKey) {
    queryParams.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
  }

  try {
    const result = await docClient.send(new QueryCommand(queryParams));
    return createResponse(200, 'Comments retrieved successfully.', {
      comments: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
    });
  } catch (error) {
    console.error('Error retrieving comments:', error);
    return createResponse(500, 'Failed to retrieve comments.');
  }
}

async function handleDeleteComment({ commentID, memeID, email }) {
  try {
    const comment = await docClient.send(new GetCommand({
      TableName: 'Comments',
      Key: { MemeID: memeID, CommentID: commentID }
    }));

    if (!comment.Item) {
      return createResponse(404, 'Comment not found.');
    }

    if (comment.Item.Email !== email) {
      return createResponse(403, 'You are not authorized to delete this comment.');
    }

    const transactItems = [
      {
        Delete: {
          TableName: 'Comments',
          Key: { MemeID: memeID, CommentID: commentID }
        }
      },
      {
        Update: {
          TableName: 'Memes',
          Key: { MemeID: memeID },
          UpdateExpression: 'SET CommentCount = CommentCount - :dec',
          ConditionExpression: 'CommentCount > :zero',
          ExpressionAttributeValues: { ':dec': 1, ':zero': 0 } // Merge into a single object
        }
      }
    ];

    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return createResponse(200, 'Comment deleted successfully.');
  } catch (error) {
    console.error('Error deleting comment:', error);
    return createResponse(500, 'Failed to delete comment.');
  }
}


async function handleReplyToComment({ parentCommentID, memeID, text, email, username, profilePic }) {
  if (!parentCommentID || !memeID || !text || !email || !username || !profilePic) {
    return createResponse(400, 'Missing required fields for replying to a comment.');
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
    ParentCommentID: parentCommentID
  };

  const transactItems = [
    {
      Put: {
        TableName: 'Comments',
        Item: reply
      }
    },
    {
      Update: {
        TableName: 'Memes',
        Key: { MemeID: memeID },
        UpdateExpression: 'SET CommentCount = if_not_exists(CommentCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':zero': 0
        }
      }
    },
    {
      Update: {
        TableName: 'Comments',
        Key: { MemeID: memeID, CommentID: parentCommentID },
        UpdateExpression: 'SET ReplyCount = if_not_exists(ReplyCount, :zero) + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':zero': 0
        }
      }
    }
  ];

  try {
    await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return createResponse(200, 'Reply posted successfully.', { reply });
  } catch (error) {
    console.error('Error posting reply:', error);
    return createResponse(500, 'Failed to post reply.');
  }
}

// Helper function to create standardized response
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
