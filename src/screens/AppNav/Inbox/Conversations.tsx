import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../../types/types';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, ProfileImage } from '../../../types/types';
import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { sendMessage, fetchMessages } from '../../../services/authFunctions';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './convoStyles'

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

export interface Conversation {
  id: string;
  ConversationID: string;
  userEmail: string;
  username: string;
  profilePicUrl: string | ProfileImage | null;
  lastMessage: {
    Content: string;
    Timestamp: string;
  };
  timestamp: string;
  messages: any[];
  UnreadCount: number;
  LastReadMessageID: string;
  partnerUser: {
    email: string;
    username: string | null;
    profilePic: string | null;
  };
}



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
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const loadMessages = useCallback(async () => {
    try {
      const fetchedMessages = await fetchMessages(localUser.email, conversation.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    }
  }, [conversation.id, localUser.email]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
      await sendMessage(localUser.email, partnerUser.email, newMessage);
      // Reload messages after sending to ensure consistency
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
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
            source={{uri: `https://jestr-bucket.s3.amazonaws.com/${memeUrl}`}}
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
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={{ flex: 1 }}
    >
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }
      ]}>
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
          estimatedItemSize={79}
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
    </KeyboardAvoidingView>
  );
};

export default Conversations;