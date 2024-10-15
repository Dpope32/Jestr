// dynamoManagement.mjs
// fetchLikedMemes, fetchDownloadedMemes, fetchViewHistory, getAllUsers
// must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

import { DynamoDBDocumentClient, GetCommand, BatchGetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const REGION = 'us-east-2'; // Replace with your actual region

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = ['fetchLikedMemes', 'fetchDownloadedMemes', 'fetchViewHistory', 'getAllUsers'];

export const handler = async (event) => {
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

            case 'fetchLikedMemes': {
                const { email, lastEvaluatedKey, limit = 10 } = requestBody;
                if (!email) {
                    console.error('Email is required to fetch liked memes.');
                    return createResponse(400, 'Email is required to fetch liked memes.');
                }
                
                const queryParams = {
                    TableName: 'UserLikes',
                    IndexName: 'email-Timestamp-index',
                    KeyConditionExpression: 'email = :email',
                    ExpressionAttributeValues: {
                        ':email': email,
                    },
                    ScanIndexForward: false,
                    Limit: limit,
                    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
                };
                
                try {
                    const result = await docClient.send(new QueryCommand(queryParams));

                    const memeDetails = await Promise.all(result.Items.map(async (item) => {
                        const memeParams = {
                            TableName: 'Memes',
                            Key: { MemeID: item.MemeID }
                        };
                        try {
                            const { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
                            if (!memeItem) {
                                console.warn(`Meme not found for MemeID: ${item.MemeID}`);
                                return null;
                            }
                            // No manual unmarshalling needed
                            return {
                                ...item,
                                MemeURL: `${CLOUDFRONT_URL}/${memeItem.MemeID}`,
                                ProfilePicUrl: memeItem.ProfilePicUrl || '',
                                Username: memeItem.Username || '',
                                Caption: memeItem.Caption || '',
                                LikeCount: memeItem.LikeCount || 0,
                                DownloadCount: memeItem.DownloadCount || 0,
                                CommentCount: memeItem.CommentCount || 0,
                                ShareCount: memeItem.ShareCount || 0,
                                mediaType: memeItem.mediaType || 'image' 
                            };
                        } catch (memeError) {
                            console.error(`Error fetching meme details for MemeID: ${item.MemeID}`, memeError);
                            return null;
                        }
                    }));
                
                    const validMemeDetails = memeDetails.filter(meme => meme !== null);
                    return createResponse(200, 'Liked memes retrieved successfully.', {
                        data: {
                            memes: validMemeDetails,
                            lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
                        }
                    });
                } catch (error) {
                    console.error('Error fetching liked memes:', error);
                    return createResponse(500, 'Failed to fetch liked memes.');
                }
            }

            case 'fetchDownloadedMemes': {
                const { email, lastEvaluatedKey, limit = 10 } = requestBody;
                if (!email) {
                    return createResponse(400, 'Email is required to fetch downloaded memes.');
                }

                const queryParams = {
                    TableName: 'UserDownloads',
                    IndexName: 'email-Timestamp-index',
                    KeyConditionExpression: 'email = :email',
                    ExpressionAttributeValues: {':email': email},
                    ScanIndexForward: false,
                    Limit: limit,
                    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
                };
                try {
                    const result = await docClient.send(new QueryCommand(queryParams));
                    if (!result.Items || result.Items.length === 0) {
                        return createResponse(200, 'No downloaded memes found.', { data: { memes: [], lastEvaluatedKey: null } });
                    }
                const memeDetails = await Promise.all(result.Items.map(async (item) => {
                    const memeParams = {
                        TableName: 'Memes',
                        Key: { MemeID: item.MemeID }
                    };
                    try {
                        const { Item: memeItem } = await docClient.send(new GetCommand(memeParams));
                        if (!memeItem) {
                            console.warn(`Meme not found for MemeID: ${item.MemeID}`);
                            return null;
                        }
                        // No manual unmarshalling needed
                        return {
                            ...item,
                            MemeURL: `${CLOUDFRONT_URL}/${memeItem.MemeID}`,
                            Username: memeItem.Username || '',
                            Caption: memeItem.Caption || '',
                            LikeCount: memeItem.LikeCount || 0,
                            DownloadCount: memeItem.DownloadCount || 0,
                            CommentCount: memeItem.CommentCount || 0,
                            ShareCount: memeItem.ShareCount || 0,
                            mediaType: memeItem.mediaType || 'image', 
                            ProfilePicUrl: memeItem.ProfilePicUrl || ''
                        };
                    } catch (memeError) {
                        console.error(`Error fetching meme details for MemeID: ${item.MemeID}`, memeError);
                        return null;
                    }
                }));
                const validMemeDetails = memeDetails.filter(meme => meme !== null);
                return createResponse(200, 'Downloaded memes retrieved successfully.', {
                data: {
                    memes: validMemeDetails,
                    lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
                    }
                });
                } catch (error) {
                    console.error('Error fetching downloaded memes:', error);
                return createResponse(500, 'Failed to fetch downloaded memes.');
                }
            }

            case 'fetchViewHistory': {
                const { email, lastEvaluatedKey, limit = 25 } = requestBody;

                if (!email) {
                    console.error('Email is required to fetch view history.');
                return createResponse(400, 'Email is required to fetch view history.');
                }
                
                const viewHistoryCommand = new QueryCommand({
                    TableName: 'UserMemeViews',
                    KeyConditionExpression: 'email = :email',
                    ExpressionAttributeValues: { ':email': email }, 
                    ScanIndexForward: false, 
                    Limit: limit,
                    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
                });
                
                try {
                const viewHistoryResponse = await docClient.send(viewHistoryCommand);
                if (!viewHistoryResponse.Items || viewHistoryResponse.Items.length === 0) {
                    return createResponse(200, 'No view history found.', { data: { memes: [], lastEvaluatedKey: null } });
                }
                const viewedMemeIDs = viewHistoryResponse.Items
                    .flatMap(item => item.viewedMemes || [])    
                    .slice(0, limit)
                    .map(meme => typeof meme === 'string' ? meme : meme.S);
                
                const batchGetParams = {RequestItems: {'Memes': {Keys: viewedMemeIDs.map(memeID => ({ MemeID: memeID }))}}};
                const batchGetCommand = new BatchGetCommand(batchGetParams);
                const batchGetResponse = await docClient.send(batchGetCommand);
                
                const memeDetailsMap = new Map(batchGetResponse.Responses.Memes.map(meme => [meme.MemeID, meme]));
                
                const memeDetails = viewedMemeIDs.map(memeID => {
                const memeItem = memeDetailsMap.get(memeID);

                if (!memeItem) {
                    console.warn(`Meme not found for MemeID: ${memeID}`);
                    return null;
                }
                return {
                    ...memeItem,
                    MemeURL: `${CLOUDFRONT_URL}/${memeItem.MemeID}`,
                    viewedAt: viewHistoryResponse.Items.find(item => item.viewedMemes.includes(memeID)).date,
                    mediaType: memeItem.mediaType || 'image'
                };
                }).filter(meme => meme !== null);
                return createResponse(200, 'View history retrieved successfully.', {
                data: {
                    memes: memeDetails,
                    lastEvaluatedKey: viewHistoryResponse.LastEvaluatedKey ? JSON.stringify(viewHistoryResponse.LastEvaluatedKey) : null
                }
                });
                } catch (error) {
                    console.error('Error fetching view history:', error);
                return createResponse(500, 'Failed to fetch view history.', { error: error.message });
                }
            }

            case 'getAllUsers': {
                const params = {
                    TableName: 'Profiles',
                    ProjectionExpression: 'email, username, profilePic'
                };
                try {
                    const { Items } = await docClient.send(new ScanCommand(params));

                    // Log the raw Items
                    console.log('Raw Items from DynamoDB:', JSON.stringify(Items, null, 2));

                    // Transform Items
                    const users = Items.map(item => ({
                        email: item.email || null,
                        username: item.username || null,
                        profilePic: item.profilePic || null
                    })).filter(user => user.email); // Filter out any users without an email

                    // Log the transformed users
                    console.log('Transformed Users:', JSON.stringify(users, null, 2));

                    return createResponse(200, 'Users retrieved successfully.', { users });
                } 
                catch (error) {
                    console.error('Error fetching users:', error);
                    return createResponse(500, 'Failed to fetch users.');
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
