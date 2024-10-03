import {API_URL} from './config';

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

  export const fetchBatchStatus = async (memeIDs: string[], userEmail: string, followeeIDs: string[]): Promise<{followStatuses: {[key: string]: boolean}}> => {
    try {
      // Log the input parameters to check what is being sent
      console.log('Fetching batch status with parameters:', { memeIDs, userEmail, followeeIDs });
  
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/batchCheckStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memeIDs,
          userEmail,
          followeeIDs,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch batch status');
      }
  
      const data = await response.json();
  
      // Log the data received from the API to verify the response
      console.log('Batch status fetched successfully:', data);
  
      return data;
    } catch (error) {
      console.error('Error fetching batch status:', error);
      return { followStatuses: {} }; // Return an empty object if there's an error
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
    message: string
  ): Promise<{ notificationID: string }> => {
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
        headers: { 'Content-Type': 'application/json' },
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

  
  