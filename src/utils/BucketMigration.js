const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({ region: 'us-east-2' });

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = 'jestr-meme-uploads';
const TABLE_NAME = 'Memes';

async function processImagesAndVideos() {
    console.log('Starting processImagesAndVideos');
    const listParams = {
      Bucket: BUCKET_NAME,
    };
  
    console.log('Listing objects in bucket');
    const listedObjects = await s3.listObjectsV2(listParams).promise();
    console.log(`Found ${listedObjects.Contents.length} objects`);
  
    for (const object of listedObjects.Contents) {
      console.log(`Processing object: ${object.Key}`);
    const oldKey = object.Key;
    const fileExtension = oldKey.split('.').pop().toLowerCase();
    const newKey = `Memes/pope.dawson@gmail.com-meme-${uuid.v4()}.${fileExtension}`;

    // Rename object in S3
    await s3.copyObject({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${oldKey}`,
      Key: newKey
    }).promise();

    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: oldKey
    }).promise();

    // Create DynamoDB entry
    const item = {
      MemeID: newKey,
      Caption: '',
      CommentCount: 0,
      DownloadCount: 0,
      DownloadsCount: 0,
      Email: 'pope.dawson@gmail.com',
      LikeCount: Math.floor(Math.random() * 501),
      mediaType: fileExtension === 'mp4' ? 'video' : 'image',
      MemeURL: `https://${BUCKET_NAME}.s3.amazonaws.com/${newKey}`,
      ProfilePicUrl: 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/pope.dawson@gmail.com-profilePic-1719862276108.jpg',
      ShareCount: Math.floor(Math.random() * 101),
      Tags: ['Dank', 'Admin'],
      UploadTimestamp: new Date(2024, 5 + Math.floor(Math.random() * 4), 1 + Math.floor(Math.random() * 30)).toISOString(),
      Username: 'Admin'
    };

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: item
    }).promise();

   console.log('Finished processing all objects');
    }
}

processImagesAndVideos().catch(error => {
  console.error('Error in processImagesAndVideos:', error);
});