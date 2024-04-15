import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (file, key) => {
  console.log('File to be uploaded:', file);
  const params = {
    Bucket: 'jestr-bucket',
    Key: key,
    Body: file,
  };
  try {
    await s3.upload(params).promise();
    const fileUrl = `https://jestr-bucket.s3.amazonaws.com/${key}`;
    console.log(`File uploaded successfully: ${fileUrl}`);
    window.open(fileUrl, '_blank'); // Open the uploaded file in a new tab
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
    const base64Data = data.Body.toString('base64');
    console.log('Base64 data:', base64Data);
    return `data:image/jpeg;base64,${base64Data}`;
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw error;
  }
};

const testUpload = async () => {
  const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  const key = 'test-upload.jpg';
  try {
    const fileUrl = await uploadToS3(file, key);
    console.log('Test file uploaded successfully:', fileUrl);
  } catch (error) {
    console.error('Error uploading test file:', error);
  }
};

// Call the testUpload function
testUpload();