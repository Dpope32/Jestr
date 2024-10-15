// dbServices.mjs

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from "uuid";
import { snsClient } from './snsClient.mjs'; 
import { getUserProfile, getMemeShareCountForUser } from './cacheServices.mjs';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Function to record a meme share.
 * @param {string} memeID 
 * @param {string} userEmail 
 * @param {string} shareType 
 * @param {string} username 
 * @param {string} catchUser 
 * @param {string} message 
 */
export const recordShare = async (memeID, userEmail, shareType, username, catchUser, message) => {
  const shareID = uuidv4();
  const timestamp = new Date().toISOString();
  const notificationID = uuidv4();
  const notificationMessage = message ? `${username} sent you a meme: "${message}"` : `${username} sent you a meme`;

  const putParams = {
    TableName: 'Shares',
    Item: {
      MemeID: memeID,
      ShareID: shareID,
      UserEmail: userEmail,
      ShareType: shareType,
      Timestamp: timestamp,
      ShareCaption: message,
    },
  };

  const updateShareCountParams = {
    TableName: 'Memes',
    Key: { MemeID: memeID },
    UpdateExpression: 'SET ShareCount = if_not_exists(ShareCount, :start) + :inc',
    ExpressionAttributeValues: {
      ':start': 0,
      ':inc': 1,
    },
  };

  const putNotificationParams = {
    TableName: 'Notis',
    Item: {
      MemeID: memeID,
      CatchUser: catchUser,
      FromUser: username,
      NotificationID: notificationID,
      Type: shareType,
      Message: notificationMessage,
      Seen: false,
      Timestamp: timestamp,
    },
  };

  try {
    // Use TransactWriteCommand for transactions
    const transactParams = {
      TransactItems: [
        { Put: putParams },
        { Update: updateShareCountParams },
        { Put: putNotificationParams },
      ],
    };
    await docClient.send(new TransactWriteCommand(transactParams));

    const currentShareCount = await getMemeShareCountForUser(userEmail);

    const messageContent = {
      type: 'meme_share',
      memeID: memeID,
      message: message || '',
    };
    await sendMessage(userEmail, catchUser, messageContent); 

  } catch (error) {
    console.error('Error recording share, updating share count, Notis, or sending message:', error);
    throw error;
  }
};
/**
 * Function to send a message between users.
 * @param {string} senderID 
 * @param {string} receiverID 
 * @param {string} content 
 * @returns {Promise<Object>}
 */
// dbServices.mjs

