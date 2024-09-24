// Part of the userManagement.mjs 
// updateUserProfile, deleteAccount, uploadToS3, resendConfirmationCode, forgotPassword, confirmForgotPassword, updateProfileImage, updateFeedback, getFeedback, getAllFeedback, updatePassword
// must be zipped with the userManagement.mjs file when uploading to AWS, along with node_modules, and the package.json files

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CognitoIdentityProviderClient, ListUsersCommand , AdminUpdateUserAttributesCommand,AdminSetUserPasswordCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, AdminDeleteUserCommand  } from "@aws-sdk/client-cognito-identity-provider";

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });
const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-2" });

const USER_POOL_ID = "us-east-2_ifrUnY9b1";
const COGNITO_CLIENT_ID = "4c19sf6mo8nbl9sfncrl86d1qv";

export const deleteAccount = async (email) => {
  try {
    // First, find the Cognito username using the email
    const listUsersParams = {
      UserPoolId: "us-east-2_ifrUnY9b1",
      Filter: `email = "${email}"`,
      Limit: 1
    };
    
    const listUsersResponse = await cognitoClient.send(new ListUsersCommand(listUsersParams));
    
    if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
      throw new Error('User not found in Cognito');
    }

    const cognitoUsername = listUsersResponse.Users[0].Username;

    // Delete user from Cognito
    await cognitoClient.send(new AdminDeleteUserCommand({
      UserPoolId: "us-east-2_ifrUnY9b1",
      Username: cognitoUsername,
    }));

    // Also delete user profile from DynamoDB
    await ddbClient.send(new DeleteCommand({
      TableName: 'Profiles',
      Key: { email: email }
    }));

    console.log('User successfully deleted from Cognito and DynamoDB.');
    return createResponse(200, 'User account deleted successfully.');

  } catch (error) {
    console.error('Error deleting user account:', error);
    return createResponse(500, 'Failed to delete user account.', { error: error.message });
  }
};

export const uploadToS3 = async (base64Data, key, contentType, bucketName) => {
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
  
export async function updateUserProfile(requestBody) {
  const { email, username, displayName, likesPublic, notificationsEnabled, newEmail } = requestBody;

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (username) {
    updateExpression.push('#username = :username');
    expressionAttributeValues[':username'] = username;
    expressionAttributeNames['#username'] = 'username';
  }

  if (displayName) {
    updateExpression.push('#displayName = :displayName');
    expressionAttributeValues[':displayName'] = displayName;
    expressionAttributeNames['#displayName'] = 'displayName';
  }

  if (likesPublic !== undefined) {
    updateExpression.push('#likesPublic = :likesPublic');
    expressionAttributeValues[':likesPublic'] = likesPublic;
    expressionAttributeNames['#likesPublic'] = 'likesPublic';
  }

  if (notificationsEnabled !== undefined) {
    updateExpression.push('#notificationsEnabled = :notificationsEnabled');
    expressionAttributeValues[':notificationsEnabled'] = notificationsEnabled;
    expressionAttributeNames['#notificationsEnabled'] = 'notificationsEnabled';
  }

  if (newEmail) {
    try {
      const cognitoParams = {
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: newEmail,
          },
          {
            Name: 'email_verified',
            Value: 'false',
          },
        ],
      };
      const command = new AdminUpdateUserAttributesCommand(cognitoParams);
      await cognitoClient.send(command);

      // For DynamoDB, we need to create a new item with the new email and delete the old one
      const oldUserData = await docClient.send(new GetCommand({
        TableName: 'Profiles',
        Key: { email }
      }));

      if (oldUserData.Item) {
        const newUserData = { ...oldUserData.Item, email: newEmail };
        await docClient.send(new PutCommand({
          TableName: 'Profiles',
          Item: newUserData
        }));

        await docClient.send(new DeleteCommand({
          TableName: 'Profiles',
          Key: { email }
        }));

        return createResponse(200, 'User profile updated successfully', newUserData);
      } else {
        return createResponse(404, 'User not found');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      return createResponse(500, 'Failed to update email', {
        error: error.message,
        errorType: error.name,
        errorStack: error.stack
      });
    }
  }

  if (updateExpression.length === 0) {
    return createResponse(400, 'No fields to update');
  }

  const params = {
    TableName: 'Profiles',
    Key: { email },
    UpdateExpression: 'SET ' + updateExpression.join(', '),
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  };

  try {
    const command = new UpdateCommand(params);
    const result = await docClient.send(command);
    return createResponse(200, 'User profile updated successfully', result.Attributes);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return createResponse(500, 'Failed to update user profile', {
      error: error.message,
      errorType: error.name,
      errorStack: error.stack
    });
  }
};

