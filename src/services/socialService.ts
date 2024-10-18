import axios from 'axios';
import {CommentType} from '../types/types';
import {API_URL} from './config';

export const fetchComments = async (memeID: string): Promise<CommentType[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/getComments`,
      JSON.stringify({
        operation: 'getComments',
        memeID,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data = response.data;
    console.log(`Raw response data:`, JSON.stringify(data, null, 2));

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

    const organizedComments = organizeCommentsIntoThreads(flatComments);
    return organizedComments;
  } catch (error) {
    console.error(`Error fetching comments for memeID ${memeID}:`, error);
    return [];
  }
};

const organizeCommentsIntoThreads = (
  flatComments: CommentType[],
): CommentType[] => {
  const commentMap = new Map<string, CommentType>();
  const topLevelComments: CommentType[] = [];

  flatComments.forEach(comment => {
    commentMap.set(comment.commentID, {...comment, replies: []});
  });

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

export const addFollow = async (followerId: string, followeeId: string) => {
  const followData = {
    operation: 'addFollow',
    followerId,
    followeeId,
  };

  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/addFollow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followData),
      },
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        followersCount: result.followersCount,
        followingCount: result.followingCount,
      };
    } else {
      console.error('Failed to add follow:', result.message || 'Unknown error');
      return { success: false, message: result.message || 'Failed to add follow' };
    }
  } catch (error) {
    console.error('Error adding follow:', error);
    return { success: false, message: (error as Error).message };
  }
};


export const removeFollow = async (
  unfollowerId: string,
  unfolloweeId: string,
): Promise<void> => {
  // Implementation
};

export const checkFollowStatus = async (
  followerId: string,
  followeeId: string,
): Promise<{isFollowing: boolean; canFollow: boolean}> => {
  //  console.log(`Checking follow status for follower ${followerId} and followee ${followeeId}`);
  if (!followerId || !followeeId) {
    console.error('Missing required parameters: followerId or followeeId');
    return {isFollowing: false, canFollow: false};
  }
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkFollowStatus',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'checkFollowStatus',
          followerId,
          followeeId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //   console.log('Follow status response:', data);
    return data.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowing',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getFollowing',
          userId: userId, // Changed from userEmail to userId
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
};

export const getFollowers = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getFollowers',
          userId: userId, // Changed from userEmail to userId
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
};

export const fetchBatchStatus = async (
  memeIDs: string[],
  userEmail: string,
  followeeIDs: string[],
): Promise<{followStatuses: {[key: string]: boolean}}> => {
  try {
    // Log the input parameters to check what is being sent
    console.log('Fetching batch status with parameters:', {
      memeIDs,
      userEmail,
      followeeIDs,
    });

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/batchCheckStatus',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memeIDs,
          userEmail,
          followeeIDs,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch batch status');
    }

    const data = await response.json();

    // Log the data received from the API to verify the response
    console.log('Batch status fetched successfully:', data);

    return data;
  } catch (error) {
    console.error('Error fetching batch status:', error);
    return {followStatuses: {}}; // Return an empty object if there's an error
  }
};

