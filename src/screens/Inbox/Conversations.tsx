import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ListRenderItemInfo, Clipboard, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowLeft, faSmile } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/types';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import BottomPanel from '../../components/Panels/BottomPanel';
import { sendMessage, fetchMessages } from '../../services/authFunctions';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

export type Message = {
  MessageID: string;
  SenderID: string;
  ReceiverID: string;
  Content: string;
  Timestamp: string;
  Status: 'sent' | 'delivered' | 'read';
  ConversationID: string;
  sentByMe?: boolean;
  read?: boolean;
  reactions?: string[];
};

export type Conversation = {
  id: string;
  userEmail: string;
  username: string;
  profilePicUrl: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
};

type ConversationsParams = {
  localUser: User;
  partnerUser: User;
  conversation: Conversation;
};

type ConversationsProps = StackScreenProps<RootStackParamList, 'Conversations'>;

const Conversations: React.FC<ConversationsProps> = ({ route }) => {
  const { localUser, partnerUser, conversation } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const navigation = useNavigation();
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const newMsg: Message = {
      MessageID: Date.now().toString(),
      SenderID: localUser.email,
      ReceiverID: partnerUser.email,
      Content: newMessage,
      Timestamp: new Date().toISOString(),
      Status: 'sent',
      ConversationID: conversation.id,
      sentByMe: true,
    };

    setMessages((prevMessages) => [newMsg, ...prevMessages]);
    setNewMessage('');

    try {
      console.log('Sending message from:', localUser.email, 'to:', partnerUser.email);
      await sendMessage(localUser.email, partnerUser.email, newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const getMessagePreview = (message: Message) => {
    try {
      const content = JSON.parse(message.Content);
      if (content.type === 'meme_share') {
        return content.message || 'Shared a meme';
      }
    } catch (e) {
      // Not JSON, use the content as is
    }
    return message.Content;
  };

  useEffect(() => {
    const loadMessages = async () => {
      const fetchedMessages = await fetchMessages(localUser.email, conversation.id);
      setMessages(fetchedMessages.reverse());
    };
    loadMessages();
  }, [localUser.email, conversation.id]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const toggleProfilePanel = () => {
    setProfilePanelVisible(!profilePanelVisible);
  };

  const handleLongPress = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Message copied to clipboard');
  };

  const addReaction = (messageId: string, reaction: string) => {
    setMessages(messages.map(msg => 
      msg.MessageID === messageId 
        ? { ...msg, reactions: [...(msg.reactions || []), reaction] } 
        : msg
    ));
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    let content = item.Content;
    let isMemeShare = false;
    let memeUrl = '';
  
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      try {
        const parsedContent = JSON.parse(content);
        if (parsedContent.type === 'meme_share') {
          content = parsedContent.message || 'Shared a meme';
          isMemeShare = true;
          memeUrl = parsedContent.memeID;
        }
      } catch (e) {
        console.log('Failed to parse message content:', e);
      }
    }
  
    return (
      <View style={[
        styles.messageBubble,
        item.SenderID === localUser.email ? styles.sentMessage : styles.receivedMessage
      ]}>
        {isMemeShare && (
          <Image 
            source={{uri: `https://jestr-bucket.s3.amazonaws.com/Memes/${memeUrl}`}}
            style={styles.sharedMemeImage}
            resizeMode="contain"
          />
        )}
        <Text style={styles.messageText}>{content}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.Timestamp)}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
        </TouchableOpacity>
       <Image 
  source={{uri: partnerUser.profilePic || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg'}} 
  style={styles.profilePic} 
/>
        <Text style={styles.username}>{partnerUser.username}</Text>
      </View>
      <FlashList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.MessageID}
        inverted
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <FontAwesomeIcon icon={faArrowUp} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    marginRight: 10,
  },
  sharedMemeImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    color: 'white',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4299e1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d3748',
  },
  messageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#aaa',
    marginRight: 5,
  },
  status: {
    fontSize: 10,
    color: '#aaa',
  },
  readReceipt: {
    fontSize: 10,
    color: '#aaa',
    marginLeft: 5,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  reaction: {
    fontSize: 16,
    marginRight: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1bd40b',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Conversations;