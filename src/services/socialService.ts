import axios from 'axios';
// import {CommentType} from '../components/Modals/CommentFeed';
import {User, CommentType} from '../types/types';
import {API_URL} from './config';

// export const addFollow = async (followerId: string, followeeId: string) => {
//   const followData = {
//     operation: 'addFollow',
//     followerId,
//     followeeId,
//   };

//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/addFollow',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(followData),
//       },
//     );

//     if (response.ok) {
//       const result = await response.json();
//       return {
//         success: true,
//         followersCount: result.followersCount,
//         followingCount: result.followingCount,
//       };
//     } else {
//       console.error('Failed to add follow');
//       return {success: false};
//     }
//   } catch (error) {
//     console.error('Error adding follow:', error);
//     return {success: false};
//   }
// };

// export const addFollow = async (followerId: string, followeeId: string) => {
//   const followData = {
//     operation: 'addFollow',
//     followerId,
//     followeeId,
//   };

//   try {
//     const response = await axios.post(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/addFollow',
//       followData,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );

//     if (response.status === 200) {
//       const result = response.data;
//       return {
//         success: true,
//         followersCount: result.followersCount,
//         followingCount: result.followingCount,
//       };
//     } else {
//       console.error('Failed to add follow');
//       return {success: false};
//     }
//   } catch (error) {
//     console.error('Error adding follow:', error);
//     return {success: false};
//   }
// };

// export const removeFollow = async (
//   unfollowerId: string,
//   unfolloweeId: string,
// ): Promise<void> => {
//   // Implementation
// };

// export const checkFollowStatus = async (
//   followerId: string,
//   followeeId: string,
// ): Promise<{isFollowing: boolean; canFollow: boolean}> => {
//   //  console.log(`Checking follow status for follower ${followerId} and followee ${followeeId}`);
//   if (!followerId || !followeeId) {
//     console.error('Missing required parameters: followerId or followeeId');
//     return {isFollowing: false, canFollow: false};
//   }
//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkFollowStatus',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'checkFollowStatus',
//           followerId,
//           followeeId,
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     //   console.log('Follow status response:', data);
//     return data.data;
//   } catch (error) {
//     console.error('Error checking follow status:', error);
//     throw error;
//   }
// };

// export const getFollowing = async (userId: string): Promise<string[]> => {
//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowing',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'getFollowing',
//           userId: userId, // Changed from userEmail to userId
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching following:', error);
//     return [];
//   }
// };

// export const getFollowers = async (userId: string): Promise<string[]> => {
//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowers',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'getFollowers',
//           userId: userId, // Changed from userEmail to userId
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching followers:', error);
//     return [];
//   }
// };

// export const fetchBatchStatus = async (
//   memeIDs: string[],
//   userEmail: string,
//   followeeIDs: string[],
// ): Promise<{followStatuses: {[key: string]: boolean}}> => {
//   try {
//     // Log the input parameters to check what is being sent
//     console.log('Fetching batch status with parameters:', {
//       memeIDs,
//       userEmail,
//       followeeIDs,
//     });

//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/batchCheckStatus',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           memeIDs,
//           userEmail,
//           followeeIDs,
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch batch status');
//     }

//     const data = await response.json();

//     // Log the data received from the API to verify the response
//     console.log('Batch status fetched successfully:', data);

//     return data;
//   } catch (error) {
//     console.error('Error fetching batch status:', error);
//     return {followStatuses: {}}; // Return an empty object if there's an error
//   }
// };

// export const sendMessage = async (
//   senderID: string,
//   receiverID: string,
//   content: string,
// ) => {
//   try {
//     //  console.log('Sending message from:', senderID, 'to:', receiverID);
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/sendMessage',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'sendMessage',
//           senderID,
//           receiverID,
//           content,
//         }),
//       },
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('Server responded with an error:', data);
//       throw new Error(data.message || 'Failed to send message');
//     }

//     //    console.log('Message sent successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Error sending message:', error);
//     throw error;
//   }
// };

