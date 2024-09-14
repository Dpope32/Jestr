import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/types';
import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { sendMessage, fetchMessages } from '../../../services/socialService';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './convoStyles';
import { useUserStore } from '../../../stores/userStore';
import { Message, Conversation, User } from '../../../types/types';
import { useInboxStore } from '../../../stores/inboxStore';
import Toast from 'react-native-toast-message';

type ConversationsProps = StackScreenProps<RootStackParamList, 'Conversations'>;

export const Conversations: React.FC<ConversationsProps> = ({ route }) => {
  const { partnerUser, conversation } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentUser = useUserStore(state => state);
  const [sendingAnimation] = useState(new Animated.Value(0)); 
  const [messageOpacity] = useState(new Animated.Value(1)); 
  const [isSending, setIsSending] = useState(false); 
  const sendIcon = isSending ? faCheck : faArrowUp; 

  const loadMessages = useCallback(async () => {
    if (!currentUser.email) {
      console.error('Current user email is undefined');
      return;
    }
  
    // Check if messages are already in the store
    const storedConversation = useInboxStore.getState().conversations.find(
      (conv) => conv.ConversationID === conversation.id
    );
  
    if (storedConversation && storedConversation.messages.length > 0) {
      // Use messages from the store
      setMessages(storedConversation.messages);
    } else {
      try {
        // Fetch messages from the server
        const fetchedMessages = await fetchMessages(currentUser.email, conversation.id);
        setMessages(fetchedMessages);
  
        // Update the store with the fetched messages
        useInboxStore.setState((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.ConversationID === conversation.id) {
              return {
                ...conv,
                messages: fetchedMessages,
              };
            }
            return conv;
          });
          return { conversations: updatedConversations };
        });
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      }
    }
  }, [conversation.id, currentUser.email]);
  

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser.email) return;
  
    const newMsg: Message = {
      MessageID: Date.now().toString(),
      SenderID: currentUser.email,
      ReceiverID: partnerUser.email,
      Content: newMessage,
      Timestamp: new Date().toISOString(),
      Status: 'sent',
      ConversationID: conversation.id,
      sentByMe: true,
    };
  
    // Delay displaying the new message for 0.5 seconds
    setTimeout(() => {
      setMessages((prevMessages) => [newMsg, ...prevMessages]);
    }, 500); // Delay of 0.5 seconds
  
    setNewMessage('');
    setIsSending(true); // Start sending animation
  
    // Animate the up arrow icon
    Animated.sequence([
      Animated.timing(sendingAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(sendingAnimation, {
        toValue: 2,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation state
      sendingAnimation.setValue(0);
      setIsSending(false); // End sending animation
    });
  
    // Dim the message while "sending"
    Animated.timing(messageOpacity, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();
  
    try {
      await sendMessage(currentUser.email, partnerUser.email, newMessage);
  
      // Update the InboxStore with the new message or add a new conversation
      useInboxStore.setState((state) => {
        const conversationExists = state.conversations.find(
          (conv) => conv.ConversationID === conversation.id
        );
  
        let updatedConversations;
        if (conversationExists) {
          updatedConversations = state.conversations.map((conv) => {
            if (conv.ConversationID === conversation.id) {
              return {
                ...conv,
                lastMessage: newMsg,
                messages: [newMsg, ...conv.messages],
              };
            }
            return conv;
          });
        } else {
          // Add a new conversation if it doesn't exist
          const newConversation: Conversation = {
            id: conversation.id,
            ConversationID: conversation.id,
            userEmail: partnerUser.email,
            username: partnerUser.username,
            profilePicUrl: partnerUser.profilePic,
            lastMessage: newMsg,
            timestamp: new Date().toISOString(),
            messages: [newMsg],
            UnreadCount: 0,
            LastReadMessageID: '',
            partnerUser: partnerUser,
          };
          updatedConversations = [newConversation, ...state.conversations];
        }
  
        return { conversations: updatedConversations };
      });
  
      // Show success toast with shorter duration
      Toast.show({
        type: 'success',
        text1: 'Message sent successfully',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000, // Toast visibility time is 2 seconds
      });
  
      // Reset message opacity after sending
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
  
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
        item.SenderID === currentUser.email ? styles.sentMessage : styles.receivedMessage
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
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isSending}>
            <Animated.View style={{ transform: [{ rotate: sendingAnimation.interpolate({
                inputRange: [0, 1, 2],
                outputRange: ['0deg', '360deg', '0deg']
            }) }] }}>
              <FontAwesomeIcon icon={sendIcon} size={24} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversations;