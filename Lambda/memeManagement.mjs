// memeManagement.mjs
// updateMemeReaction, sendNotification, postComment, updateCommentReaction, getComments


import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);


const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = ['updateMemeReaction', 'sendNotification', 'postComment', 'updateCommentReaction','getComments'];

export const handler = async (event) => {
//console.log('Received event:', JSON.stringify(event, null, 2));
//console.log('Headers:', JSON.stringify(event.headers, null, 2));
//console.log('Processing operation:', event.operation);
//console.log('Request body:', JSON.stringify(event.body));R
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
    // console.log('Received event:', JSON.stringify(event, null, 2));
    //console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));

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
              let updateExpression = 'ADD ';
              let expressionAttributeValues = {};
          
              // Determine if the user is toggling the like or double-like state
              if (doubleLike) {
                shouldUpdate = true;
                updateExpression += 'LikeCount :val';
                expressionAttributeValues[':val'] = userLikeStatus.Item.DoubleLiked ? -2 : 2;
                // Update the double-liked status
                const updateDoubleLike = {
                  TableName: 'UserLikes',
                  Key: userLikeKey,
                  UpdateExpression: 'SET DoubleLiked = :newState, Liked = :likeState',
                  ExpressionAttributeValues: {
                    ':newState': !userLikeStatus.Item.DoubleLiked,
                    ':likeState': false
                  }
                };
                await docClient.send(new UpdateCommand(updateDoubleLike));
              } else if (incrementLikes && !userLikeStatus.Item.DoubleLiked) {
                shouldUpdate = true;
                updateExpression += 'LikeCount :val';
                expressionAttributeValues[':val'] = userLikeStatus.Item.Liked ? -1 : 1;
                // Update the liked status
                const updateLike = {
                  TableName: 'UserLikes',
                  Key: userLikeKey,
                  UpdateExpression: 'SET Liked = :newState',
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
                  ExpressionAttributeValues: expressionAttributeValues
                };
                await docClient.send(new UpdateCommand(updateMeme));
              }
            } else {
              // User has not interacted with this meme before
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
                UpdateExpression: 'ADD LikeCount :inc',
                ExpressionAttributeValues: {
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
                  UpdateExpression: 'ADD DownloadCount :inc',
                  ExpressionAttributeValues: {
                    ':inc': 1
                  }
                };
                await docClient.send(new UpdateCommand(updateMemeDownloads));
              }
              // If the user has already downloaded the meme, we don't need to do anything
            }
          
            return createResponse(200, 'Meme reaction updated successfully.');
        }

        case 'sendNotification': {
          const { memeID, catchUser, fromUser, type, message } = requestBody;
          if (!memeID || !catchUser || !fromUser || !type || !message) {
            return createResponse(400, 'memeID, catchUser, fromUser, type, and message are required for sending a notification.');
          }
          try {
            const notificationID = uuidv4();
            const timestamp = new Date().toISOString();
            const notificationParams = {
              TableName: 'Notis',
              Item: {
                MemeID: memeID,
                CatchUser: catchUser,
                FromUser: fromUser,
                NotificationID: notificationID,
                Type: type,
                Message: message,
                Seen: false,
                Timestamp: timestamp
              }
            };
            await docClient.send(new PutCommand(notificationParams));
            return createResponse(200, 'Notification sent successfully.', { notificationID });
          } catch (error) {
            console.error(`Error sending notification: ${error}`);
            return createResponse(500, 'Failed to send notification.');
          }
        }

        case 'postComment': {
          const { memeID, text, email, username, profilePic, parentCommentID = null } = requestBody;

          if (!memeID || !text || !email || !username || !profilePic) {
            return createResponse(400, 'Missing required fields for posting a comment.');
          }

          const commentID = uuidv4();
          const commentTimestamp = new Date().toISOString();
          const putCommentParams = {
            TableName: 'Comments',
            Item: {
              MemeID: memeID,
              CommentID: commentID,
              Text: text,
              ProfilePicUrl: profilePic,
              Username: username,
              Timestamp: commentTimestamp,
              LikesCount: 0,
              DislikesCount: 0,
              ParentCommentID: parentCommentID
            },
          };
        //   console.log("Attempting to post comment:", putCommentParams);
          const updateCommentCountParams = {
            TableName: 'Memes',
            Key: { MemeID: memeID },
            UpdateExpression: 'SET CommentCount = if_not_exists(CommentCount, :zero) + :inc',
            ExpressionAttributeValues: {
              ':inc': 1,
              ':zero': 0
            },
            ReturnValues: "UPDATED_NEW"
          };
        
          try {
            // Post the comment
            const result = await docClient.send(new PutCommand(putCommentParams));
          //  console.log("Comment posted successfully, result:", result);
        
            // Update the comment count
            const updateResult = await docClient.send(new UpdateCommand(updateCommentCountParams));
          //   console.log("Comment count updated successfully, result:", updateResult);
        
            return createResponse(200, 'Comment posted and comment count updated successfully.');
          } catch (error) {
            console.error('Error posting comment or updating comment count:', error);
            return createResponse(500, 'Failed to post comment or update comment count.');
          }
        }

        case 'updateCommentReaction': {
          const { commentID, memeID, incrementLikes, incrementDislikes } = requestBody;
        
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
        
          const updateCommentParams = {
            TableName: 'Comments',
            Key: { MemeID: memeID, CommentID: commentID },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW"
          };
        
          try {
            await docClient.send(new UpdateCommand(updateCommentParams));
            return createResponse(200, 'Comment updated successfully.');
          } catch (error) {
            console.error('Error updating comment:', error);
            return createResponse(500, 'Failed to update comment.');
          }
        }

        case 'getComments': {
          const { memeID } = requestBody;
          const queryParams = {
            TableName: 'Comments',
            KeyConditionExpression: 'MemeID = :memeID',
            ExpressionAttributeValues: { ':memeID': memeID },
            ScanIndexForward: false // need to change this to sort by top comments
          };
          try {
            const { Items } = await docClient.send(new QueryCommand(queryParams));
            return createResponse(200, 'Comments retrieved successfully.', Items);
          } catch (error) {
            console.error(`Error  ${error}`);
            return createResponse(500, 'Failed to retrieve comments.');
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