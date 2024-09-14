import React, { useState, useCallback, useRef, useEffect } from 'react';
import {View,Text,Image,TextInput,TouchableOpacity,KeyboardAvoidingView,Platform,Animated,StyleSheet} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './convoStyles';
import { useUserStore } from '../../../stores/userStore';
import { Message, Conversation, User } from '../../../types/types';
import { useInboxStore } from '../../../stores/inboxStore';
import Toast from 'react-native-toast-message';
import { InboxNavRouteProp } from '../../../navigation/NavTypes/InboxStackTypes';
import { useFocusEffect } from '@react-navigation/native';
import { useTabBarStore } from '../../../stores/tabBarStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMessages, sendMessage } from '../../../services/socialService';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

export const Conversations = () => {
  const route = useRoute<InboxNavRouteProp>();
  const inputRef = useRef<TextInput>(null);
  const partnerUser = route.params?.partnerUser as User;
  const conversation = route.params?.conversation as Conversation;
  const [sendButtonScale] = useState(new Animated.Value(1));
  const [newMessage, setNewMessage] = useState('');
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const currentUser = useUserStore(state => state);
  const [sendingAnimation] = useState(new Animated.Value(0));
  const [messageOpacity] = useState(new Animated.Value(1));
  const [isSending, setIsSending] = useState(false);
  const sendIcon = isSending ? faCheck : faArrowUp;
  const setTabBarVisibility = useTabBarStore(state => state.setTabBarVisibility);
  const queryClient = useQueryClient();
  const inboxStore = useInboxStore();

  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const storedMessages = inboxStore.getConversationMessages(conversation.id);
      if (storedMessages && storedMessages.length > 0) {
        console.log('Using messages from InboxStore:', storedMessages.length);
        return storedMessages;
      }
      const fetchedMessages = await fetchMessages(currentUser.email, conversation.id);
      console.log('Messages fetched from server:', fetchedMessages.length);
      inboxStore.updateConversationMessages(conversation.id, fetchedMessages);
      return fetchedMessages;
    },
    enabled: !!currentUser.email && !!conversation.id,
  });

  useEffect(() => {
    console.log('Conversations component mounted');
    console.log('Current user:', currentUser);
    console.log('Partner user:', partnerUser);
    console.log('Conversation:', conversation);
    return () => {
      console.log('Conversations component unmounted');
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setTabBarVisibility(false);
      console.log('Conversation screen focused');
      return () => {
        setTabBarVisibility(true);
        console.log('Conversation screen unfocused');
      };
    }, [setTabBarVisibility])
  );

  const sendMessageMutation = useMutation({
    mutationFn: ({ senderEmail, receiverEmail, content }: { senderEmail: string, receiverEmail: string, content: string }) => 
      sendMessage(senderEmail, receiverEmail, content),
    onSuccess: (data, variables) => {
      const newMsg: Message = {
        MessageID: Date.now().toString(),
        SenderID: variables.senderEmail,
        ReceiverID: variables.receiverEmail,
        Content: variables.content,
        Timestamp: new Date().toISOString(),
        Status: 'sent',
        ConversationID: conversation.id,
        sentByMe: true,
      };

      // Update React Query cache
      queryClient.setQueryData(['messages', conversation.id], (old: Message[] | undefined) => 
        [newMsg, ...(old || [])]
      );

      // Update InboxStore
      inboxStore.addMessageToConversation(conversation.id, newMsg);

      Toast.show({
        type: 'success',
        text1: 'Message sent successfully',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: 'Please try again',
        position: 'top',
        autoHide: true,
        visibilityTime: 3000,
      });
    },
  });

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser.email) return;

    setNewMessage('');
    setIsSending(true);

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
      sendingAnimation.setValue(0);
      setIsSending(false);
    });

    // Dim the message while "sending"
    Animated.timing(messageOpacity, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();

    sendMessageMutation.mutate({
      senderEmail: currentUser.email,
      receiverEmail: partnerUser.email,
      content: newMessage,
    });

    // Reset message opacity after sending
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };


  const handlePressIn = useCallback(() => {
    Animated.spring(sendButtonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }, [sendButtonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(sendButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [sendButtonScale]);

  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  }, []);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => {
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
        <View
          style={[
            styles.messageBubble,
            item.SenderID === currentUser.email
              ? styles.sentMessage
              : styles.receivedMessage,
          ]}>
          {isMemeShare && (
            <Image
              source={{ uri: `https://jestr-bucket.s3.amazonaws.com/${memeUrl}` }}
              style={styles.sharedMemeImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.messageText}>{content}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.Timestamp)}</Text>
        </View>
      );
    },
    [currentUser.email, formatTimestamp]
  );


  if (isLoading) {
    return (
      <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../../assets/animations/loading-animation.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Creating Account...</Text>
        </View>
      </BlurView>
    );
  }

  if (error) {
    return <Text>Error loading messages: {error.message}</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Image
            source={{
              uri:
                partnerUser.profilePic ||
                ('https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg' as any),
            }}
            style={styles.profilePic}
          />
          <Text style={styles.username}>{partnerUser.username}</Text>
        </View>
        <FlashList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.MessageID}
          inverted
          contentContainerStyle={styles.messagesContainer}
          estimatedItemSize={79}
        />
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={isSending}>
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <FontAwesomeIcon icon={sendIcon} size={24} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversations;