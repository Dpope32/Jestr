// utils.mjs

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const s3Client = new S3Client({ region: "us-east-2" });

/**
 * Helper function to create standardized responses.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Response message.
 * @param {Object|null} data - Additional data to include in the response.
 * @returns {Object} - Lambda response object.
 */
export const createResponse = (statusCode, message, data = null) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  body: JSON.stringify({ message, data }),
});

/**
 * Helper function to convert stream to buffer.
 * @param {Stream} stream - Readable stream.
 * @returns {Promise<Buffer>} - Buffer containing stream data.
 */
export const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

/**
 * Function to generate a presigned URL for uploading a meme.
 * @param {string} fileName - Name of the file.
 * @param {string} fileType - MIME type of the file.
 * @returns {Promise<Object>} - Presigned URL and file key.
 */
export const getPresignedUrl = async (fileName, fileType) => {
  const fileKey = `Memes/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { uploadURL, fileKey };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};
