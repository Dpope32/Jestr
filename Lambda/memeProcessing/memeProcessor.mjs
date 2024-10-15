// memeProcessor.mjs

import { CognitoJwtVerifier } from "aws-jwt-verify";
import { shareMeme } from './shareMeme.mjs';
import { getPresignedUrl, createResponse } from './utils.mjs';
import { uploadMeme } from './uploadMeme.mjs';
import { getUserMemes } from './dbServices.mjs';
import { awardBadge, getUserBadges } from './badgeServices.mjs';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = ["shareMeme", "getPresignedUrl", "uploadMeme", "getUserMemes", "getUserBadges", ];

/**
 * Main Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
  //console.log("Received event in memeProcessor:", JSON.stringify(event, null, 2));

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
    let verifiedUser = null;

    if (!publicOperations.includes(operation)) {
      const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];

      if (!token) {
        return createResponse(401, 'No token provided');
      }

      try {
        const payload = await verifier.verify(token);
        verifiedUser = payload;
      } catch (error) {
        console.error('Token verification failed:', error);
        return createResponse(401, 'Invalid token');
      }
    }

    switch (operation) {
      case 'shareMeme': {
        const { memeID, email, username, catchUser, message } = requestBody;
        try {
          const result = await shareMeme(memeID, email, username, catchUser, message);
          return createResponse(200, 'Meme shared successfully and message sent.', { badgeEarned: result.badgeEarned });
        } catch (error) {
          console.error(`Error sharing meme: ${error}`);
          return createResponse(500, 'Failed to share meme or send message.');
        }
      }

      case 'getPresignedUrl': {
        const { fileName, fileType } = requestBody;
        if (!fileName || !fileType) {
          return createResponse(400, 'fileName and fileType are required.');
        }
        try {
          const { uploadURL, fileKey } = await getPresignedUrl(fileName, fileType);
          return createResponse(200, 'Presigned URL generated successfully', { uploadURL, fileKey });
        } catch (error) {
          console.error('Error generating presigned URL:', error);
          return createResponse(500, 'Failed to generate presigned URL', { error: error.message });
        }
      }

      case "uploadMeme": {
        const { email, username, caption, tags, mediaType, memeKey } = requestBody;
        try {
          const result = await uploadMeme(email, username, caption, tags, mediaType, memeKey);
          return createResponse(200, "Meme uploaded and processed successfully.", result.data);
        } catch (error) {
          console.error("Error during meme upload and processing:", error);
          return createResponse(500, `Failed to upload and process meme: ${error.message}`);
        }
      }

      case 'getUserMemes': {
        const { email, lastEvaluatedKey, limit } = requestBody;
        if (!email) {
          return createResponse(400, 'Email is required to fetch user memes.');
        }
      
        try {
          const result = await getUserMemes(email, limit, lastEvaluatedKey);
          return createResponse(200, 'User memes retrieved successfully.', result);
        } catch (error) {
          console.error('Error fetching user memes:', error);
          return createResponse(500, 'Failed to fetch user memes.', { memes: [], lastEvaluatedKey: null });
        }
      }

      case 'getUserBadges': { 
        const { userEmail } = requestBody;
        if (!userEmail) {
          return createResponse(400, 'Email is required to fetch user badges.');
        }
        try {
          const badges = await getUserBadges(userEmail);
          return createResponse(200, 'User badges retrieved successfully.', { badges });
        } catch (error) {
          console.error('Error fetching user badges:', error);
          return createResponse(500, 'Failed to fetch user badges.');
        }
      }
      

      default:
        console.warn(`Unsupported operation: ${operation}`);
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error('Unexpected error in Lambda handler:', error);
    return createResponse(500, 'Internal Server Error', { error: error.message });
  }
};
