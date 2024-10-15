import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
const s3Client = new S3Client({ region: "us-east-2" });

console.log(`Initialized S3Client with bucket: ${BUCKET_NAME}, CloudFront URL: ${CLOUDFRONT_URL}`);

/**
 * Helper function to create standardized responses.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Response message.
 * @param {Object|null} data - Additional data to include in the response.
 * @returns {Object} - Lambda response object.
 */
export const createResponse = (statusCode, message, data = null) => {
  console.log(`Creating response: statusCode=${statusCode}, message=${message}, data=${JSON.stringify(data)}`);
  
  // Ensure data always has a url property
  const responseData = data || {};
  if (!responseData.url && responseData.fileKey) {
    responseData.url = `${CLOUDFRONT_URL}/${responseData.fileKey}`;
  }
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify({ message, data: responseData }),
  };
};

/**
 * Helper function to convert stream to buffer.
 * @param {Stream} stream - Readable stream.
 * @returns {Promise<Buffer>} - Buffer containing stream data.
 */
export const streamToBuffer = async (stream) => {
  console.log('Starting streamToBuffer conversion');
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => {
      console.log(`Received chunk of size: ${chunk.length} bytes`);
      chunks.push(chunk);
    });
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      console.log(`Stream converted to buffer of size: ${buffer.length} bytes`);
      resolve(buffer);
    });
    stream.on("error", (error) => {
      console.error('Error in streamToBuffer:', error);
      reject(error);
    });
  });
};

/**
 * Function to generate a presigned URL for uploading a meme.
 * @param {string} fileName - Name of the file.
 * @param {string} fileType - MIME type of the file.
 * @returns {Promise<Object>} - Presigned URL and file key.
 */
export const getPresignedUrl = async (fileName, fileType) => {
  console.log(`Generating presigned URL for fileName: ${fileName}, fileType: ${fileType}`);
  const fileKey = `Memes/${fileName}`;
  console.log(`Generated fileKey: ${fileKey}`);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    console.log('Attempting to get signed URL');
    const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log(`Generated presigned URL for ${fileKey}: ${uploadURL}`);
    return { uploadURL, fileKey };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};
