// src/screens/AppNav/Inbox/Conversations.tsx

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Modal,
  PanResponder,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowUp,
  faArrowLeft,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { formatTimestamp } from '../../../utils/dateUtils';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { InboxNavProp } from '../../../navigation/NavTypes/InboxStackTypes';

import { useTheme } from '../../../theme/ThemeContext';
import styles from './convoStyles';
import { useUserStore } from '../../../stores/userStore';
import {
  Message,
  Conversation,
  MemeShareContent,
} from '../../../types/messageTypes';
import { User } from '../../../types/types';
import { useInboxStore } from '../../../stores/inboxStore';
import { InboxNavRouteProp } from '../../../navigation/NavTypes/InboxStackTypes';
import { useTabBarStore } from '../../../stores/tabBarStore';
import { useBadgeStore } from '../../../stores/badgeStore';
import { fetchMessages, sendMessage } from '../../../services/inboxServices';
import { getProfilePicUri } from '../../../utils/helpers';


export const Conversations = () => {
  const navigation = useNavigation<InboxNavProp>();
  const route = useRoute<InboxNavRouteProp>();
  const partnerUser = route.params?.partnerUser as User;
  const conversation = route.params?.conversation as Conversation;
  const badgeStore = useBadgeStore();

  const [memeId, setMemeId] = useState<string | undefined>(
    route.params?.currentMedia,
  );

  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const currentUser = useUserStore(state => state);
  const setTabBarVisibility = useTabBarStore(state => state.setTabBarVisible);
  const inboxStore = useInboxStore();
  const inputRef = useRef<TextInput>(null);
  const [sendButtonScale] = useState(new Animated.Value(1));
  const [newMessage, setNewMessage] = useState<string>(''); // Explicitly typed as string
  const [sendingAnimation] = useState(new Animated.Value(0));
  const [messageOpacity] = useState(new Animated.Value(1));
  const [isSending, setIsSending] = useState(false);
  const [showMeme, setShowMeme] = useState(!!memeId);
  const [isMemeFullscreenVisible, setIsMemeFullscreenVisible] = useState(false);

  // Correctly define memeAnimation using useRef
  const memeAnimation = useRef(new Animated.Value(0)).current;

  // Updated State: Exclude null, use undefined instead
  const [fullscreenMemeUrl, setFullscreenMemeUrl] = useState<
    string | undefined
  >(undefined);
  const [fullscreenMediaType, setFullscreenMediaType] = useState<
    'image' | 'video'
  >('image');

  const sendIcon = isSending ? faCheck : faArrowUp;

  const [fullscreenMeme, setFullscreenMeme] = useState<string | null>(null);

  const openFullscreenMeme = useCallback((memeUrl: string) => {
    setFullscreenMeme(memeUrl);
  }, []);

  const closeFullscreenMeme = useCallback(() => {
    setFullscreenMeme(null);
  }, []);

  /**
   * Fetches messages for the current conversation.
   */
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const storedMessages = inboxStore.getConversationMessages(conversation.id);
      if (storedMessages && storedMessages.length > 0) {
        console.log('Using messages from InboxStore:', storedMessages.length);
        return storedMessages;
      }
      const fetchedMessages = await fetchMessages(currentUser.email, conversation.id);

      // Sort messages in ascending order (oldest first)
      fetchedMessages.sort((a: Message, b: Message) =>
        new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
      );

      console.log('Messages fetched from server:', fetchedMessages.length);
      inboxStore.updateConversationMessages(conversation.id, fetchedMessages);
      return fetchedMessages;
    },
    enabled: !!currentUser.email && !!conversation.id,
  });

  useFocusEffect(
    React.useCallback(() => {
      setTabBarVisibility(false);
      console.log('Conversation screen focused');
      inboxStore.resetUnreadCount(conversation.id);

      setShowMeme(!!memeId);

      return () => {
        setTabBarVisibility(true);
        console.log('Conversation screen unfocused');
      };
    }, [setTabBarVisibility, conversation.id, memeId]),
  );

  /**
   * Mutation to send a message.
   */
  const sendMessageMutation = useMutation({
    mutationFn: ({
      senderEmail,
      receiverEmail,
      content,
    }: {
      senderEmail: string;
      receiverEmail: string;
      content: string;
    }) => sendMessage(senderEmail, receiverEmail, content),
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

      queryClient.setQueryData(
        ['messages', conversation.id],
        (old: Message[] | undefined) => [...(old || []), newMsg],
      );

      const existingConversation = inboxStore.conversations.find(
        conv => conv.id === conversation.id,
      );

      if (existingConversation) {
        inboxStore.addMessageToConversation(conversation.id, newMsg);
      } else {
        const newConversation: Conversation = {
          id: conversation.id,
          ConversationID: conversation.ConversationID,
          userEmail: conversation.userEmail,
          username: conversation.username,
          profilePicUrl: conversation.profilePicUrl,
          lastMessage: newMsg,
          timestamp: newMsg.Timestamp,
          messages: [newMsg],
          UnreadCount: 0,
          LastReadMessageID: newMsg.MessageID,
          partnerUser: conversation.partnerUser,
        };
        inboxStore.addConversation(newConversation);
      }

      Toast.show({
        type: 'success',
        text1: 'Message sent successfully',
        position: 'top',
        autoHide: true,
        visibilityTime: 2000,
      });

      // Haptic Feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: error => {
      console.error('Failed to send message:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: 'Please try again',
        position: 'top',
        autoHide: true,
        visibilityTime: 3000,
      });

      // Haptic Feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim() === '' || !currentUser.email) return;
    Keyboard.dismiss();
    setNewMessage('');
    setIsSending(true);
  
    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    const messageContent = {
      type: 'text',
      message: newMessage
    };
  
    sendMessageMutation.mutate(
      {
        senderEmail: currentUser.email!,
        receiverEmail: partnerUser.email!,
        content: JSON.stringify(messageContent), // Stringify the content object
      },
      {
        onSuccess: () => {
          setIsSending(false);
        },
        onError: () => {
          setIsSending(false);
        },
      },
    );
  }, [newMessage, currentUser.email, partnerUser.email, sendMessageMutation]);
  
  const handleSendMeme = useCallback(() => {
    if (!memeId) {
      console.log('No memeId available, cannot send meme');
      return;
    }
  
    setIsSending(true);
  
    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
    const memeContent: MemeShareContent = {
      type: 'meme_share',
      memeID: memeId,
      message: newMessage || 'Shared a meme',
    };
    
    const contentString = JSON.stringify(memeContent);
    
    sendMessageMutation.mutate(
      {
        senderEmail: currentUser.email!,
        receiverEmail: partnerUser.email!,
        content: contentString,
      },
      {
        onSuccess: () => {
          setShowMeme(false);
          setNewMessage('');
          badgeStore.incrementCount('shareCount', currentUser.email);
          setIsSending(false);
          setMemeId(undefined);
  
          setTimeout(() => {
            setMemeId(route.params?.currentMedia);
            setShowMeme(!!route.params?.currentMedia);
          }, 500);
  
          navigation.pop();
  
          // Haptic Feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: () => {
          setIsSending(false);
  
          // Haptic Feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      },
    );
  }, [
    memeId,
    newMessage,
    currentUser.email,
    partnerUser.email,
    sendMessageMutation,
    navigation,
    badgeStore,
    route.params?.currentMedia,
  ]);

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

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      let content: React.ReactNode;
      let parsedContent: any;
  
      // Parse the Content field if it's a string
      if (typeof item.Content === 'string') {
        try {
          parsedContent = JSON.parse(item.Content);
        } catch (e) {
          console.error('Failed to parse message content:', e);
          // Fallback to treating Content as plain text
          parsedContent = { type: 'text', message: item.Content };
        }
      } else {
        parsedContent = item.Content;
      }
  
      // Now handle the parsedContent as an object
      if (parsedContent.type === 'meme_share') {
        content = (
          <View>
            <Text style={styles.messageText}>
              {parsedContent.message || 'Shared a meme'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFullscreenMemeUrl(parsedContent.memeID);
                setIsMemeFullscreenVisible(true);
              }}
            >
              <Image
                source={{ uri: parsedContent.memeID }}
                style={styles.sharedMemeImage}
              />
            </TouchableOpacity>
          </View>
        );
      } else if (parsedContent.type === 'text') {
        content = (
          <Text style={styles.messageText}>
            {parsedContent.message || 'No message'}
          </Text>
        );
      } else {
        // Handle other types if necessary
        content = (
          <Text style={styles.messageText}>
            {String(parsedContent.message)}
          </Text>
        );
      }
  
      return (
        <View
          style={[
            styles.messageBubble,
            item.SenderID === currentUser.email
              ? styles.sentMessage
              : styles.receivedMessage,
          ]}
        >
          {content}
          <Text style={styles.timestamp}>
            {formatTimestamp(item?.Timestamp) || 'N/A'}
          </Text>
        </View>
      );
    },
    [currentUser.email, setFullscreenMemeUrl, setIsMemeFullscreenVisible]
  );
  

  useEffect(() => {
    if (showMeme) {
      Animated.timing(memeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(memeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showMeme, memeAnimation]);

  /**
   * Determines the content to display based on the loading and error states.
   */
  const memoizedContent = useMemo(() => {
    if (isLoading) {
      return (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../../../assets/animations/loading-animation.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.loadingText}>Loading</Text>
          </View>
        </BlurView>
      );
    }

    if (error) {
      console.error('Error loading messages:', error);
      return (
        <Text style={styles.errorText}>
          Error loading messages: {error.message}
        </Text>
      );
    }

  
    return (
      <>
        <FlashList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.MessageID}
          estimatedItemSize={79}
          contentContainerStyle={{ paddingBottom: showMeme ? 100 : 10 }}
        />
        {showMeme && (
          <Animated.View
            style={[
              styles.memeContainer,
              {
                opacity: memeAnimation,
                transform: [{ scale: memeAnimation }],
              },
            ]}>
            <Image
              source={memeId ? { uri: memeId } : undefined}
              style={styles.memeImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.closeMemeButton}
              onPress={() => {
                console.log('Closing meme preview');
                setShowMeme(false);
                setMemeId(undefined);
              }}
              accessibilityLabel="Close meme preview"
              accessibilityRole="button">
              <FontAwesomeIcon icon={faTimes} size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </>
    );
  }, [isLoading, error, messages, showMeme, memeId, renderMessage, memeAnimation]);

  /**
   * PanResponder for swipe-to-close functionality on fullscreen memes.
   */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderRelease: (evt, gestureState) => {
          const { dx, dy } = gestureState;
          const swipeThreshold = 50; // Minimum distance for a swipe

          if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
            console.log('Swipe detected. Closing fullscreen meme.');
            setIsMemeFullscreenVisible(false);
          }
        },
      }),
    [],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1 }}>
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              // Haptic Feedback
              Haptics.selectionAsync();
            }}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Image
            source={{
              uri: getProfilePicUri(partnerUser.profilePic),
            }}
            style={styles.profilePic}
          />
          <Text style={styles.username}>{partnerUser.username}</Text>
        </View>

        {memoizedContent}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            placeholderTextColor="#999"
            onSubmitEditing={showMeme ? handleSendMeme : handleSendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.sendButton}
            onPress={() => {
              console.log('Send button pressed. ShowMeme:', showMeme);
              showMeme ? handleSendMeme() : handleSendMessage();
            }}
            disabled={isSending}
            accessibilityLabel="Send message"
            accessibilityRole="button">
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FontAwesomeIcon icon={sendIcon} size={24} color="white" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isMemeFullscreenVisible}
          transparent={true}
          onRequestClose={() => setIsMemeFullscreenVisible(false)}
        >
          <View style={styles.fullscreenMemeContainer}>
            <TouchableOpacity
              style={styles.fullscreenMemeCloseButton}
              onPress={() => setIsMemeFullscreenVisible(false)}
            >
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
            <Image
              source={{ uri: fullscreenMemeUrl }}
              style={styles.fullscreenMemeImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};


export default Conversations;
