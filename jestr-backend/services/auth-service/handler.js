'use strict';

// Assuming the creation of a meme involves storing an item in DynamoDB
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = async (event) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: 'Memes',
    Item: {
      id: data.id, // Ensure 'id' is passed in the body of your request
      // Add other meme attributes here
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Meme created successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create meme", error: error.message }),
    };
  }
};
