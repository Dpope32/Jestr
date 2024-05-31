import { API_URL } from './config';
import RNFetchBlob from 'rn-fetch-blob';

export const fetchMemes = async (): Promise<{ memeID: string; email: string; url: string; uploadTimestamp: string; username: string; caption: string; }[]> => {
  try {
    const requestUrl = `${API_URL}/getMemes`;
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation: 'getMemes' })
    });

    console.log('HTTP Response Status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      console.log('Failed to fetch memes. Status:', response.status);
      return [];
    }
    const data = JSON.parse(responseText);
    return data.user.map((meme: any) => ({
      ...meme,
      username: meme.username || 'defaultUsername',
      caption: meme.caption || 'defaultCaption'
    })) || [];
  } catch (error) {
    console.error('Error fetching memes:', error);
    return [];
  }
};

export const uploadMeme = async (imageUri: string, userEmail: string): Promise<{ url: string }> => {
  try {
    console.log('Uploading meme...');
    console.log('Image URI:', imageUri);
    console.log('User Email:', userEmail);

    const memeData = await fileToBase64(imageUri);

    const requestBody = {
      operation: "uploadMeme",  // Make sure to include the operation if your Lambda expects it
      email: userEmail,
      memeData: memeData,
    };

    const requestUrl = `${API_URL}/uploadMeme`;
    console.log('Request URL:', requestUrl);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('HTTP Response Status:', response.status);
    const data = await response.json();
    console.log('Upload response data:', data);

    if (response.ok) {
      console.log('Meme uploaded successfully:', data.url);
      return { url: data.url };
    } else {
      console.error('Failed to upload meme:', data.message);
      throw new Error(`Failed to upload meme: ${data.message}`);
    }
  } catch (error) {
    console.error('Error uploading meme:', error);
    throw error;
  }
};


const fileToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await RNFetchBlob.fs.readFile(uri, 'base64');
    return base64;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return null;
  }
};
