import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const contentTypeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};


export const uploadToS3 = async (file, key) => {
  console.log('File to be uploaded:', file);
  console.log('File name:', file.name);
  console.log('File type:', file.type);
  console.log('File size:', file.size);

  const fileExtension = key.substring(key.lastIndexOf('.')).toLowerCase();
  const contentType = contentTypeMap[fileExtension] || 'image/jpeg';

  const fileData = await file.arrayBuffer();
  console.log('File data:', fileData);

  const params = {
    Bucket: 'jestr-bucket',
    Key: key,
    Body: new Uint8Array(fileData),
    ContentType: contentType,
  };

  try {
    await s3.putObject(params).promise();
    const fileUrl = `https://jestr-bucket.s3.amazonaws.com/${key}`;
    console.log(`File uploaded successfully: ${fileUrl}`);
    return fileUrl;
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
    if (!data || !data.Body) {
      console.error('No data or no body returned from S3:', data);
      throw new Error("No image data returned from S3");
    }
    console.log('Content Type:', data.ContentType);

    const blob = new Blob([data.Body], { type: data.ContentType || 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw error;
  }
};