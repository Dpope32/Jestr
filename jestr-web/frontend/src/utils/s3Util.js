import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS = require('aws-sdk');

// Update the AWS Config first
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

// Then create the S3 service object with the updated config
const s3 = new AWS.S3();
// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

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
  try {
    const params = {
      Bucket: 'jestr-bucket',
      Key: key,
    };

    // Send the GetObjectCommand using the s3Client
    const data = await s3Client.send(new GetObjectCommand(params));

    // Generate a signed URL for read access
    const url = await getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: 3600 });
    console.log('Signed URL:', url); // This will be the URL you can use in <img> tags or download links
    return url;
  } catch (error) {
    console.error('Error fetching from S3:', error);
    throw error;
  }
};