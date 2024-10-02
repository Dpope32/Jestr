// socialInteraction.mjs

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand, CreatePlatformEndpointCommand } from "@aws-sdk/client-sns";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const snsClient = new SNSClient({});
const SNS_PLATFORM_APPLICATION_ARN = process.env.SNS_PLATFORM_APPLICATION_ARN 

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const getMessages = async (userID, conversationID) => {
  console.log(`getMessages called with userID: ${userID}, conversationID: ${conversationID}`);
  
  if (!conversationID) {
    console.error("conversationID is undefined or null");
    throw new Error("conversationID is required");
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

    const messages = result.Items.map(item => {
      console.log("Processing item:", JSON.stringify(item, null, 2));
      let processedContent = item.Content;
      
      if (typeof item.Content === 'string') {
        try {
          const parsedContent = JSON.parse(item.Content);
          if (parsedContent && parsedContent.type === 'meme_share') {
            processedContent = {
              type: 'meme_share',
              memeID: parsedContent.memeID,
              message: parsedContent.message
            };
          }
        } catch (e) {
          console.log("Error parsing message content:", e);
        }
      }
      
      return {
        ...item,
        Content: processedContent
      };
    });

    console.log("Processed messages:", JSON.stringify(messages, null, 2));
    return messages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
};


const publicOperations = ["sendMessage", "getMessages", "getConversations", "registerDevice"];

const FCM_PLATFORM_APPLICATION_ARN = process.env.FCM_PLATFORM_APPLICATION_ARN;

const sendMessage = async (senderID, receiverID, content) => {
  const messageID = uuidv4();
  const timestamp = new Date().toISOString();
  const conversationID = [senderID, receiverID].sort().join("#");

  try {
    // 1. Insert message into Messages table
    const messageParams = {
      TableName: "Messages",
      Item: {
        MessageID: messageID,
        SenderID: senderID,
        ReceiverID: receiverID,
        Content: content,
        Timestamp: timestamp,
        Status: "sent",
        ConversationID: conversationID,
      },
    };
    await docClient.send(new PutCommand(messageParams));

    // 2. Update Conversations table
    const conversationParams = {
      TableName: "Conversations",
      Key: { ConversationID: conversationID },
      UpdateExpression:
        "SET LastMessage = :lastMessage, LastUpdated = :timestamp",
      ExpressionAttributeValues: {
        ":lastMessage": {
          Content: content,
          Timestamp: timestamp,
        },
        ":timestamp": timestamp,
      },
    };
    await docClient.send(new UpdateCommand(conversationParams));

    // 3. Update UserConversations for sender
    await updateUserConversations(senderID, conversationID, messageID, 0);

    // 4. Update UserConversations for receiver
    await updateUserConversations(receiverID, conversationID, null, 1);

    // 5. Get receiver's endpoint ARN
    const { Item: receiverProfile } = await docClient.send(new GetCommand({
      TableName: "Profiles",
      Key: { email: receiverID },
    }));

    if (receiverProfile && receiverProfile.endpointArn) {
      console.log(`Attempting to send notification to ${receiverID} with endpointArn: ${receiverProfile.endpointArn}`);
      try {
        const result = await snsClient.send(new PublishCommand({
          TargetArn: receiverProfile.endpointArn,
          Message: JSON.stringify({
            default: JSON.stringify({
              messageId: messageID,
              senderEmail: senderID,
              content: content
            }),
            GCM: JSON.stringify({
              data: {
                messageId: messageID,
                senderEmail: senderID,
                content: content
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

const getConversations = async (userID) => {
  try {
    // 1. Query UserConversations table
    const userConversationsParams = {
      TableName: "UserConversations",
      KeyConditionExpression: "UserID = :userID",
      ExpressionAttributeValues: { ":userID": userID },
    };
    const { Items: userConversations } = await docClient.send(
      new QueryCommand(userConversationsParams)
    );

    if (!userConversations || userConversations.length === 0) {
      return [];
    }

    // 2. Fetch conversation details
    const conversationsWithDetails = await Promise.all(
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
        let lastMessage = { Content: "No message", Timestamp: "" };
        if (conversationData && conversationData.LastMessage) {
          lastMessage = conversationData.LastMessage;
        }

        // 2c. Identify partner user
        const partnerUserID = ConversationID.split("#").find(
          (id) => id !== userID
        );

        // 2d. Fetch partner user profile
        const profileParams = {
          TableName: "Profiles",
          Key: { email: partnerUserID },
          ProjectionExpression: "email, username, profilePic, headerPic",
        };
        const { Item: partnerUserDetails } = await docClient.send(
          new GetCommand(profileParams)
        );

        return {
          ...item,
          id: ConversationID,
          ConversationID,
          userEmail: item.UserID === userID ? item.UserID : partnerUserID,
          username: partnerUserDetails?.username || "Unknown",
          profilePicUrl: partnerUserDetails?.profilePic || null,
          lastMessage: lastMessage, // This should now be a properly formatted LastMessage
          timestamp: conversationData?.LastUpdated || "",
          messages: [], // Populate as needed
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

    return conversationsWithDetails;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

async function updateUserConversations(userId, conversationId, lastReadMessageId, unreadCount) {
  await docClient.send(new PutCommand({
    TableName: 'UserConversations',
    Item: {
      UserID: userId,
      ConversationID: conversationId,
      LastReadMessageID: lastReadMessageId,
      UnreadCount: unreadCount
    }
  }));
}

async function sendNotification(receiverID, senderID, type, content, relatedID = null) {
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

    // Fetch the user's endpoint ARN from the Profiles table
    const { Item: userProfile } = await docClient.send(new GetCommand({
      TableName: "Profiles",
      Key: { email: receiverID },
    }));

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
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

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
        const { senderID, receiverID, content } = requestBody;
        if (!senderID || !receiverID || !content) {
          return createResponse(
            400,
            "senderID, receiverID, and content are required for sending a message."
          );
        }
        try {
          const result = await sendMessage(senderID, receiverID, content);
          
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
        const { userID } = requestBody;
        if (!userID) {
          return createResponse(
            400,
            "userID is required for fetching conversations."
          );
        }
        try {
          const conversations = await getConversations(userID);
          return createResponse(200, "Conversations retrieved successfully.", {
            conversations,
          });
        } catch (error) {
          console.error("Error fetching conversations:", error);
          return createResponse(500, "Failed to fetch conversations.");
        }
      }

      case "registerDevice": {
        const { userID, deviceToken } = requestBody;
        if (!userID || !deviceToken) {
          return createResponse(
            400,
            "userID and deviceToken are required for registering a device."
          );
        }
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
            UpdateExpression: 'set EndpointArn = :e',
            ExpressionAttributeValues: {
              ':e': EndpointArn
            },
            ReturnValues: 'UPDATED_NEW'
          };

          await docClient.send(new UpdateCommand(updateParams));

          return createResponse(200, "Device registered successfully.", { EndpointArn });
        } catch (error) {
          console.error(`Error registering device: ${error}`);
          return createResponse(500, "Failed to register device.");
        }
      }

      case "getNotifications": {
        const { userID, lastEvaluatedKey } = requestBody;
        if (!userID) {
          return createResponse(400, "userID is required for fetching notifications.");
        }
        try {
          const params = {
            TableName: "Notis",
            KeyConditionExpression: "ReceiverID = :userID",
            ExpressionAttributeValues: { ":userID": userID },
            ScanIndexForward: false, // to get newest notifications first
            Limit: 20, // adjust as needed
          };
          if (lastEvaluatedKey) {
            params.ExclusiveStartKey = lastEvaluatedKey;
          }
          const result = await docClient.send(new QueryCommand(params));
          return createResponse(200, "Notifications retrieved successfully.", {
            notifications: result.Items,
            lastEvaluatedKey: result.LastEvaluatedKey,
          });
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return createResponse(500, "Failed to fetch notifications.");
        }
      }

      default:
        return createResponse(400, `Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error("Unexpected error in Lambda:", error);
    return createResponse(500, "Internal Server Error", {
      error: error.message,
    });
  }
};

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
