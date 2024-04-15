import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (file, key) => {
  console.log('File to be uploaded:', file);

  // Convert the File object to a binary array
  const binaryArray = await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
    fileReader.readAsArrayBuffer(file);
  });

  const params = {
    Bucket: 'jestr-bucket',
    Key: key,
    Body: binaryArray,
    ContentType: file.type,
  };

  try {
    await s3.upload(params).promise();
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
    // Assuming data.Body is an instance of ArrayBuffer
    if (data.Body instanceof ArrayBuffer) {
      const blob = new Blob([data.Body], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } else {
      throw new Error("No image data returned from S3");
    }
  } catch (error) {
    console.error('Error retrieving file from S3:', error);
    throw error;
  }
};
