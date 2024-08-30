import { DynamoDBClient, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, BatchWriteCommand, PutCommand, UpdateCommand, BatchGetCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";


// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });

const BUCKET_NAME = 'jestr-meme-uploads';
const MEMES_FOLDER = 'Memes/';

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = [
    'getUser', 'updateBio', 'updateProfileImage', 'completeProfile', 'updateUserProfile',
    'getUserGrowthRate', 'getTotalUsers', 'getDAU', 'addFollow', 'removeFollow',
    'getFollowing', 'getFollowers', 'fetchDownloadedMemes', 'getAllUsers',
    'checkFollowStatus', 'batchCheckStatus'
];

function generateAccessToken() {
    return crypto.randomBytes(32).toString('hex');
  }
  
//**********************************************************************////////
// HELPER FUNCTIONS //
//**********************************************************************************//////

const uploadToS3 = async (base64Data, key, contentType, bucketName) => {
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

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

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
                case 'getUser':
                    const { identifier } = requestBody;
                    if (!identifier) {
                        return createResponse(400, 'Identifier is required for getting user details.');
                    }
                    try {
                        const user = await getUser(identifier);
                        if (user) {
                            return createResponse(200, 'User details retrieved successfully.', user);
                        } else {
                            return createResponse(404, 'User not found');
                        }
                    } catch (error) {
                        console.error(`Error getting user details: ${error}`);
                        return createResponse(500, 'Failed to get user details.');
                    }
                    case 'updateBio': {
                        const { email, bio } = requestBody;              
                        if (!email || bio === undefined) {
                          return createResponse(400, 'Email and bio are required for updating bio.');
                        } 
                        const updateParams = {
                          TableName: 'Profiles',
                          Key: { email: email },
                          UpdateExpression: 'set bio = :b, Bio = :b',
                          ExpressionAttributeValues: {
                            ':b': bio
                          },
                          ReturnValues: 'UPDATED_NEW'
                        };
                      
                        try {
                          const result = await docClient.send(new UpdateCommand(updateParams));
                          return createResponse(200, 'Bio updated successfully.', { data: { updatedBio: bio } });
                        } catch (error) {
                          console.error('Error updating bio:', error);
                          return createResponse(500, 'Failed to update bio.');
                        }
                      }
                      case 'updateProfileImage': {
                        const { email, imageType, image } = requestBody;
                        if (!email || !imageType || !image) {
                          console.error('Missing required fields for updateProfileImage');
                          return createResponse(400, 'Email, imageType, and image are required for updating profile image.');
                        }
                        try {
                        console.log(`Updating ${imageType} image for ${email}`);
                          const imageBuffer = Buffer.from(image, 'base64');
                          let newImageUrl;
                          if (imageType === 'profile') {
                            const profilePicKey = `${email}-profilePic-${Date.now()}.jpg`;
                            await uploadToS3(imageBuffer, profilePicKey, 'ProfilePictures');
                            newImageUrl = `https://jestr-bucket.s3.amazonaws.com/ProfilePictures/${profilePicKey}`;
                          } else if (imageType === 'header') {
                            const headerPicKey = `${email}-headerPic-${Date.now()}.jpg`;
                            await uploadToS3(imageBuffer, headerPicKey, 'HeaderPictures');
                            newImageUrl = 'https://jestr-bucket.s3.amazonaws.com/HeaderPictures/${headerPicKey}';
                          } else {
                            throw new Error('Invalid image type');
                          }
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
                          const updateProfileResult = await docClient.send(new UpdateCommand(updateProfileParams));
                          if (imageType === 'profile') {
                            const queryMemesParams = {
                              TableName: 'Memes',
                              IndexName: 'Email-UploadTimestamp-index', 
                              KeyConditionExpression: 'Email = :email',
                              ExpressionAttributeValues: {
                                ':email': email
                              }
                            };
                        
                            const memesResult = await docClient.send(new QueryCommand(queryMemesParams));
                            for (const meme of memesResult.Items) {
                              const updateMemeParams = {
                                TableName: 'Memes',
                                Key: { MemeID: meme.MemeID },
                                UpdateExpression: 'SET ProfilePicUrl = :newUrl',
                                ExpressionAttributeValues: {
                                  ':newUrl': newImageUrl
                                }
                              };
                              await docClient.send(new UpdateCommand(updateMemeParams));
                            }
                          }
                          const getParams = { TableName: 'Profiles', Key: { email } };
                          const { Item } = await docClient.send(new GetCommand(getParams));
                          return createResponse(200, 'Profile image updated successfully.', { [imageType + 'Pic']: newImageUrl });
                        } catch (error) {
                          console.error('Error updating profile image:', error);
                          return createResponse(500, 'Failed to update profile image.');
                        }
                        }
                        case 'completeProfile': {
                            const { email, username, profilePic, headerPic, displayName, bio } = requestBody;
                            if (!email || !username) {
                              return createResponse(400, 'Email and username are required for profile completion.');
                            }
                          
                            try {
                              const bucketName = 'jestr-bucket'; 
                              let profilePicUrl = 'https://jestr-bucket.s3.us-east-2.amazonaws.com/HeaderPictures/b%40b-headerPic.jpg';
                              let headerPicUrl = 'https://jestr-bucket.s3.us-east-2.amazonaws.com/ProfilePictures/default-profile-pic.jpg';
                          
                              if (profilePic) {
                                const profilePicKey = `ProfilePictures/${email}-${Date.now()}.jpg`;
                                profilePicUrl = await uploadToS3(profilePic, profilePicKey, 'image/jpeg', bucketName);
                              }
                          
                              if (headerPic) {
                                const headerPicKey = `HeaderPictures/${email}-${Date.now()}.jpg`;
                                headerPicUrl = await uploadToS3(headerPic, headerPicKey, 'image/jpeg', bucketName);
                              }
                          
                              const creationDate = new Date().toISOString();
                              const accessToken = generateAccessToken();
                          
                              const user = {
                                email,
                                username,
                                profilePic: profilePicUrl,
                                displayName: displayName || username,
                                headerPic: headerPicUrl,
                                bio: bio || '',
                                CreationDate: creationDate,
                                LastLogin: creationDate,
                                accessToken,
                                darkMode: requestBody.darkMode || false,
                                likesPublic: requestBody.likesPublic || true,
                                notificationsEnabled: requestBody.notificationsEnabled || true,
                                userId: uuidv4(), 
                              };
                              const putParams = {
                                TableName: 'Profiles',
                                Item: user,
                              };
                              await docClient.send(new PutCommand(putParams));
                              return createResponse(200, 'Profile completed successfully.', user);
                            } catch (error) {
                              console.error('Error completing profile:', error);
                              return createResponse(500, `Failed to complete profile: ${error.message}`);
                            }
                          }
            case 'updateUserProfile':
                // Implementation here
                break;
            case 'getTotalUsers':
                // Implementation here
                break;
            case 'getUserGrowthRate':
                // Implementation here
                break;
            case 'getDAU':
                // Implementation here
                break;
            case 'addFollow':
                // Implementation here
                break;
            case 'removeFollow':
                // Implementation here
                break;
            case 'getFollowing':
                // Implementation here
                break;
            case 'getFollowers':
                // Implementation here
                break;
            case 'checkFollowStatus':
                // Implementation here
                break;
            case 'getAllUsers':
                // Implementation here
                break;
            case 'batchCheckStatus':
                // Implementation here
                break;
            default:
                return createResponse(400, `Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Unexpected error in Lambda:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message });
    }
};

const getUser = async (identifier) => {
    const getParams = {
        TableName: 'Profiles',
        Key: { email: identifier },
    };
    try {
        const { Item } = await docClient.send(new GetCommand(getParams));
        return Item;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
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
