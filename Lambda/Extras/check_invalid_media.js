const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const s3Client = new S3Client({ region: 'us-east-2' }); // replace with your region
const dynamoClient = new DynamoDBClient({ region: 'us-east-2' }); // replace with your region

const BATCH_SIZE = 25; // Adjust this value as needed

exports.handler = async (event) => {
    console.log('Function started');
    const bucketName = 'jestr-meme-uploads';
    const tableName = 'Memes';
    
    let invalidMemes = [];
    let lastEvaluatedKey = event.lastEvaluatedKey;
    
    try {
        console.log(`Scanning DynamoDB table, starting from ${lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : 'beginning'}`);
        const scanParams = {
            TableName: tableName,
            Limit: BATCH_SIZE,
            ExclusiveStartKey: lastEvaluatedKey
        };
        
        const data = await dynamoClient.send(new ScanCommand(scanParams));
        console.log(`Found ${data.Items.length} items in this batch`);
        
        for (let i = 0; i < data.Items.length; i++) {
            const item = data.Items[i];
            const unmarshalledItem = unmarshall(item);
            const key = unmarshalledItem.MemeID.split('/').pop();
            console.log(`Checking item ${i+1}/${data.Items.length}: ${key}`);
            try {
                await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
            } catch (err) {
                if (err.name === 'NotFound') {
                    invalidMemes.push(unmarshalledItem.MemeID);
                    console.log(`Invalid meme found: ${unmarshalledItem.MemeID}`);
                } else {
                    console.error(`Error checking S3 for ${key}:`, err);
                }
            }
        }
        
        console.log('Batch complete. Invalid memes in this batch:', invalidMemes);
        
        if (data.LastEvaluatedKey) {
            console.log('More items to process. Invoking next batch.');
            // Invoke the function again with the new LastEvaluatedKey
            const lambda = new (require('@aws-sdk/client-lambda').LambdaClient)({ region: 'us-east-2' });
            await lambda.send(new (require('@aws-sdk/client-lambda').InvokeCommand)({
                FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
                InvocationType: 'Event',
                Payload: JSON.stringify({ lastEvaluatedKey: data.LastEvaluatedKey })
            }));
        } else {
            console.log('All items processed.');
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ invalidMemes, lastEvaluatedKey: data.LastEvaluatedKey })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process memes' })
        };
    }
};