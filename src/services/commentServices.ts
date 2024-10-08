
import { User, CommentType } from '../types/types';
import { API_URL } from './config';
import { Badge } from '../screens/AppNav/Badges/Badges.types';

// Define specific API endpoints
const POST_COMMENT_ENDPOINT = `${API_URL}/postComment`;
const UPDATE_COMMENT_REACTION_ENDPOINT = `${API_URL}/updateCommentReaction`;
const GET_COMMENTS_ENDPOINT = `${API_URL}/getComments`;
const DELETE_COMMENT_ENDPOINT = `${API_URL}/deleteComment`;
const REPLY_TO_COMMENT_ENDPOINT = `${API_URL}/replyToComment`;

// Utility function for logging
const logRequest = (operation: string, data: any) => {
  console.log(`[Request] Operation: ${operation}`, data);
};

const logResponse = (operation: string, response: Response, data: any) => {
  console.log(`[Response] Operation: ${operation}`, {
    status: response.status,
    statusText: response.statusText,
    data,
  });
};

export const postComment = async (
  memeID: string,
  text: string,
  user: User,
  parentCommentID?: string,
): Promise<{ comment: CommentType; badgeEarned: Badge | null }> => {
  const commentData = {
    operation: 'postComment',
    memeID,
    text,
    email: user.email,
    username: user.username,
    profilePic: user.profilePic,
    parentCommentID,
  };

  try {
    // Log the request data
    logRequest('postComment', commentData);

    const response = await fetch(POST_COMMENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });

    const data = await response.json();

    // Log the response data
    logResponse('postComment', response, data);

    if (!response.ok) {
      console.error('Failed to post comment:', data.message);
      throw new Error(data.message);
    }
    return { 
      comment: data.data.comment, 
      badgeEarned: data.data.badgeEarned 
    }
  } catch (error) {
    console.error('Error in postComment:', error);
    throw error;
  }
};

export const updateCommentReaction = async (
  commentID: string,
  memeID: string,
  incrementLikes: boolean,
  incrementDislikes: boolean,
  userEmail: string
): Promise<void> => {
  const requestBody = {
    operation: 'updateCommentReaction',
    commentID,
    memeID,
    incrementLikes,
    incrementDislikes,
    userEmail,
  };

  try {
    // Log the request data
    logRequest('updateCommentReaction', requestBody);

    const response = await fetch(UPDATE_COMMENT_REACTION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Log the response data
    logResponse('updateCommentReaction', response, data);

    if (!response.ok) {
      console.error('Failed to update comment reaction:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error in updateCommentReaction:', error);
    throw error;
  }
};

export const fetchComments = async (memeID: string): Promise<CommentType[]> => {
  const requestBody = {
    operation: 'getComments',
    memeID,
  };

  try {
    // Log the request data
    logRequest('fetchComments', requestBody);

    const response = await fetch(GET_COMMENTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Clone the response for logging without affecting the original response
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();

    // Log the response data
    logResponse('fetchComments', response, data);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!data.data || !Array.isArray(data.data.comments)) {
      console.error(`Unexpected data format for memeID ${memeID}:`, data);
      return [];
    }

    const organizedComments = data.data.comments.map((comment: any) => ({
      commentID: comment.CommentID || '',
      text: comment.Text || '',
      username: comment.Username || 'Unknown user',
      profilePicUrl: comment.ProfilePicUrl,
      likesCount: parseInt(comment.LikesCount) || 0,
      dislikesCount: parseInt(comment.DislikesCount) || 0,
      timestamp: comment.Timestamp || '',
      parentCommentID: comment.ParentCommentID || null,
      email: comment.Email || '',
      replies: [],
    }));

    // Optionally log the organized comments
 //   console.log('Organized Comments:', organizedComments);

    return organizedComments;
  } catch (error) {
    console.error(`Error fetching comments for memeID ${memeID}:`, error);
    throw error;
  }
};

export const organizeCommentsIntoThreads = (
    flatComments: CommentType[],
  ): CommentType[] => {
  //  console.log('Organizing comments into threads...', { flatComments });
  
    const commentMap = new Map<string, CommentType>();
    const topLevelComments: CommentType[] = [];
  
    // First pass: create all comment objects
    flatComments.forEach(comment => {
      commentMap.set(comment.commentID, { ...comment, replies: [] });
    });
  
    // Second pass: organize into threads
    flatComments.forEach(comment => {
      if (comment.parentCommentID) {
        const parentComment = commentMap.get(comment.parentCommentID);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.commentID)!);
        } else {
          console.warn(`Parent comment with ID ${comment.parentCommentID} not found for comment ID ${comment.commentID}`);
          topLevelComments.push(commentMap.get(comment.commentID)!); // Treat as top-level if parent not found
        }
      } else {
        topLevelComments.push(commentMap.get(comment.commentID)!);
      }
    });
  
 //   console.log('Organized Comment Threads:', topLevelComments);
    return topLevelComments;
  };
  
  

// New function to delete a comment
export const deleteComment = async (commentID: string, memeID: string, email: string): Promise<void> => {
  const requestBody = {
    operation: 'deleteComment',
    commentID,
    memeID,
    email,
  };

  try {
    // Log the request data
    logRequest('deleteComment', requestBody);

    const response = await fetch(DELETE_COMMENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Log the response data
  //  logResponse('deleteComment', response, data);

    if (!response.ok) {
      console.error('Failed to delete comment:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw error;
  }
};

// New function to reply to a comment
export const replyToComment = async (
  memeID: string,
  parentCommentID: string,
  text: string,
  user: User,
): Promise<void> => {
  const requestBody = {
    operation: 'replyToComment',
    memeID,
    parentCommentID,
    text,
    email: user.email,
    username: user.username,
    profilePic: user.profilePic,
  };

  try {
    // Log the request data
  //  logRequest('replyToComment', requestBody);

    const response = await fetch(REPLY_TO_COMMENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Log the response data
    //logResponse('replyToComment', response, data);

    if (!response.ok) {
      console.error('Failed to reply to comment:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error in replyToComment:', error);
    throw error;
  }
};
