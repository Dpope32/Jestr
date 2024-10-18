// socialInteraction.mjs

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand, CreatePlatformEndpointCommand } from "@aws-sdk/client-sns";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";
import redis from './redisClient.js';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const snsClient = new SNSClient({});
const SNS_PLATFORM_APPLICATION_ARN = process.env.SNS_PLATFORM_APPLICATION_ARN;

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = ["sendMessage", "getMessages", "getConversations", "registerDevice"];

const FCM_PLATFORM_APPLICATION_ARN = process.env.FCM_PLATFORM_APPLICATION_ARN;

/**
 * Helper function to create standardized responses.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Response message.
 * @param {Object|null} data - Additional data to include in the response.
 * @returns {Object} - Lambda response object.
 */
const createResponse = (statusCode, message, data = null) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
  },
  body: JSON.stringify({ message, data }),
});

/**
 * Function to get user profile with caching.
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} - User profile or null if not found.
 */
const getUserProfile = async (email) => {
  const cacheKey = `userProfile:${email}`;
  let userProfile = await redis.get(cacheKey);

  if (userProfile) {
    return JSON.parse(userProfile);
  }

  // If not in cache, fetch from DynamoDB
  const params = {
    TableName: "Profiles",
    Key: { email: email },
    ProjectionExpression: "email, username, profilePic, endpointArn"
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (Item) {
      // Cache the profile for future requests
      await redis.set(cacheKey, JSON.stringify(Item), 'EX', 3600); // Cache for 1 hour
      return Item;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Function to get messages with caching.
 * @param {string} userID - User's email.
 * @param {string} conversationID - Conversation ID.
 * @returns {Promise<Array>} - List of messages.
 */
const getMessages = async (userID, conversationID) => {
  console.log(`getMessages called with userID: ${userID}, conversationID: ${conversationID}`);
  
  if (!conversationID) {
    console.error("conversationID is undefined or null");
    throw new Error("conversationID is required");
  }

  const cacheKey = `messages:${conversationID}`;
  let messages = await redis.get(cacheKey);

  if (messages) {
    console.log(`Cache hit for messages: ${conversationID}`);
    return JSON.parse(messages);
  }

  const params = {
    TableName: "Messages",
    IndexName: "ConversationID-Timestamp-index",
    KeyConditionExpression: "ConversationID = :conversationID",
    ExpressionAttributeValues: {
      ":conversationID": conversationID,
    },
    ScanIndexForward: true,
  };

  console.log("Query params:", JSON.stringify(params, null, 2));

  try {
    console.log("Executing DynamoDB query");
    const result = await docClient.send(new QueryCommand(params));
    console.log("Query result:", JSON.stringify(result, null, 2));

    if (!result.Items) {
      console.log("No items returned from query");
      return [];
    }

    const processedMessages = result.Items.map(item => ({
      ...item,
      Content: item.Content, // Already an object
    }));

    console.log("Processed messages:", JSON.stringify(processedMessages, null, 2));

    // Cache the messages for 5 minutes
    await redis.set(cacheKey, JSON.stringify(processedMessages), 'EX', 300);

    return processedMessages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};

/**
 * Function to get conversations with caching.
 * @param {string} userID - User's email.
 * @returns {Promise<Array>} - List of conversations.
 */
const getConversations = async (userID) => {
  try {
    const cacheKey = `conversations:${userID}`;
    let conversationsWithDetails = await redis.get(cacheKey);

    if (conversationsWithDetails) {
      console.log(`Cache hit for conversations: ${userID}`);
      return JSON.parse(conversationsWithDetails);
    }

    // 1. Query UserConversations table
    const userConversationsParams = {
      TableName: "UserConversations_v2",
      KeyConditionExpression: "UserID = :userID",
      ExpressionAttributeValues: { ":userID": userID },
    };
    const { Items: userConversations } = await docClient.send(
      new QueryCommand(userConversationsParams)
    );

    if (!userConversations || userConversations.length === 0) {
      console.log("No conversations found for user.");
      await redis.set(cacheKey, JSON.stringify([]), 'EX', 600); // Cache empty list for 10 minutes
      return [];
    }

    // 2. Fetch conversation details
    conversationsWithDetails = await Promise.all(
      userConversations.map(async (item) => {
        const { ConversationID } = item;

        // 2a. Fetch conversation from Conversations table
        const conversationParams = {
          TableName: "Conversations",
          Key: { ConversationID },
        };
        const { Item: conversationData } = await docClient.send(
          new GetCommand(conversationParams)
        );

        // 2b. Fetch last message
        let lastMessage = conversationData?.LastMessage || { Content: { type: 'text', message: 'No message' }, Timestamp: '' };
        if (conversationData && conversationData.LastMessage) {
          // Ensure LastMessage.Content is a JSON string representing an object
          if (typeof conversationData.LastMessage.Content === 'string') {
            try {
              const parsed = JSON.parse(conversationData.LastMessage.Content);
              if (parsed && typeof parsed === 'object') {
                lastMessage = {
                  Content: JSON.stringify(parsed),
                  Timestamp: conversationData.LastMessage.Timestamp
                };
              } else {
                // Fallback to default structure
                lastMessage = {
                  Content: JSON.stringify({ type: "text", message: "No message" }),
                  Timestamp: conversationData.LastMessage.Timestamp
                };
              }
            } catch (e) {
              console.log("Error parsing LastMessage.Content:", e);
              lastMessage = {
                Content: JSON.stringify({ type: "text", message: "No message" }),
                Timestamp: conversationData.LastMessage.Timestamp
              };
            }
          } else {
            // If LastMessage.Content is not a string, assume it's an object
            lastMessage = {
              Content: JSON.stringify(conversationData.LastMessage.Content),
              Timestamp: conversationData.LastMessage.Timestamp
            };
          }
        }

        // 2c. Identify partner user
        const partnerUserID = ConversationID.split("#").find(
          (id) => id !== userID
        );

        // 2d. Fetch partner user profile with caching
        const partnerUserDetails = await getUserProfile(partnerUserID);

        return {
          ...item,
          id: ConversationID,
          ConversationID,
          userEmail: item.UserID === userID ? item.UserID : partnerUserID,
          username: partnerUserDetails?.username || "Unknown",
          profilePicUrl: partnerUserDetails?.profilePic || null,
          lastMessage: lastMessage, // Now a JSON string
          timestamp: conversationData?.LastUpdated || "",
          messages: [], // Populate as needed or implement pagination
          UnreadCount: item.UnreadCount || 0,
          LastReadMessageID: item.LastReadMessageID || "",
          partnerUser: {
            email: partnerUserDetails?.email || partnerUserID,
            username: partnerUserDetails?.username || "Unknown",
            profilePic: partnerUserDetails?.profilePic || null,
          },
        };
      })
    );

    // Cache the conversations for 10 minutes
    await redis.set(cacheKey, JSON.stringify(conversationsWithDetails), 'EX', 600);

    return conversationsWithDetails;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
/**
 * Function to update UserConversations table with caching.
 * @param {string} userId - User's email.
 * @param {string} conversationId - Conversation ID.
 * @param {string|null} lastReadMessageId - Last read message ID.
 * @param {number} unreadCount - Number of unread messages.
 */
const updateUserConversations = async (userId, conversationId, lastReadMessageId, unreadCount) => {
  const updateParams = {
    TableName: 'UserConversations_v2',
    Key: {
      UserID: userId,
      ConversationID: conversationId
    },
    UpdateExpression: 'SET LastReadMessageID = :messageID, UnreadCount = :unreadCount',
    ExpressionAttributeValues: {
      ':messageID': lastReadMessageId,
      ':unreadCount': unreadCount
    },
    ReturnValues: 'ALL_NEW'
  };
  console.log(`updateUserConversations called with: userId=${userId}, conversationId=${conversationId}, lastReadMessageId=${lastReadMessageId}, unreadCount=${unreadCount}`);
  console.log(`UpdateParams: ${JSON.stringify(updateParams, null, 2)}`);
  
  try {
    await docClient.send(new UpdateCommand(updateParams));
    console.log(`Successfully updated UserConversations for userId=${userId}, conversationId=${conversationId}`);

    // Invalidate cached conversations for the user
    const cacheKey = `conversations:${userId}`;
    await redis.del(cacheKey);
    console.log(`Invalidated cache for conversations:${userId}`);
  } catch (error) {
    console.error(`Error updating UserConversations for userId=${userId}, conversationId=${conversationId}:`, error);
    throw error;
  }
};

/**
 * Function to send a notification.
 * @param {string} receiverID - Receiver's email.
 * @param {string} senderID - Sender's email.
 * @param {string} type - Type of notification.
 * @param {Object} content - Notification content.
 * @param {string|null} relatedID - Related ID (e.g., messageID, memeID).
 * @returns {Promise<Object>} - Result of the notification send.
 */
const sendNotification = async (receiverID, senderID, type, content, relatedID = null) => {
  try {
    const notificationID = uuidv4();
    const timestamp = new Date().toISOString();

    // Store notification in DynamoDB
    const notificationParams = {
      TableName: 'Notis',
      Item: {
        ReceiverID: receiverID,
        SenderID: senderID,
        NotificationID: notificationID,
        Type: type,
        Content: content,
        RelatedID: relatedID, // This could be a messageID, memeID, etc.
        Seen: false,
        Timestamp: timestamp
      }
    };
    await docClient.send(new PutCommand(notificationParams));

    // Fetch the user's endpoint ARN from the Profiles table with caching
    const userProfile = await getUserProfile(receiverID);

    if (userProfile && userProfile.endpointArn) {
      // Send push notification via SNS
      await snsClient.send(new PublishCommand({
        TargetArn: userProfile.endpointArn,
        Message: JSON.stringify({
          default: JSON.stringify({
            notificationId: notificationID,
            type,
            content,
            senderID,
            relatedID
          }),
          GCM: JSON.stringify({
            data: {
              notificationId: notificationID,
              type,
              content,
              senderID,
              relatedID
            }
          })
        }),
        MessageStructure: 'json'
      }));
    }

    return { success: true, notificationID };
  } catch (error) {
    if (error.name === 'InvalidParameter' || error.name === 'EndpointDisabled') {
      // Remove the invalid endpointArn from the user's profile
      await docClient.send(new UpdateCommand({
        TableName: 'Profiles',
        Key: { email: receiverID },
        UpdateExpression: 'REMOVE endpointArn',
      }));
      // Invalidate the cache
      await redis.del(`userProfile:${receiverID}`);
      console.error(`EndpointArn disabled or invalid for user ${receiverID}, removed from profile.`);
    } else {
      console.error(`Failed to send notification: ${error.message}`);
    }
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Function to send a message to a user.
 * @param {string} senderID - Sender's email.
 * @param {string} receiverID - Receiver's email.
 * @param {Object} content - Message content.
 * @returns {Promise<Object>} - Result of the sendMessage operation.
 */

const sendMessage = async (senderID, receiverID, content) => {
  const messageID = uuidv4();
  const timestamp = new Date().toISOString();
  const conversationID = [senderID, receiverID].sort().join("#");
  
  console.log(`sendMessage called with: senderID=${senderID}, receiverID=${receiverID}, content=${JSON.stringify(content)}`);
  console.log(`Generated messageID=${messageID}, conversationID=${conversationID}`);

  // Ensure content is an object with 'type' and 'message'
  let messageContent;
  if (typeof content === 'string') {
    messageContent = { type: 'text', message: content };
  } else if (typeof content === 'object') {
    messageContent = content;
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
        Content: messageContent, // Store as an object, not a JSON string
        Timestamp: timestamp,
        Status: "sent",
        ConversationID: conversationID
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
          Content: messageContent, // Store as an object, not a JSON string
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
              content: messageContent
            }),
            GCM: JSON.stringify({
              data: {
                messageId: messageID,
                senderEmail: senderID,
                content: messageContent
              }
            })
          }),
          MessageStructure: 'json'
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
 * Function to get conversations with caching.
 * @param {string} userID - User's email.
 * @returns {Promise<Array>} - List of conversations.
 */
const getConversationsFunction = async (userID) => {
  return await getConversations(userID);
};

/**
 * Function to register a device for push notifications.
 * @param {string} userID - User's email.
 * @param {string} deviceToken - Device token.
 * @returns {Promise<Object>} - Result of the registration.
 */
const registerDevice = async (userID, deviceToken) => {
  try {
    // Create an SNS platform endpoint for this device
    const createEndpointParams = {
      PlatformApplicationArn: SNS_PLATFORM_APPLICATION_ARN,
      Token: deviceToken,
      CustomUserData: userID
    };
    const createEndpointCommand = new CreatePlatformEndpointCommand(createEndpointParams);
    const { EndpointArn } = await snsClient.send(createEndpointCommand);

    // Update the Profile in DynamoDB with the new EndpointArn
    const updateParams = {
      TableName: 'Profiles',
      Key: { email: userID },
      UpdateExpression: 'set endpointArn = :e',
      ExpressionAttributeValues: {
        ':e': EndpointArn
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await docClient.send(new UpdateCommand(updateParams));

    // Invalidate cached user profile
    const cacheKey = `userProfile:${userID}`;
    await redis.del(cacheKey);
    console.log(`Invalidated cache for userProfile:${userID}`);

    return { EndpointArn };
  } catch (error) {
    console.error(`Error registering device: ${error}`);
    throw error;
  }
};

/**
 * Function to get notifications.
 * @param {string} userID - User's email.
 * @param {Object|null} lastEvaluatedKey - Last evaluated key for pagination.
 * @returns {Promise<Object>} - List of notifications and pagination key.
 */
const getNotifications = async (userID, lastEvaluatedKey) => {
  try {
    const params = {
      TableName: "Notis",
      KeyConditionExpression: "ReceiverID = :userID",
      ExpressionAttributeValues: { ":userID": userID },
      ScanIndexForward: false, // to get newest notifications first
      Limit: 20, // adjust as needed
    };
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }

    const result = await docClient.send(new QueryCommand(params));
    return {
      notifications: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Lambda handler function.
 * @param {Object} event - The event object.
 * @returns {Object} - The response object.
 */
export const handler = async (event) => {
  try {
    let requestBody;
    if (event.body) {
      requestBody = JSON.parse(event.body);
    } else if (event.operation) {
      requestBody = event;
    } else {
      return createResponse(400, "No valid request body or operation found");
    }

    const { operation } = requestBody;

    // Verify token if operation is not public
    let verifiedUser = null;
    if (!publicOperations.includes(operation)) {
      const token =
        event.headers?.Authorization?.split(" ")[1] ||
        event.headers?.authorization?.split(" ")[1];

      if (!token) {
        return createResponse(401, "No token provided");
      }

      try {
        const payload = await verifier.verify(token);
        verifiedUser = payload;
      } catch (error) {
        console.error("Token verification failed:", error);
        return createResponse(401, "Invalid token");
      }
    }

    switch (operation) {
      case "sendMessage": {
        console.log("Operation: sendMessage");
        const { senderID, receiverID, content } = requestBody;
        console.log(`Parameters: senderID=${senderID}, receiverID=${receiverID}, content=${JSON.stringify(content)}`);

        if (!senderID || !receiverID || !content) {
          console.error("Missing required parameters for sendMessage.");
          return createResponse(
            400,
            "senderID, receiverID, and content are required for sending a message."
          );
        }

        try {
          console.log("Calling sendMessage function.");
          const result = await sendMessage(senderID, receiverID, content);
          console.log("sendMessage function returned:", JSON.stringify(result, null, 2));

          return createResponse(200, "Message sent successfully.", result);
        } catch (error) {
          console.error(`Error sending message: ${error}`);
          return createResponse(500, "Failed to send message.");
        }
      }
    
      case "getMessages": {
        console.log("getMessages operation called");
        const { userID, conversationID } = requestBody;
        console.log(`Received userID: ${userID}, conversationID: ${conversationID}`);
        
        if (!userID || !conversationID) {
          console.log("Missing required parameters");
          return createResponse(
            400,
            "userID and conversationID are required for getting messages."
          );
        }
        
        try {
          console.log("Calling getMessages function");
          const messages = await getMessages(userID, conversationID);
          console.log(`Retrieved ${messages.length} messages`);
          return createResponse(
            200,
            "Messages retrieved successfully.",
            messages
          );
        } catch (error) {
          console.error(`Error in getMessages handler: ${error}`);
          return createResponse(500, `Failed to get messages: ${error.message}`);
        }
      }

      case "getConversations": {
        console.log("getConversations operation called");
        const { userID } = requestBody;
        console.log(`Received userID: ${userID}`);
        
        if (!userID) {
          console.log("Missing required parameters");
          return createResponse(
            400,
            "userID is required for fetching conversations."
          );
        }
        
        try {
          console.log("Calling getConversations function");
          const conversations = await getConversationsFunction(userID);
          console.log(`Retrieved ${conversations.length} conversations`);
          return createResponse(200, "Conversations retrieved successfully.", {
            conversations,
          });
        } catch (error) {
          console.error("Error fetching conversations:", error);
          return createResponse(500, "Failed to fetch conversations.");
        }
      }

      case "registerDevice": {
        console.log("Operation: registerDevice");
        const { userID, deviceToken } = requestBody;
        console.log(`Parameters: userID=${userID}, deviceToken=${deviceToken}`);
        
        if (!userID || !deviceToken) {
          console.error("Missing required parameters for registerDevice.");
          return createResponse(
            400,
            "userID and deviceToken are required for registering a device."
          );
        }
        try {
          console.log("Calling registerDevice function.");
          const result = await registerDevice(userID, deviceToken);
          console.log("registerDevice function returned:", JSON.stringify(result, null, 2));

          return createResponse(200, "Device registered successfully.", { EndpointArn: result.EndpointArn });
        } catch (error) {
          console.error(`Error registering device: ${error}`);
          return createResponse(500, "Failed to register device.");
        }
      }

      case "getNotifications": {
        console.log("Operation: getNotifications");
        const { userID, lastEvaluatedKey } = requestBody;
        console.log(`Parameters: userID=${userID}, lastEvaluatedKey=${lastEvaluatedKey}`);

        if (!userID) {
          console.error("Missing required parameters for getNotifications.");
          return createResponse(
            400,
            "userID is required for fetching notifications."
          );
        }
        try {
          console.log("Calling getNotifications function.");
          const notifications = await getNotifications(userID, lastEvaluatedKey);
          console.log(`Retrieved ${notifications.notifications.length} notifications`);
          return createResponse(200, "Notifications retrieved successfully.", notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return createResponse(500, "Failed to fetch notifications.");
        }
      }

      default:
        console.warn(`Unsupported operation: ${operation}`);
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error("Unexpected error in Lambda:", error);
    return createResponse(500, "Internal Server Error", {
      error: error.message,
    });
  }
};
