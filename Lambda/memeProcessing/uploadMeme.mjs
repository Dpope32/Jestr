import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, DetectModerationLabelsCommand, DetectLabelsCommand, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { getUserProfile } from './cacheServices.mjs';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sqsClient = new SQSClient({ region: "us-east-2" });
const s3Client = new S3Client({ region: "us-east-2" });
const rekognitionClient = new RekognitionClient({ region: "us-east-2" });

const BUCKET_NAME = "jestr-meme-uploads";
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

export const uploadMeme = async (email, username, caption, tags, mediaType, memeKey) => {
  console.log(`uploadMeme: Starting upload process for meme ${memeKey}`);
  console.log(`Parameters: email=${email}, username=${username}, caption=${caption}, tags=${JSON.stringify(tags)}, mediaType=${mediaType}, memeKey=${memeKey}`);

  if (!email || !username || !mediaType || !memeKey) {
    console.error("Missing required parameters for uploadMeme.");
    throw new Error("Email, username, media type, and meme key are required.");
  }

  try {
    const userProfile = await getUserProfile(email);
    
    if (!userProfile) {
      console.error("User profile not found for email:", email);
      throw new Error("User profile not found");
    }
    const profilePicUrl = userProfile.profilePic || "";

    // Initial metadata storage
    const initialMetadata = {
      MemeID: memeKey,
      Email: email,
      UploadTimestamp: new Date().toISOString(),
      MemeURL: `${CLOUDFRONT_URL}/${memeKey}`,
      Username: username,
      Caption: caption || "",
      Tags: tags || [],
      DetectedText: "",
      LikeCount: 0,
      DownloadCount: 0,
      CommentCount: 0,
      ShareCount: 0,
      mediaType: mediaType,
      ProfilePicUrl: profilePicUrl,
      Status: "processing",
    };

    console.log("uploadMeme: Storing initial metadata in DynamoDB");
    await docClient.send(new PutCommand({
      TableName: "Memes",
      Item: initialMetadata
    }));

    // Process the meme
    console.log("uploadMeme: Processing meme");
    const processedData = await processMeme(memeKey, mediaType);

    // Update DynamoDB with processed information
    console.log("uploadMeme: Updating DynamoDB with processed information");
    await docClient.send(new UpdateCommand({
      TableName: "Memes",
      Key: { MemeID: memeKey },
      UpdateExpression: "SET Tags = :tags, DetectedText = :text, #status = :status",
      ExpressionAttributeValues: {
        ":tags": processedData.generatedTags,
        ":text": processedData.detectedText,
        ":status": "active",
      },
      ExpressionAttributeNames: {
        "#status": "Status",
      },
    }));

    console.log("uploadMeme: Meme processed and stored successfully");
    return createResponse(200, "Meme uploaded and processed successfully.", {
      url: `${CLOUDFRONT_URL}/${memeKey}`,
      profilePicUrl: profilePicUrl,
      status: "active",
      tags: processedData.generatedTags,
      detectedText: processedData.detectedText
    });
  } catch (error) {
    console.error("Error during meme upload and processing:", error.stack || error);
    return createResponse(500, `Failed to upload and process meme: ${error.message}`);
  }
};

const processMeme = async (memeKey, mediaType) => {
  console.log(`processMeme: Starting processing for meme ${memeKey}`);
  let generatedTags = [];
  let detectedText = "";

  if (mediaType === "image") {
    const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: memeKey }));
    const imageBuffer = await streamToBuffer(Body);

    // Moderation check
    console.log(`processMeme: Performing moderation check for ${memeKey}`);
    const moderationResponse = await rekognitionClient.send(new DetectModerationLabelsCommand({
      Image: { Bytes: imageBuffer },
      MinConfidence: 70,
    }));
    const inappropriateContent = moderationResponse.ModerationLabels.some(
      (label) => ["Explicit Nudity", "Nudity", "Graphic Violence"].includes(label.Name)
    );

    if (inappropriateContent) {
      console.log(`processMeme: Inappropriate content detected in ${memeKey}.`);
      throw new Error("Inappropriate content detected.");
    }

    // Generate tags
    console.log(`processMeme: Generating tags for ${memeKey}`);
    const labelsResponse = await rekognitionClient.send(new DetectLabelsCommand({
      Image: { Bytes: imageBuffer },
      MaxLabels: 5,
      MinConfidence: 70,
    }));
    generatedTags = labelsResponse.Labels.map((label) => label.Name);

    // Detect text
    console.log(`processMeme: Detecting text in ${memeKey}`);
    const textResponse = await rekognitionClient.send(new DetectTextCommand({
      Image: { Bytes: imageBuffer },
    }));
    detectedText = textResponse.TextDetections
      .filter((text) => text.Type === 'LINE' && text.Confidence >= 70)
      .map((text) => text.DetectedText)
      .join(' ')
      .substring(0, 100);
  } else {
    generatedTags = ["Video", "Unclassified"];
  }

  console.log(`processMeme: Successfully processed meme ${memeKey}`);
  return { generatedTags, detectedText };
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const createResponse = (statusCode, message, data = null) => {
  console.log(`Creating response: statusCode=${statusCode}, message=${message}, data=${JSON.stringify(data)}`);
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify({ message, data }),
  };
};