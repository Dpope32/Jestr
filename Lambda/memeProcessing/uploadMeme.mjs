// uploadMeme.mjs

import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
  DetectTextCommand,
} from "@aws-sdk/client-rekognition";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer, createResponse } from './utils.mjs';
import { getUserProfile } from './cacheServices.mjs';
import redis from './redisClient.js';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const rekognitionClient = new RekognitionClient({ region: "us-east-2" });
const s3Client = new S3Client({ region: "us-east-2" });
const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

/**
 * Function to upload and process a meme.
 * @param {string} email - User's email.
 * @param {string} username - User's username.
 * @param {string} caption - Meme caption.
 * @param {Array} tags - User-provided tags for the meme (optional).
 * @param {string} mediaType - Type of media ('image' or 'video').
 * @param {string} memeKey - S3 object key for the meme.
 * @returns {Promise<Object>} - Result of the upload and processing.
 */
export const uploadMeme = async (email, username, caption, tags, mediaType, memeKey) => {
  console.log("Operation: uploadMeme");
  console.log(`Parameters: email=${email}, username=${username}, caption=${caption}, tags=${tags}, mediaType=${mediaType}, memeKey=${memeKey}`);

  if (!email || !username || !mediaType || !memeKey) {
    console.error("Missing required parameters for uploadMeme.");
    throw new Error("Email, username, media type, and meme key are required.");
  }

  try {
    // Fetch user profile
    const userProfileParams = {
      TableName: "Profiles",
      Key: { email: email },
    };
    const userProfileResult = await docClient.send(new GetCommand(userProfileParams));
    const userProfile = userProfileResult.Item;

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const profilePicUrl = userProfile.profilePic || "";

    let generatedTags = [];
    let detectedText = "";
    let inappropriateContent = false;

    if (mediaType === "image") {
      // Fetch the image from S3
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: memeKey,
      });
      const { Body } = await s3Client.send(getObjectCommand);
      const imageBuffer = await streamToBuffer(Body);

      // Detect moderation labels
      const moderationParams = {
        Image: { Bytes: imageBuffer },
        MinConfidence: 70,
      };
      const moderationCommand = new DetectModerationLabelsCommand(moderationParams);
      const moderationResponse = await rekognitionClient.send(moderationCommand);
      const moderationLabels = moderationResponse.ModerationLabels;
      console.log("Moderation labels detected:", moderationLabels);

      // Check for inappropriate content
      inappropriateContent = moderationLabels.some((label) => ["Explicit Nudity", "Nudity", "Graphic Violence"].includes(label.Name));

      if (inappropriateContent) {
        // Delete the meme from S3 and DynamoDB
        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: memeKey }));
        console.error("Inappropriate content detected. Meme deleted.");
        throw new Error("Inappropriate content detected. Your meme was not uploaded.");
      }

      // Detect labels for tags
      const labelsParams = {
        Image: { Bytes: imageBuffer },
        MaxLabels: 5, // Ensure up to 5 labels
        MinConfidence: 70,
      };
      const labelsCommand = new DetectLabelsCommand(labelsParams);
      const labelsResponse = await rekognitionClient.send(labelsCommand);
      generatedTags = labelsResponse.Labels.map((label) => label.Name);
      console.log("Generated tags:", generatedTags);

      // Ensure we have exactly 5 tags
      while (generatedTags.length < 5) {
        generatedTags.push("Unclassified");
      }
      generatedTags = generatedTags.slice(0, 5);

      // Detect text
      detectedText = await detectText(imageBuffer);
      console.log("Detected text:", detectedText);

    } else {
      // For videos, set default tags and skip text detection
      console.log("Skipping Rekognition processing for video.");
      generatedTags = ["Video"];
      while (generatedTags.length < 5) {
        generatedTags.push("Unclassified");
      }
      detectedText = "";
    }

    // Prepare meme metadata
    const memeMetadataParams = {
      TableName: "Memes",
      Item: {
        MemeID: memeKey,
        Email: email,
        UploadTimestamp: new Date().toISOString(),
        MemeURL: `${CLOUDFRONT_URL}/${memeKey}`,
        Username: username,
        Caption: caption || "",
        Tags: generatedTags,
        DetectedText: detectedText,
        LikeCount: 0,
        DownloadsCount: 0,
        CommentCount: 0,
        ShareCount: 0,
        mediaType: mediaType,
        ProfilePicUrl: profilePicUrl,
      },
    };

    // Store meme metadata in DynamoDB
    await docClient.send(new PutCommand(memeMetadataParams));
    console.log("Meme metadata stored successfully with tags and detected text.");

    // Cache the meme data in Redis
    const memeData = {
      mediaType: mediaType,
      url: `${CLOUDFRONT_URL}/${memeKey}`,
      memeID: memeKey,
      email: email,
      uploadTimestamp: memeMetadataParams.Item.UploadTimestamp,
      username: username,
      caption: caption || '',
      likeCount: 0,
      downloadCount: 0,
      commentCount: 0,
      shareCount: 0,
      profilePicUrl: profilePicUrl,
      // Optionally include tags and detected text in cache
      // tags: generatedTags,
      // detectedText: detectedText,
    };
    await redis.hmset(`meme:${memeKey}`, memeData);
    await redis.expire(`meme:${memeKey}`, 43200); // 12 hours
    console.log(`Cached meme data for ${memeKey} in Redis.`);

    return createResponse(200, "Meme uploaded and processed successfully.", {
      url: `${CLOUDFRONT_URL}/${memeKey}`,
      profilePicUrl: profilePicUrl,
    });
  } catch (error) {
    console.error("Error during meme upload and processing:", error);
    return createResponse(500, `Failed to upload and process meme: ${error.message}`);
  }
};

/**
 * Function to detect text in an image using Rekognition.
 * @param {Buffer} imageBuffer - The image buffer.
 * @returns {Promise<string>} - Detected text limited to 100 characters.
 */
const detectText = async (imageBuffer) => {
  const params = {
    Image: { Bytes: imageBuffer },
  };

  try {
    const command = new DetectTextCommand(params);
    const response = await rekognitionClient.send(command);
    const detectedTexts = response.TextDetections
      .filter((text) => text.Type === 'LINE' && text.Confidence >= 70)
      .map((text) => text.DetectedText)
      .join(' ');

    // Limit text to first 100 characters
    return detectedTexts.substring(0, 100);
  } catch (error) {
    console.error('Error detecting text:', error);
    return '';
  }
};
