import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, DetectModerationLabelsCommand, DetectLabelsCommand, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region: "us-east-2" });
const rekognitionClient = new RekognitionClient({ region: "us-east-2" });
const sqsClient = new SQSClient({ region: "us-east-2" });

const BUCKET_NAME = "jestr-meme-uploads";
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

export const handler = async (event) => {
  console.log("SQS Meme Processor: Starting processing");
  
  for (const record of event.Records) {
    console.log(`Processing SQS message: ${record.messageId}`);
    const messageBody = JSON.parse(record.body);
    const { memeKey, email, username, caption, mediaType, profilePicUrl } = messageBody;

    try {
      await processMeme(memeKey, email, username, caption, mediaType, profilePicUrl);
      
      // Delete the message from the queue after successful processing
      await sqsClient.send(new DeleteMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        ReceiptHandle: record.receiptHandle
      }));
      console.log(`SQS message processed and deleted: ${record.messageId}`);
    } catch (error) {
      console.error(`Error processing meme ${memeKey}:`, error);
      // Implement retry logic or dead-letter queue handling here
    }
  }
};

const processMeme = async (memeKey, email, username, caption, mediaType, profilePicUrl) => {
  console.log(`processMeme: Starting processing for meme ${memeKey}`);
  let generatedTags = [];
  let detectedText = "";
  let inappropriateContent = false;

  if (mediaType === "image") {
    const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: memeKey }));
    const imageBuffer = await streamToBuffer(Body);

    // Moderation check
    console.log(`processMeme: Performing moderation check for ${memeKey}`);
    const moderationResponse = await rekognitionClient.send(new DetectModerationLabelsCommand({
      Image: { Bytes: imageBuffer },
      MinConfidence: 70,
    }));
    inappropriateContent = moderationResponse.ModerationLabels.some(
      (label) => ["Explicit Nudity", "Nudity", "Graphic Violence"].includes(label.Name)
    );

    if (inappropriateContent) {
      console.log(`processMeme: Inappropriate content detected in ${memeKey}. Deleting meme.`);
      await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: memeKey }));
      throw new Error("Inappropriate content detected. Meme deleted.");
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
    generatedTags = ["Video", "Unclassified", "Unclassified", "Unclassified", "Unclassified"];
  }

  // Update DynamoDB with processed information
  console.log(`processMeme: Updating DynamoDB for ${memeKey}`);
  await docClient.send(new UpdateCommand({
    TableName: "Memes",
    Key: { MemeID: memeKey },
    UpdateExpression: "SET Tags = :tags, DetectedText = :text, #status = :status",
    ExpressionAttributeValues: {
      ":tags": generatedTags,
      ":text": detectedText,
      ":status": "active",
    },
    ExpressionAttributeNames: {
      "#status": "Status",
    },
  }));

  console.log(`processMeme: Successfully processed meme ${memeKey}`);
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};