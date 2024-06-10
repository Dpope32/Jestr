import { API_URL } from './config';
import RNFetchBlob from 'rn-fetch-blob';
import {  User } from '../../screens/Feed/Feed';
import { CommentType } from '../Modals/CommentFeed';
import { Meme } from '../../screens/Feed/Feed';



export const fetchMemes = async (lastEvaluatedKey?: string, limit: number = 10): Promise<FetchMemesResult> => {
  try {
    const requestUrl = `${API_URL}/getMemes`;
    const body = JSON.stringify({
      operation: 'getMemes',
      lastEvaluatedKey: lastEvaluatedKey,
      limit: limit
    });

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });

    console.log('HTTP Response Status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      console.log('Failed to fetch memes. Status:', response.status);
      return { memes: [], lastEvaluatedKey: null };
    }
    
    const data = JSON.parse(responseText);
    if (!data || !data.user || !data.user.memes) {
      return { memes: [], lastEvaluatedKey: null };
    }
    
    const memes = data.user.memes.map((meme: any) => ({
      memeID: meme.memeID,
      email: meme.email,
      url: meme.url,
      uploadTimestamp: meme.uploadTimestamp,
      username: meme.username || 'defaultUsername',
      caption: meme.caption || '',
      likeCount: meme.likeCount || 0,
      downloadCount: meme.downloadCount || 0,
      commentCount: meme.commentCount || 0,
      profilePicUrl: meme.profilePicUrl || ''
    }));
    
    return {
      memes: memes,
      lastEvaluatedKey: data.user.lastEvaluatedKey || null
    };
    
  } catch (error) {
    console.error('Error fetching memes:', error);
    return { memes: [], lastEvaluatedKey: null };
  }
};

// Type definition for the result of fetchMemes
type FetchMemesResult = {
  memes: Meme[];
  lastEvaluatedKey: string | null;
};




export const uploadMeme = async (imageUri: string, userEmail: string, username: string, caption: string): Promise<{ url: string }> => {
  try {
    console.log('Uploading meme...');
    console.log('Image URI:', imageUri);
    console.log('User Email:', userEmail);

    const memeData = await fileToBase64(imageUri);

    const requestBody = {
      operation: "uploadMeme",  // Make sure to include the operation if your Lambda expects it
      email: userEmail,
      memeData: memeData,
      username: username,
      caption: caption,
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


export const fetchComments = async (memeID: string): Promise<CommentType[]> => {
  try {
    console.log(`Fetching comments for memeID: ${memeID}`);
    const response = await fetch(`${API_URL}/getComments`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ operation: 'getComments', memeID })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`Failed to fetch comments for memeID ${memeID}:`, data.message);
      return [];
    }

    console.log(`Fetched comments for memeID ${memeID}:`, data);
    return data.user.map((comment: any) => ({
      commentID: comment.CommentID || '',
      text: comment.Text || '',
      username: comment.Username || 'Unknown user',
      profilePicUrl: comment.ProfilePicUrl,
      likesCount: parseInt(comment.LikesCount) || 0,
      dislikesCount: parseInt(comment.DislikesCount) || 0,
      timestamp: comment.Timestamp || '',
      repliesCount: comment.RepliesCount || 0,
    })) || [];
  } catch (error) {
    console.error(`Error fetching comments for memeID ${memeID}:`, error);
    return [];
  }
};


export const postComment = async (memeID: string, text: string, user: User): Promise<void> => {
  const commentData = {
    operation: "postComment",
    memeID,
    text,
    email: user.email, // Ensure email is included
    username: user.username,
    profilePic: user.profilePic,
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

export const updateMemeReaction = async (memeID: string, incrementLikes: boolean, incrementDownloads: boolean, email: string): Promise<void> => {
  const requestBody = {
    operation: 'updateMemeReaction',
    memeID,
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