export const sendMessage = async (senderID, receiverID, content) => {
  const messageID = uuidv4();
  const timestamp = new Date().toISOString();
  const conversationID = [senderID, receiverID].sort().join("#");

  console.log(`sendMessage called with: senderID=${senderID}, receiverID=${receiverID}, content=${JSON.stringify(content)}`);
  console.log(`Generated messageID=${messageID}, conversationID=${conversationID}`);

  // Standardize content as an object
  let standardizedContent;
  if (typeof content === 'string') {
    standardizedContent = { type: 'text', message: content };
  } else if (typeof content === 'object') {
    standardizedContent = content;
  } else {
    throw new Error("Invalid content type. Must be a string or an object.");
  }

  try {
    // 1. Insert message into Messages table
    const messageParams = {
      TableName: "Messages",
      Item: {
        MessageID: messageID,
        SenderID: senderID,
        ReceiverID: receiverID,
        Content: standardizedContent, // Store as an object
        Timestamp: timestamp,
        Status: "sent",
        ConversationID: conversationID,
      },
    };
    console.log("Putting message into Messages table:", JSON.stringify(messageParams, null, 2));
    await docClient.send(new PutCommand(messageParams));
    console.log("Message inserted successfully.");

    // 2. Update Conversations table with LastMessage content and timestamp
    const conversationParams = {
      TableName: "Conversations",
      Key: { ConversationID: conversationID },
      UpdateExpression: "SET LastMessageID = :messageID, LastUpdated = :timestamp, LastMessage = :lastMessage",
      ExpressionAttributeValues: {
        ":messageID": messageID,
        ":timestamp": timestamp,
        ":lastMessage": {
          Content: standardizedContent, // Store as an object
          Timestamp: timestamp
        }
      },
    };
    console.log("Updating Conversations table:", JSON.stringify(conversationParams, null, 2));
    await docClient.send(new UpdateCommand(conversationParams));
    console.log("Conversations table updated successfully.");

    // 3. Update UserConversations for sender
    console.log(`Updating UserConversations for sender: ${senderID}, ConversationID: ${conversationID}`);
    await updateUserConversations(senderID, conversationID, messageID, 0);

    // 4. Update UserConversations for receiver
    console.log(`Updating UserConversations for receiver: ${receiverID}, ConversationID: ${conversationID}`);
    await updateUserConversations(receiverID, conversationID, null, 1);

    // 5. Get receiver's endpoint ARN with caching
    const receiverProfile = await getUserProfile(receiverID);

    if (receiverProfile && receiverProfile.endpointArn) {
      console.log(`Attempting to send notification to ${receiverID} with endpointArn: ${receiverProfile.endpointArn}`);
      try {
        const result = await snsClient.send(new PublishCommand({
          TargetArn: receiverProfile.endpointArn,
          Message: JSON.stringify({
            default: JSON.stringify({
              messageId: messageID,
              senderEmail: senderID,
              content: standardizedContent,
            }),
            GCM: JSON.stringify({
              data: {
                messageId: messageID,
                senderEmail: senderID,
                content: standardizedContent,
              },
            }),
          }),
          MessageStructure: 'json',
        }));
        console.log(`Notification sent successfully. MessageId: ${result.MessageId}`);
      } catch (error) {
        console.error(`Failed to send notification: ${error.message}`);
      }
    } else {
      console.log(`No endpointArn found for receiver ${receiverID}. Notification not sent.`);
    }

    return { success: true, messageID, conversationID };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Function to update UserConversations table.
 * @param {string} userId - User's email.
 * @param {string} conversationId - Conversation ID.
 * @param {string|null} lastReadMessageId - Last read message ID.
 * @param {number} unreadCount - Number of unread messages.
 */
/**
 * Function to update UserConversations table.
 * @param {string} userId - User's email.
 * @param {string} conversationId - Conversation ID.
 * @param {string|null} lastReadMessageId - Last read message ID.
 * @param {number} unreadCount - Number of unread messages.
 */
export const updateUserConversations = async (userId, conversationId, lastReadMessageId, unreadCount) => {
    const updateParams = {
      TableName: 'UserConversations_v2',
      Key: {
        UserID: userId,
        ConversationID: conversationId,
      },
      UpdateExpression: 'SET LastReadMessageID = :messageID, UnreadCount = :unreadCount',
      ExpressionAttributeValues: {
        ':messageID': lastReadMessageId,
        ':unreadCount': unreadCount,
      },
      ReturnValues: 'ALL_NEW',
    };
  
    try {
      await docClient.send(new UpdateCommand(updateParams));
    } catch (error) {
      console.error(`Error updating UserConversations for userId=${userId}, conversationId=${conversationId}:`, error);
      throw error;
    }
  };

/**
 * Function to fetch user memes with pagination.
 * @param {string} email - User's email.
 * @param {number} limit - Number of memes to fetch.
 * @param {Object|null} lastEvaluatedKey - Last evaluated key for pagination.
 * @returns {Promise<Object>} - List of user's memes and pagination key.
 */
/**
 * Function to fetch user memes with pagination.
 * @param {string} email - User's email.
 * @param {number} limit - Number of memes to fetch.
 * @param {Object|null} lastEvaluatedKey - Last evaluated key for pagination.
 * @returns {Promise<Object>} - List of user's memes and pagination key.
 */
export async function getUserMemes(email, limit = 10, lastEvaluatedKey = null) {
    const queryParams = {
      TableName: 'Memes',
      IndexName: 'Email-UploadTimestamp-index',
      KeyConditionExpression: 'Email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      ScanIndexForward: false,
      Limit: limit,
    };
  
    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    }
  
    try {
      const result = await docClient.send(new QueryCommand(queryParams));
      const memes = result.Items.map((item) => ({
        memeID: item.MemeID,
        url: item.MemeURL,
        uploadTimestamp: item.UploadTimestamp,
        caption: item.Caption,
        likeCount: item.LikeCount || 0,
        downloadCount: item.DownloadCount || 0,
        commentCount: item.CommentCount || 0,
        shareCount: item.ShareCount || 0,
      }));
  
      return {
        memes,
        lastEvaluatedKey: result.LastEvaluatedKey || null,
      };
    } catch (error) {
      console.error('Error fetching user memes:', error);
      throw error;
    }
}