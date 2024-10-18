// memeService.tsx

import * as FileSystem from 'expo-file-system';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {API_URL} from './config';
import {FetchMemesResult} from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useInfiniteQuery} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const LAST_VIEWED_MEME_KEY = 'lastViewedMemeId';
const UPLOAD_TIMEOUT = 30000; 


/**
 * Uploads a meme by obtaining a presigned URL, uploading the file to S3,
 * and then processing the metadata with the backend.
 *
 * @param mediaUri - The URI of the media file to upload.
 * @param userEmail - The email of the user uploading the meme.
 * @param username - The username of the user uploading the meme.
 * @param caption - Optional caption for the meme.
 * @param tags - Optional tags for the meme.
 * @param mediaType - The type of media ('image' or 'video').
 * @returns An object containing the URL of the uploaded meme.
 */
export const uploadMeme = async (
  mediaUri: string,
  userEmail: string,
  username: string,
  caption: string = '',
  tags: string[] = [],
  mediaType: 'image' | 'video',
  onProgress: (progress: number) => void
) => {
  console.log('uploadMeme: Function called');
  
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = mediaType === 'video' ? 'mp4' : 'jpg';
    const fileName = `${userEmail}-meme-${timestamp}.${fileExtension}`;
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

    // Request a presigned URL from the backend
    const presignedUrlResponse = await fetch(`${API_URL}/getPresignedUrl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getPresignedUrl',
        fileName,
        fileType: contentType,
      }),
    });

    if (!presignedUrlResponse.ok) {
      throw new Error(`Failed to get presigned URL: ${presignedUrlResponse.status}`);
    }

    const presignedData = await presignedUrlResponse.json();
    const { uploadURL, fileKey } = presignedData.data;

    // Upload the file to S3 using the presigned URL
    const uploadResult = await FileSystem.uploadAsync(uploadURL, mediaUri, {
      httpMethod: 'PUT',
      headers: { 'Content-Type': contentType },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (uploadResult.status !== 200) {
      throw new Error(`Failed to upload file to S3: ${uploadResult.status}`);
    }

    // Notify the backend to start processing the uploaded meme metadata
    const metadataResponse = await fetch(`${API_URL}/uploadMeme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'uploadMeme',
        email: userEmail,
        username,
        caption,
        tags,
        mediaType,
        memeKey: fileKey,
      }),
    });

    if (!metadataResponse.ok) {
      throw new Error(`Failed to initiate metadata processing: ${metadataResponse.status}`);
    }

    const metadataData = await metadataResponse.json();
    const memeUrl = metadataData.data?.url || `${API_URL}/${fileKey}`;
    
    return { url: memeUrl, status: 'processing' };
  } catch (error: unknown) {
    console.error('uploadMeme: Error uploading meme:', error);
    throw error;
  }
};


export const fetchDownloadedMemes = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/memes/downloaded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({operation: 'fetchDownloadedMemes', email}),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch downloaded memes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching downloaded memes:', error);
    throw error;
  }
};

export const getUserMemes = async (
  email: string,
  lastEvaluatedKey: string | null = null,
): Promise<FetchMemesResult> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUserMemes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getUserMemes',
          email,
          lastEvaluatedKey,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    //console.log('getUserMemes response:', responseData);  // Add this line for debugging

    // Check if the response has the expected structure
    if (
      responseData &&
      responseData.data &&
      Array.isArray(responseData.data.memes)
    ) {
      return {
        memes: responseData.data.memes,
        lastEvaluatedKey: responseData.data.lastEvaluatedKey,
      };
    } else {
      console.error('Unexpected response structure:', responseData);
      return {memes: [], lastEvaluatedKey: null};
    }
  } catch (error) {
    console.error('Error fetching user memes:', error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

export const deleteMeme = async (memeID: string, userEmail: string) => {
  try {
    console.log(
      `Attempting to delete meme. MemeID: ${memeID}, UserEmail: ${userEmail}`,
    );
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/deleteMeme',
      {
        method: 'POST', // Changed from DELETE to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({operation: 'deleteMeme', memeID, userEmail}),
      },
    );
    const responseData = await response.json();
    console.log('Delete meme response:', responseData);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Meme not found');
      } else if (response.status === 403) {
        throw new Error('You are not authorized to delete this meme');
      } else {
        throw new Error(responseData.message || 'Failed to delete meme');
      }
    }
    return responseData;
  } catch (error) {
    console.error('Error deleting meme:', error);
    throw error;
  }
};

export const removeDownloadedMeme = async (
  userEmail: string,
  memeID: string,
) => {
  try {
    console.log(`Attempting to remove meme: ${memeID} for user: ${userEmail}`);
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/removeDownloadedMeme',
      {
        method: 'POST', // Changed from DELETE to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'removeDownloadedMeme',
          userEmail,
          memeID,
        }),
      },
    );
    const responseData = await response.json();
    console.log('Remove downloaded meme response:', responseData);
    if (!response.ok) {
      throw new Error(
        responseData.message || 'Failed to remove downloaded meme',
      );
    }
    return responseData;
  } catch (error) {
    console.error('Error removing downloaded meme:', error);
    throw error;
  }
};


export const getLikeStatus = async (memeID: string, userEmail: string) => {
  try {
    if (!memeID || !userEmail) {
      console.error('getLikeStatus called with invalid parameters:', {
        memeID,
        userEmail,
      });
      return null;
    }

    // console.log(`Fetching like status for memeID: ${memeID}, userEmail: ${userEmail}`);

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getLikeStatus',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getLikeStatus',
          memeID,
          userEmail,
        }),
      },
    );

    // console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(
        `Failed to get like status: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    //console.log(`Meme info and like status data:`, data);

    return {
      liked: data.data.liked,
      doubleLiked: data.data.doubleLiked,
      memeInfo: {
        MemeID: data.data.MemeID,
        Email: data.data.Email,
        Username: data.data.Username,
        ProfilePicUrl: data.data.ProfilePicUrl,
        mediaType: data.data.mediaType,
        MemeURL: data.data.MemeURL,
        LikeCount: data.data.LikeCount,
        ShareCount: data.data.ShareCount,
        CommentCount: data.data.CommentCount,
        DownloadCount: data.data.DownloadCount,
        UploadTimestamp: data.data.UploadTimestamp,
      },
    };
  } catch (error) {
    console.error('Error getting meme info and like status:', error);
    return null;
  }
};

export interface UpdateMemeReactionRequest {
  memeID: string;
  incrementLikes: boolean;
  email: string;
  doubleLike: boolean;
  incrementDownloads: boolean;
}

export interface UpdateMemeReactionResponse {
  success: boolean;
  message: string;
}

export const updateMemeReaction = async (
  data: UpdateMemeReactionRequest,
): Promise<UpdateMemeReactionResponse> => {
  const requestBody = {
    operation: 'updateMemeReaction',
    memeID: data.memeID,
    doubleLike: false,
    incrementLikes: data.incrementLikes,
    incrementDownloads: false,
    email: data.email,
  };
  // console.log('Updating meme reaction with requestBody:', requestBody);

  const response = await axios.post(
    `${API_URL}/updateMemeReaction`,
    requestBody,
    {
      headers: {'Content-Type': 'application/json'},
    },
  );
  console.log('Update meme reaction response:', response.data);
  return response.data;
};
