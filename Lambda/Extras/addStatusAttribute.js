const AWS = require('aws-sdk');

// Set the AWS region
AWS.config.update({region: 'us-east-2'}); 

const docClient = new AWS.DynamoDB.DocumentClient();

async function addStatusToMemes() {
  let lastEvaluatedKey = null;
  
  do {
    const params = {
      TableName: 'Memes',
      Limit: 25 
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await docClient.scan(params).promise();

    const updatePromises = result.Items.map(item => {
      return docClient.update({
        TableName: 'Memes',
        Key: { MemeID: item.MemeID },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'Status' },
        ExpressionAttributeValues: { ':status': 'active' }
      }).promise();
    });

    await Promise.all(updatePromises);

    console.log(`Processed ${result.Items.length} items`);

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log('Finished adding Status attribute to all memes');
}

addStatusToMemes().catch(console.error);