import { API_URL } from './config'; // Define your backend API URL

export const fetchMemes = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/getMemes`);
      const data = await response.json();
      return data.memes || [];
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
      console.log('Meme data (base64):', memeData);
  
      const response = await fetch(`${API_URL}/uploadMeme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          memeData: memeData,
        }),
      });
  
      console.log('Upload response:', response);
  
      const data = await response.json();
      console.log('Upload response data:', data);
  
      if (response.ok) {
        console.log('Meme uploaded successfully');
        return { url: data.url };
      } else {
        console.error('Failed to upload meme');
        throw new Error('Failed to upload meme');
      }
    } catch (error) {
      console.error('Error uploading meme:', error);
      throw error;
    }
  };
  
  // Add this utility function to convert the image file to base64
  const fileToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };