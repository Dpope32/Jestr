// adminServices.mjs

import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Initialize AWS clients
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-2_ifrUnY9b1",
    tokenUse: "access",
    clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

  
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
  
      const publicOperations = ['getPopularMemes','getTotalMemes','deleteMeme','removeDownloadedMeme','getTotalUsers','getUserGrowthRate','getDAU'];
  
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
  
        case 'getTotalMemes':
          try {
            const params = {
              TableName: 'Memes',
              Select: 'COUNT'
            };
            const result = await docClient.send(new ScanCommand(params));
            return createResponse(200, 'Total memes retrieved successfully.', { totalMemes: result.Count });
          } catch (error) {
            console.error('Error getting total memes:', error);
            return createResponse(500, 'Failed to get total memes');
        }
  
        case 'getPopularMemes':
          try {
            const params = {
              TableName: 'Memes',
              IndexName: 'LikeCount-index',
              Limit: 100,  
              ScanIndexForward: false
            };
            const result = await docClient.send(new ScanCommand(params));
  
            const sortedMemes = result.Items.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0)).slice(0, 5);
  
            return createResponse(200, 'Popular memes retrieved successfully.', { popularMemes: sortedMemes });
          } catch (error) {
            console.error('Error getting popular memes:', error);
            return createResponse(500, 'Failed to get popular memes', { error: error.message });
        }
  
        case 'deleteMeme': {
          const { memeID, userEmail } = requestBody;
  
          if (!memeID || !userEmail) {
            console.log('Missing required fields for deleting a meme');
            return createResponse(400, 'MemeID and userEmail are required for deleting a meme.');
          }
  
          try {
            // First, check if the meme exists
            const getMemeParams = {
              TableName: 'Memes',
              Key: { MemeID: memeID },
            };
  
            const memeData = await docClient.send(new GetCommand(getMemeParams));
  
            if (!memeData.Item) {
              console.log(`Meme not found. MemeID: ${memeID}`);
              return createResponse(404, 'Meme not found');
            }
  
            if (memeData.Item.Email !== userEmail) {
              console.log(`Unauthorized delete attempt. Meme owner: ${memeData.Item.Email}, Requester: ${userEmail}`);
              return createResponse(403, 'You are not authorized to delete this meme');
            }
  
            // If the meme exists and the user is the owner, proceed with deletion
            const deleteParams = {
              TableName: 'Memes',
              Key: { MemeID: memeID },
            };
  
            await docClient.send(new DeleteCommand(deleteParams));
  
            return createResponse(200, 'Meme deleted successfully');
          } catch (error) {
            console.error('Error deleting meme:', error);
            return createResponse(500, 'Error deleting meme', { error: error.message });
          }
        }
  
        case 'removeDownloadedMeme': {
          const { userEmail, memeID } = requestBody;
  
          if (!userEmail || !memeID) {
            return createResponse(400, 'UserEmail and memeID are required for removing a downloaded meme.');
          }
  
          try {
            const params = {
              TableName: 'UserDownloads',
              Key: {
                email: userEmail,
                MemeID: memeID,
              },
            };
  
            await docClient.send(new DeleteCommand(params));
            console.log('Downloaded meme removed successfully');
            return createResponse(200, 'Downloaded meme removed successfully');
          } catch (error) {
            console.error('Error removing downloaded meme:', error);
            return createResponse(500, 'Error removing downloaded meme', { error: error.message });
          }
        }

        case 'getTotalUsers':
            try {
            const params = {
              TableName: 'Profiles',
              Select: 'COUNT'
            };
            const result = await docClient.send(new ScanCommand(params));
            return createResponse(200, 'Total users retrieved successfully.', { totalUsers: result.Count });
            } catch (error) {
            console.error('Error getting total users:', error);
            return createResponse(500, 'Failed to get total users');
        }

        case 'getUserGrowthRate':
        try {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const paramsToday = {
            TableName: 'Profiles',
            Select: 'COUNT'
        };
        const paramsLastWeek = {
            TableName: 'Profiles',
            FilterExpression: '#cd <= :lastWeek',
            ExpressionAttributeNames: {
            '#cd': 'creationDate'
            },
            ExpressionAttributeValues: {
            ':lastWeek': lastWeek.toISOString()
            },
            Select: 'COUNT'
        };
        
        const [resultToday, resultLastWeek] = await Promise.all([
            docClient.send(new ScanCommand(paramsToday)),
            docClient.send(new ScanCommand(paramsLastWeek))
        ]);
        
        const growthRate = resultLastWeek.Count === 0 
            ? 100  // If there were no users last week, set growth rate to 100%
            : ((resultToday.Count - resultLastWeek.Count) / resultLastWeek.Count) * 100;
        
        return createResponse(200, 'User growth rate calculated successfully.', { userGrowthRate: growthRate.toFixed(2) });
        } catch (error) {
        console.error('Error calculating user growth rate:', error);
        return createResponse(500, 'Failed to calculate user growth rate');
        }

        case 'getDAU':
            try {
                // Get the date for 3 days ago in UTC
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                const threeDaysAgoString = threeDaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
                const params = {
                TableName: 'UserMemeViews',
                FilterExpression: '#date >= :threeDaysAgo',
                ExpressionAttributeNames: {
                    '#date': 'date'
                },
                ExpressionAttributeValues: {
                    ':threeDaysAgo': threeDaysAgoString
                }
                };
                
            //  console.log('DAU Params:', JSON.stringify(params));
                const result = await docClient.send(new ScanCommand(params));
            //  console.log('DAU Result:', JSON.stringify(result));
                
                // Count unique emails
                const uniqueEmails = new Set(result.Items.map(item => item.email));
                const activeUsers = uniqueEmails.size;
            
                return createResponse(200, 'Active users in the last 3 days retrieved successfully.', { 
                activeUsers,
                debugInfo: {
                    fromDate: threeDaysAgoString,
                    toDate: new Date().toISOString().split('T')[0],
                    scannedCount: result.ScannedCount,
                    matchedCount: result.Count,
                    uniqueEmailCount: activeUsers,
                    sampleItems: result.Items.slice(0, 5) // Include up to 5 sample items for debugging
                }
                });
            } catch (error) {
                console.error('Error getting active users:', error);
                return createResponse(500, 'Failed to get active users', { error: error.message });
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