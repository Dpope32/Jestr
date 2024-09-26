// socialInteraction.mjs
// Functions: sendMessage, getMessages, getConversations, checkAndAwardBadge, getUserBadges
// Note: Must be zipped with node_modules, package.json, and package-lock.json when uploading to AWS

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID,
});

const publicOperations = [
  "sendMessage",
  "getMessages",
  "getConversations",
];

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
        "SET LastMessageID = :messageID, LastUpdated = :timestamp",
      ExpressionAttributeValues: {
        ":messageID": messageID,
        ":timestamp": timestamp,
      },
    };
    await docClient.send(new UpdateCommand(conversationParams));

    // 3. Update UserConversations for sender
    const senderParams = {
      TableName: "UserConversations",
      Key: { UserID: senderID },
      UpdateExpression:
        "SET LastReadMessageID = :messageID, UnreadCount = :zero, ConversationID = :conversationID",
      ExpressionAttributeValues: {
        ":messageID": messageID,
        ":zero": 0,
        ":conversationID": conversationID,
      },
    };
    await docClient.send(new UpdateCommand(senderParams));

    // 4. Update UserConversations for receiver
    const receiverParams = {
      TableName: "UserConversations",
      Key: { UserID: receiverID },
      UpdateExpression:
        "SET UnreadCount = if_not_exists(UnreadCount, :zero) + :inc, ConversationID = :conversationID",
      ExpressionAttributeValues: {
        ":zero": 0,
        ":inc": 1,
        ":conversationID": conversationID,
      },
    };
    await docClient.send(new UpdateCommand(receiverParams));

    return { success: true, messageID, conversationID };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

const getMessages = async (userID, conversationID) => {
  const params = {
    TableName: "Messages",
    IndexName: "ConversationID-Timestamp-index",
    KeyConditionExpression: "ConversationID = :conversationID",
    ExpressionAttributeValues: {
      ":conversationID": conversationID,
    },
    ScanIndexForward: true, // Set to false for reverse chronological order
  };

  try {
    const messages = [];
    let lastEvaluatedKey = null;

    do {
      const result = await docClient.send(
        new QueryCommand({ ...params, ExclusiveStartKey: lastEvaluatedKey })
      );
      messages.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
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
        let lastMessage = { Content: null, Timestamp: null };
        if (conversationData && conversationData.LastMessageID) {
          const messageParams = {
            TableName: "Messages",
            Key: { MessageID: conversationData.LastMessageID },
          };
          const { Item: messageData } = await docClient.send(
            new GetCommand(messageParams)
          );
          if (messageData) lastMessage = messageData;
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
          lastMessage,
          partnerUser: partnerUserDetails || { email: partnerUserID },
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

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
        const { userID, conversationID } = requestBody;
        if (!userID || !conversationID) {
          return createResponse(
            400,
            "userID and conversationID are required for getting messages."
          );
        }
        try {
          const messages = await getMessages(userID, conversationID);
          return createResponse(
            200,
            "Messages retrieved successfully.",
            messages
          );
        } catch (error) {
          console.error(`Error getting messages: ${error}`);
          return createResponse(500, "Failed to get messages.");
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
