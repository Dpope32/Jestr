import { API_URL } from './config';
import RNFetchBlob from 'rn-fetch-blob';
import {  User } from '../../screens/Feed/Feed';
import { CommentType } from '../Modals/CommentFeed';
import { Meme } from '../../screens/Feed/Feed';


export const fetchMemes = async (lastEvaluatedKey?: string, limit: number = 5): Promise<FetchMemesResult> => {
  console.log('fetching more memes');
  try {
    const requestUrl = `${API_URL}/getMemes`;
    const body = {
      operation: 'getMemes',
      limit: limit,
      lastEvaluatedKey: lastEvaluatedKey
    };

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
    const responseText = await response.text();

    if (!response.ok) {
      console.error('Failed to fetch memes. Status:', response.status);
      return { memes: [], lastEvaluatedKey: null };
    }

    const data = JSON.parse(responseText);
    if (!data || !data.data || !data.data.memes) {
      return { memes: [], lastEvaluatedKey: null };
    }

const memes = data.data.memes.map((meme: any) => ({
  memeID: meme.memeID,
  email: meme.email,
  url: meme.url,
  uploadTimestamp: meme.uploadTimestamp,
  username: meme.username || 'defaultUsername',
  caption: meme.caption || '',
  likeCount: meme.likeCount || 0,
  downloadCount: meme.downloadCount || 0,
  commentCount: meme.commentCount || 0,
  shareCount: meme.shareCount || 0,
  profilePicUrl: meme.profilePicUrl || '',
  memeUser: { // Assuming this data is now part of the meme object from the API
    email: meme.memeUser.email,
    username: meme.memeUser.username,
    profilePic: meme.memeUser.profilePic,
    displayName: meme.memeUser.displayName,
    headerPic: meme.memeUser.headerPic,
    creationDate: meme.memeUser.creationDate
}
}));
return {
  memes: memes,
  lastEvaluatedKey: data.data.lastEvaluatedKey || null
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




export const uploadMeme = async (imageUri: string, userEmail: string, username: string, caption: string = '', tags: string[] = []): Promise<{ url: string }> => {
  console.log('Uploading meme...');
  console.log('Image URI:', imageUri);
  console.log('User Email:', userEmail);
  console.log('Username:', username);
  console.log('Caption:', caption);
  console.log('Tags:', tags.join(', '));

  const memeData = await fileToBase64(imageUri);

  const requestBody = {
    operation: "uploadMeme",
    email: userEmail,
    memeData: memeData,
    username: username,
    caption: caption,
    tags: tags,  // Adding tags to the request body
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
    // Correctly reference the 'data' array in the response body
    return data.data.map((comment: any) => ({
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