export async function resendConfirmationCode(username) {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: username,
    };
  
    try {
      const command = new ResendConfirmationCodeCommand(params);
      const response = await cognitoClient.send(command);
  
      // Return a valid JSON response with a 200 status code if successful
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Confirmation code resent successfully',
          CodeDeliveryDetails: response.CodeDeliveryDetails,
        }),
      };
    } catch (error) {
      console.error('Error resending confirmation code:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to resend confirmation code',
          details: error.message,
        }),
      };
    }
};

export async function forgotPassword(username) {
  const params = {
    ClientId: COGNITO_CLIENT_ID,
    Username: username,
  };
  const command = new ForgotPasswordCommand(params);
  return cognitoClient.send(command);
};

export async function confirmForgotPassword(username, confirmationCode, newPassword) {
  const params = {
    ClientId: COGNITO_CLIENT_ID,
    Username: username,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
  };
  const command = new ConfirmForgotPasswordCommand(params);
  return cognitoClient.send(command);
};

export async function updateProfileImage(requestBody) {
    const { email, imageType, image } = requestBody;
    if (!email || !imageType || !image) {
      console.error('Missing required fields for updateProfileImage:', { email, imageType, imageProvided: !!image });
      return createResponse(400, 'Email, imageType, and image are required for updating profile image.');
    }
  
    try {
      const bucketName = 'jestr-bucket';
      const imageKey = `${imageType === 'profile' ? 'ProfilePictures' : 'HeaderPictures'}/${email}-${imageType}Pic-${Date.now()}.jpg`;
      const newImageUrl = await uploadToS3(image, imageKey, 'image/jpeg', bucketName);
  
      const updateProfileParams = {
        TableName: 'Profiles',
        Key: { email },
        UpdateExpression: 'SET #imagePic = :url',
        ExpressionAttributeNames: {
          '#imagePic': `${imageType}Pic`
        },
        ExpressionAttributeValues: {
          ':url': newImageUrl
        },
        ReturnValues: 'ALL_NEW'
      };
  
      await docClient.send(new UpdateCommand(updateProfileParams));
  
      return createResponse(200, 'Profile image updated successfully.', { [imageType + 'Pic']: newImageUrl });
    } catch (error) {
      console.error('Error updating profile image:', error);
      console.error('Stack trace:', error.stack);
      return createResponse(500, 'Failed to update profile image.', { 
        error: error.message, 
        stack: error.stack,
        details: error.toString() 
      });
    }
};

export async function updateFeedback(requestBody) {
  const { feedbackId, status } = requestBody;
  if (!feedbackId || !status) {
    return createResponse(400, 'FeedbackID and status are required for updating feedback.');
  }

  const validStatuses = ['New', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return createResponse(400, 'Invalid status. Must be one of: New, In Progress, Resolved, Closed');
  }

  try {
    const params = {
      TableName: 'UserFeedback',
      Key: { FeedbackID: feedbackId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: { '#status': 'Status' },
      ExpressionAttributeValues: { ':status': status },
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.send(new UpdateCommand(params));
    return createResponse(200, 'Feedback updated successfully', result.Attributes);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return createResponse(500, 'Failed to update feedback');
  }
};

export async function getFeedback(requestBody) {
  const { email } = requestBody;
  if (!email) {
    return createResponse(400, 'Email is required for getting feedback.');
  }

  try {
    const params = {
      TableName: 'UserFeedback',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'Email = :email',
      FilterExpression: '#status <> :closedStatus',
      ExpressionAttributeNames: { '#status': 'Status' },
      ExpressionAttributeValues: {
        ':email': email,
        ':closedStatus': 'Closed'
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    return createResponse(200, 'Feedback retrieved successfully', result.Items);
  } catch (error) {
    console.error('Error getting feedback:', error);
    return createResponse(500, 'Failed to get feedback');
  }
};

export async function getAllFeedback() {
  try {
    const params = {
      TableName: 'UserFeedback',
    };

    const result = await docClient.send(new ScanCommand(params));
    return createResponse(200, 'All feedback retrieved successfully', result.Items);
  } catch (error) {
    console.error('Error getting all feedback:', error);
    return createResponse(500, 'Failed to get all feedback');
  }
};

export async function updatePassword(username, newPassword) {
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: newPassword,
      Permanent: true,
    };
    const command = new AdminSetUserPasswordCommand(params);
    return cognitoClient.send(command);
};
  
export function createResponse(statusCode, message, data = null) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({ message, data }),
  };
};