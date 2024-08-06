import { S3Client } from "@aws-sdk/client-s3";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { API_URL, AWS_REGION, COGNITO_IDENTITY_POOL_ID } from './config';
import {  User } from '../../types/types';
import { CommentType } from '../Modals/CommentFeed';
import { Meme, FetchMemesResult } from '../../types/types'
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import * as FileSystem from 'expo-file-system';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: AWS_REGION }),
    identityPoolId: COGNITO_IDENTITY_POOL_ID
  }),
});

export const fetchMemes = async (
  lastEvaluatedKey: string | null = null,
  userEmail: string,
  limit: number = 5,
  accessToken: string
): Promise<FetchMemesResult> => {
  try {
  //  console.log('fetchMemes called with:', { lastEvaluatedKey, userEmail, limit, accessToken: accessToken.substring(0, 10) + '...' });
    
    const response = await fetch(`${API_URL}/fetchMemes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ operation: 'fetchMemes', lastEvaluatedKey, userEmail, limit })
    });
    
  //  console.log('fetchMemes response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    
    const data = await response.json();
   // console.log('fetchMemes response data:', JSON.stringify(data, null, 2));
    
    if (!data.data || !Array.isArray(data.data.memes)) {
      throw new Error('Invalid response format');
    }
    
    return {
      memes: data.data.memes,
      lastEvaluatedKey: data.data.lastEvaluatedKey
    };
  } catch (error) {
    console.error('Error in fetchMemes:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { memes: [], lastEvaluatedKey: null };
  }
};
export const uploadMeme = async (
  mediaUri: string,
  userEmail: string,
  username: string,
  caption: string = '',
  tags: string[] = [],
  mediaType: 'image' | 'video'
) => {
  try {
    const fileName = `${userEmail}-meme-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

    console.log('Requesting presigned URL for:', fileName);

    const presignedUrlResponse = await fetch(`${API_URL}/getPresignedUrl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getPresignedUrl',
        fileName,
        fileType: contentType
      }),
    });
    
    if (!presignedUrlResponse.ok) {
      const errorText = await presignedUrlResponse.text();
      console.error('Presigned URL error response:', errorText);
      throw new Error(`Failed to get presigned URL: ${presignedUrlResponse.status} ${presignedUrlResponse.statusText}`);
    }
    
    const presignedData = await presignedUrlResponse.json();
    console.log('Presigned URL data:', presignedData);

    const { uploadURL, fileKey } = presignedData.data;

    if (!uploadURL) {
      throw new Error('Received null or undefined uploadURL');
    }

    console.log('Uploading file to:', uploadURL);

    const uploadResult = await FileSystem.uploadAsync(uploadURL, mediaUri, {
      httpMethod: 'PUT',
      headers: { 'Content-Type': contentType },
    });

    console.log('Upload result:', uploadResult);

    if (uploadResult.status !== 200) {
      throw new Error(`Failed to upload file to S3: ${uploadResult.status}`);
    }

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
      const errorText = await metadataResponse.text();
      console.error('Metadata response:', errorText);
      throw new Error(`Failed to process metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
    }

    const data = await metadataResponse.json();
    return { url: data.data.url };
  } catch (error) {
    console.error('Error uploading meme:', error);
    throw error;
  }
};


export const getLikeStatus = async (memeID: string, userEmail: string) => {
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getLikeStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getLikeStatus',
        memeID,
        userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get like status');
    }

    const data = await response.json();
    return {
      liked: data.liked,
      doubleLiked: data.doubleLiked,
    };
  } catch (error) {
    console.error('Error getting like status:', error);
    return { liked: false, doubleLiked: false };
  }
};

export const fetchDownloadedMemes = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/memes/downloaded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operation: 'fetchDownloadedMemes', email })
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

export const fetchComments = async (memeID: string): Promise<CommentType[]> => {
  try {
//    console.log(`Fetching comments for memeID: ${memeID}`);
    const response = await fetch(`${API_URL}/getComments`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ operation: 'getComments', memeID })
    });

    const data = await response.json();
 //   console.log(`Raw response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`Failed to fetch comments for memeID ${memeID}:`, data.message);
      return [];
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.error(`Unexpected data format for memeID ${memeID}:`, data);
      return [];
    }

    const flatComments = data.data.map((comment: any) => ({
      commentID: comment.CommentID || '',
      text: comment.Text || '',
      username: comment.Username || 'Unknown user',
      profilePicUrl: comment.ProfilePicUrl,
      likesCount: parseInt(comment.LikesCount) || 0,
      dislikesCount: parseInt(comment.DislikesCount) || 0,
      timestamp: comment.Timestamp || '',
      parentCommentID: comment.ParentCommentID || null,
      replies: [],
    }));

  //  console.log(`Flat comments:`, JSON.stringify(flatComments, null, 2));

    const organizedComments = organizeCommentsIntoThreads(flatComments);
    
 //   console.log(`Organized comments:`, JSON.stringify(organizedComments, null, 2));

    return organizedComments;
  } catch (error) {
    console.error(`Error fetching comments for memeID ${memeID}:`, error);
    return [];
  }
};

const organizeCommentsIntoThreads = (flatComments: CommentType[]): CommentType[] => {
  const commentMap = new Map<string, CommentType>();
  const topLevelComments: CommentType[] = [];

  // First pass: create all comment objects
  flatComments.forEach(comment => {
    commentMap.set(comment.commentID, {...comment, replies: []});
  });

  // Second pass: organize into threads
  flatComments.forEach(comment => {
    if (comment.parentCommentID) {
      const parentComment = commentMap.get(comment.parentCommentID);
      if (parentComment) {
        parentComment.replies.push(commentMap.get(comment.commentID)!);
      }
    } else {
      topLevelComments.push(commentMap.get(comment.commentID)!);
    }
  });

  return topLevelComments;
};

export const postComment = async (memeID: string, text: string, user: User, parentCommentID?: string): Promise<void> => {
  const commentData = {
    operation: "postComment",
    memeID,
    text,
    email: user.email,
    username: user.username,
    profilePic: user.profilePic,
    ParentCommentID: parentCommentID,
  };

  console.log(`Posting comment for memeID: ${memeID} by user: ${user.username}`);
  const response = await fetch(`${API_URL}/postComment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Failed to post comment:', data.message);
    throw new Error(data.message);
  }

  console.log('Comment posted successfully:', data);
};

export const updateCommentReaction = async (
  commentID: string,
  memeID: string,
  incrementLikes: boolean,
  incrementDislikes: boolean
): Promise<void> => {
  const requestBody = {
    operation: 'updateCommentReaction',
    commentID,
    memeID,
    incrementLikes,
    incrementDislikes,
  };

  console.log('Updating comment reaction for commentID:', commentID);

  const response = await fetch(`${API_URL}/updateCommentReaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Failed to update comment reaction:', data.message);
    throw new Error(data.message);
  }

  console.log('Comment reaction updated successfully:', data);
};

export const updateMemeReaction = async (memeID: string, incrementLikes: boolean, doubleLike: boolean, incrementDownloads: boolean, email: string): Promise<void> => {
  const requestBody = {
    operation: 'updateMemeReaction',
    memeID,
    doubleLike,
    incrementLikes,
    incrementDownloads,
    email,
  };

  console.log('Updating meme reaction with requestBody:', requestBody);

  const response = await fetch(`${API_URL}/updateMemeReaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Failed to update meme reaction:', data.message);
    throw new Error(data.message);
  }

  console.log('Meme reaction updated successfully:', data);
};
