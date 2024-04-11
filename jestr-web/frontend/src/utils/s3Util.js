const AWS = require('aws-sdk');

// Update the AWS Config first
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Then create the S3 service object with the updated config
const s3 = new AWS.S3();

export const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: 'jestr-bucket',
    Key: key,
    Body: file,
  };

  try {
    await s3.upload(params).promise();
    console.log(`File uploaded successfully: ${key}`);
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

export const getFromS3 = async (key) => {
  const params = {
    Bucket: 'jestr-bucket',
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body;
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw error;
  }
};
