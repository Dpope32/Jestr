
import {API_URL} from './config';


export const sendMessage = async (
    senderID: string,
    receiverID: string,
    content: string | { type: string; message: string } | { type: string; memeID: string; message: string }
  ) => {
    try {
      console.log('Sending message from:', senderID, 'to:', receiverID, 'with content', content);
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
            content: typeof content === 'string' ? content : JSON.stringify(content),
          }),
        },
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Server responded with an error:', data);
        throw new Error(data.message || 'Failed to send message');
      }
  
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
  