// export const fetchConversations = async (userEmail: string) => {
//   console.log('Fetching conversations for:', userEmail);
//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getConversations',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'getConversations',
//           userID: userEmail,
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP status ${response.status}`);
//     }

//     const responseData = await response.json();
//     console.log('Full API Response:', responseData);
//     if (responseData.data && Array.isArray(responseData.data.conversations)) {
//       return responseData.data.conversations;
//     } else {
//       console.error('Unexpected response structure:', responseData);
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching conversations:', error);
//     return [];
//   }
// };

// export const fetchMessages = async (userID: string, conversationID: string) => {
//   try {
//     const response = await fetch(
//       'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getMessages',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           operation: 'getMessages',
//           userID,
//           conversationID,
//         }),
//       },
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const responseData = await response.json();
//     //console.log('Fetched messages:', responseData);

//     if (responseData && Array.isArray(responseData.data)) {
//       return responseData.data;
//     } else {
//       console.error('Unexpected response structure:', responseData);
//       return [];
//     }
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     return [];
//   }
// };

// export const postComment = async (
//   memeID: string,
//   text: string,
//   user: User,
//   parentCommentID?: string,
// ): Promise<void> => {
//   const commentData = {
//     operation: 'postComment',
//     memeID,
//     text,
//     email: user.email,
//     username: user.username,
//     profilePic: user.profilePic,
//     ParentCommentID: parentCommentID,
//   };

//   // console.log(`Posting comment for memeID: ${memeID} by user: ${user.username}`);
//   const response = await fetch(`${API_URL}/postComment`, {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify(commentData),
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     console.error('Failed to post comment:', data.message);
//     throw new Error(data.message);
//   }

//   //console.log('Comment posted successfully:', data);
// };

// export const postComment = async (
//   memeID: string,
//   text: string,
//   user: User,
//   parentCommentID?: string,
// ): Promise<void> => {
//   const commentData = {
//     operation: 'postComment',
//     memeID,
//     text,
//     email: user.email,
//     username: user.username,
//     profilePic: user.profilePic,
//     ParentCommentID: parentCommentID,
//   };

//   try {
//     const response = await axios.post(
//       `${API_URL}/postComment`,
//       JSON.stringify(commentData),
//       {
//         headers: {'Content-Type': 'application/json'},
//       },
//     );

//     const data = response.data;
//     if (!response.status.toString().startsWith('2')) {
//       console.error('Failed to post comment:', data.message);
//       throw new Error(data.message);
//     }
//   } catch (error) {
//     console.error('Error posting comment:', error);
//     throw error;
//   }
// };

// export const updateCommentReaction = async (
//   commentID: string,
//   memeID: string,
//   incrementLikes: boolean,
//   incrementDislikes: boolean,
// ): Promise<void> => {
//   const requestBody = {
//     operation: 'updateCommentReaction',
//     commentID,
//     memeID,
//     incrementLikes,
//     incrementDislikes,
//   };

//   // console.log('Updating comment reaction for commentID:', commentID);

//   const response = await fetch(`${API_URL}/updateCommentReaction`, {
//     method: 'POST',
//     headers: {'Content-Type': 'application/json'},
//     body: JSON.stringify(requestBody),
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     console.error('Failed to update comment reaction:', data.message);
//     throw new Error(data.message);
//   }

//   // console.log('Comment reaction updated successfully:', data);
// };

// export const fetchComments = async (
//   memeID: string,
//   token: string | null,
// ): Promise<CommentType[]> => {
//   try {
//     //    console.log(`Fetching comments for memeID: ${memeID}`);
//     const response = await fetch(`${API_URL}/getComments`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({operation: 'getComments', memeID}),
//     });

//     const data = await response.json();
//     //   console.log(`Raw response data:`, JSON.stringify(data, null, 2));

//     if (!response.ok) {
//       console.error(
//         `Failed to fetch comments for memeID ${memeID}:`,
//         data.message,
//       );
//       console.log('Response:', data);
//       return [];
//     }

//     if (!data.data || !Array.isArray(data.data)) {
//       console.error(`Unexpected data format for memeID ${memeID}:`, data);
//       return [];
//     }

//     const flatComments = data.data.map((comment: any) => ({
//       commentID: comment.CommentID || '',
//       text: comment.Text || '',
//       username: comment.Username || 'Unknown user',
//       profilePicUrl: comment.ProfilePicUrl,
//       likesCount: parseInt(comment.LikesCount) || 0,
//       dislikesCount: parseInt(comment.DislikesCount) || 0,
//       timestamp: comment.Timestamp || '',
//       parentCommentID: comment.ParentCommentID || null,
//       replies: [],
//     }));

//     //  console.log(`Flat comments:`, JSON.stringify(flatComments, null, 2));

//     const organizedComments = organizeCommentsIntoThreads(flatComments);

//     //   console.log(`Organized comments:`, JSON.stringify(organizedComments, null, 2));

//     return organizedComments;
//   } catch (error) {
//     console.error(`Error fetching comments for memeID ${memeID}:`, error);
//     return [];
//   }
// };

// export const updateCommentReaction = async (
//   commentID: string,
//   memeID: string,
//   incrementLikes: boolean,
//   incrementDislikes: boolean,
// ): Promise<void> => {
//   const requestBody = {
//     operation: 'updateCommentReaction',
//     commentID,
//     memeID,
//     incrementLikes,
//     incrementDislikes,
//   };

//   try {
//     const response = await axios.post(
//       `${API_URL}/updateCommentReaction`,
//       JSON.stringify(requestBody),
//       {
//         headers: {'Content-Type': 'application/json'},
//       },
//     );

//     const data = response.data;
//     if (!response.status.toString().startsWith('2')) {
//       console.error('Failed to update comment reaction:', data.message);
//       throw new Error(data.message);
//     }
//   } catch (error) {
//     console.error('Error updating comment reaction:', error);
//     throw error;
//   }
// };

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

// const organizeCommentsIntoThreads = (
//   flatComments: CommentType[],
// ): CommentType[] => {
//   const commentMap = new Map<string, CommentType>();
//   const topLevelComments: CommentType[] = [];

//   // First pass: create all comment objects
//   flatComments.forEach(comment => {
//     commentMap.set(comment.commentID, {...comment, replies: []});
//   });

//   // Second pass: organize into threads
//   flatComments.forEach(comment => {
//     if (comment.parentCommentID) {
//       const parentComment = commentMap.get(comment.parentCommentID);
//       if (parentComment) {
//         parentComment.replies.push(commentMap.get(comment.commentID)!);
//       }
//     } else {
//       topLevelComments.push(commentMap.get(comment.commentID)!);
//     }
//   });

//   return topLevelComments;
// };

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

// export const sendNotification = async (
//   memeID: string,
//   catchUser: string,
//   fromUser: string,
//   type: string,
//   message: string,
// ): Promise<{notificationID: string}> => {
//   const requestBody = {
//     operation: 'sendNotification',
//     memeID,
//     catchUser,
//     fromUser,
//     type,
//     message,
//   };

//   try {
//     const response = await fetch(`${API_URL}/sendNotification`, {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Failed to send notification: ${errorData.message}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     throw error;
//   }
// };

//
//
//
//

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

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        followersCount: result.followersCount,
        followingCount: result.followingCount,
      };
    } else {
      console.error('Failed to add follow');
      return {success: false};
    }
  } catch (error) {
    console.error('Error adding follow:', error);
    return {success: false};
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

export const sendMessage = async (
  senderID: string,
  receiverID: string,
  content: string,
) => {
  try {
    //  console.log('Sending message from:', senderID, 'to:', receiverID);
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/sendMessage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'sendMessage',
          senderID,
          receiverID,
          content,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Server responded with an error:', data);
      throw new Error(data.message || 'Failed to send message');
    }

    //    console.log('Message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchConversations = async (userEmail: string) => {
  console.log('Fetching conversations for:', userEmail);
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getConversations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getConversations',
          userID: userEmail,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Full API Response:', responseData);
    if (responseData.data && Array.isArray(responseData.data.conversations)) {
      return responseData.data.conversations;
    } else {
      console.error('Unexpected response structure:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const fetchMessages = async (userID: string, conversationID: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getMessages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getMessages',
          userID,
          conversationID,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    //console.log('Fetched messages:', responseData);

    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else {
      console.error('Unexpected response structure:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendNotification = async (
  memeID: string,
  catchUser: string,
  fromUser: string,
  type: string,
  message: string,
): Promise<{notificationID: string}> => {
  const requestBody = {
    operation: 'sendNotification',
    memeID,
    catchUser,
    fromUser,
    type,
    message,
  };

  try {
    const response = await fetch(`${API_URL}/sendNotification`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send notification: ${errorData.message}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
