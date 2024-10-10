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
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { formatTimestamp } from '../../../utils/dateUtils';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';

import { useTheme } from '../../../theme/ThemeContext';
import styles from './convoStyles';
import { useUserStore } from '../../../stores/userStore';
import { Message, Conversation, MemeShareContent } from '../../../types/messageTypes';
import { User } from '../../../types/types';
import { useInboxStore } from '../../../stores/inboxStore';
import { InboxNavRouteProp } from '../../../navigation/NavTypes/InboxStackTypes';
import { useTabBarStore } from '../../../stores/tabBarStore';
import { useBadgeStore } from '../../../stores/badgeStore';
import { fetchMessages, sendMessage } from '../../../services/socialService';
import { getProfilePicUri } from '../../../utils/helpers'; 

const isMemeShareContent = (content: any): content is MemeShareContent => {
  return content && typeof content === 'object' && content.type === 'meme_share' && typeof content.memeID === 'string';
};

export const Conversations = () => {
  const navigation = useNavigation();
  const route = useRoute<InboxNavRouteProp>();
  const partnerUser = route.params?.partnerUser as User;
  const conversation = route.params?.conversation as Conversation;
  const badgeStore = useBadgeStore();
  
  // Updated State: Exclude null, use undefined instead
  const [memeId, setMemeId] = useState<string | undefined>(route.params?.currentMedia);

  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();
  const currentUser = useUserStore((state) => state);
  const setTabBarVisibility = useTabBarStore((state) => state.setTabBarVisible);
  const inboxStore = useInboxStore();
  const inputRef = useRef<TextInput>(null);
  const [sendButtonScale] = useState(new Animated.Value(1));
  const [newMessage, setNewMessage] = useState<string>(''); // Explicitly typed as string
  const [sendingAnimation] = useState(new Animated.Value(0));
  const [messageOpacity] = useState(new Animated.Value(1));
  const [isSending, setIsSending] = useState(false);
  const [showMeme, setShowMeme] = useState(!!memeId);
  const [isMemeFullscreenVisible, setIsMemeFullscreenVisible] = useState(false);
  
  // Updated State: Exclude null, use undefined instead
  const [fullscreenMemeUrl, setFullscreenMemeUrl] = useState<string | undefined>(undefined);
  const [fullscreenMediaType, setFullscreenMediaType] = useState<'image' | 'video'>('image');

  const sendIcon = isSending ? faCheck : faArrowUp;

  const { data: messages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const storedMessages = inboxStore.getConversationMessages(conversation.id);
      if (storedMessages && storedMessages.length > 0) {
        console.log('Using messages from InboxStore:', storedMessages.length);
        return storedMessages;
      }
      const fetchedMessages = await fetchMessages(currentUser.email, conversation.id);
      
      // Sort messages descendingly (newest first)
      fetchedMessages.sort((a: Message, b: Message) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());

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
    }, [setTabBarVisibility, conversation.id, memeId])
  );

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

      queryClient.setQueryData(['messages', conversation.id], (old: Message[] | undefined) => [
        ...(old || []),
        newMsg,
      ]);

      const existingConversation = inboxStore.conversations.find(
        (conv) => conv.id === conversation.id
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
    await badgeStore.checkMessengerBadge(currentUser.email);
    Animated.sequence([
      Animated.timing(sendingAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sendingAnimation, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      sendingAnimation.setValue(0);
      setIsSending(false); // Sending complete
    });

    Animated.timing(messageOpacity, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();

    sendMessageMutation.mutate({
      senderEmail: currentUser.email!,
      receiverEmail: partnerUser.email!,
      content: newMessage, // Now a string
    }, {
      onSuccess: () => {
        setIsSending(false); // Ensure isSending is reset
      },
      onError: () => {
        setIsSending(false); // Reset on error as well
      }
    });

    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [newMessage, currentUser.email, partnerUser.email, sendingAnimation, messageOpacity, sendMessageMutation, badgeStore]);

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

  const handleSendMeme = useCallback(() => {
    if (!memeId) {
      console.log("No memeId available, cannot send meme");
      return;
    }
  
    setIsSending(true); // Start sending

    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
    const memeContent: MemeShareContent = {
      type: 'meme_share',
      memeID: memeId,
      message: newMessage || 'Shared a meme'
    };
  
    sendMessageMutation.mutate({
      senderEmail: currentUser.email!,
      receiverEmail: partnerUser.email!,
      content: JSON.stringify(memeContent)
    }, {
      onSuccess: () => {
        setShowMeme(false);
        setNewMessage('');
        badgeStore.incrementShareCount(currentUser.email); // Pass userEmail here
        setIsSending(false); 
        setMemeId(undefined); // Set to undefined instead of null

        // Reset memeId after a short delay to allow re-selection
        setTimeout(() => {
          setMemeId(route.params?.currentMedia); // Assuming currentMedia holds the meme ID
          setShowMeme(!!route.params?.currentMedia);
        }, 500);

        navigation.navigate('Feed' as never);
        Toast.show({
          type: 'success',
          text1: 'Meme sent successfully',
          autoHide: true,
          visibilityTime: 2000,
        });

        // Haptic Feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        setIsSending(false); 

        // Haptic Feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    });

  }, [memeId, newMessage, currentUser.email, partnerUser.email, sendMessageMutation, navigation, badgeStore, route.params?.currentMedia]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      const { Content } = item;

      if (typeof Content === 'string') {
        let content = Content;
        let isMemeShare = false;
        let memeUrl = '';
        let mediaType: 'image' | 'video' = 'image';

        if (Content.trim().startsWith('{')) {
          try {
            const parsedContent = JSON.parse(Content);
            if (parsedContent.type === 'meme_share') {
              content = parsedContent.message || 'Shared a meme';
              isMemeShare = true;
              memeUrl = parsedContent.memeID.startsWith('http') 
                ? parsedContent.memeID 
                : `https://jestr-bucket.s3.amazonaws.com/${parsedContent.memeID}`;
              mediaType = parsedContent.mediaType || 'image';
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
            ]}
          >
            {isMemeShare && (
              <TouchableOpacity
                onPress={() => {
                  setFullscreenMemeUrl(memeUrl);
                  setFullscreenMediaType(mediaType);
                  setIsMemeFullscreenVisible(true);
                }}
              >
                <Image
                  source={memeUrl ? { uri: memeUrl } : undefined} // Ensure uri is string or undefined
                  style={styles.sharedMemeImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            <Text style={styles.messageText}>{content}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.Timestamp)}</Text>
          </View>
        );
      } else if (isMemeShareContent(Content)) {
        const memeUrl = Content.memeID.startsWith('http') 
          ? Content.memeID 
          : `https://jestr-bucket.s3.amazonaws.com/${Content.memeID}`;
        const mediaType = Content.mediaType || 'image';

        return (
          <View
            style={[
              styles.messageBubble,
              item.SenderID === currentUser.email
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setFullscreenMemeUrl(memeUrl);
                setFullscreenMediaType(mediaType);
                setIsMemeFullscreenVisible(true);
              }}
            >
              <Image
                source={memeUrl ? { uri: memeUrl } : undefined} // Ensure uri is string or undefined
                style={styles.sharedMemeImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.messageText}>{Content.message || 'Shared a meme'}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.Timestamp)}</Text>
          </View>
        );
      } else {
        return (
          <View
            style={[
              styles.messageBubble,
              item.SenderID === currentUser.email
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>Unsupported content</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.Timestamp)}</Text>
          </View>
        );
      }
    },
    [currentUser.email, formatTimestamp],
  );

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
      return <Text style={styles.errorText}>Error loading messages: {error.message}</Text>;
    }

    return (
      <>
        <FlashList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.MessageID}
          // Remove inverted prop to fix message ordering
          // inverted={true} 
          estimatedItemSize={79}
          contentContainerStyle={{ paddingBottom: showMeme ? 100 : 10 }} // Adjust paddingBottom when not inverted
        />
        {showMeme && (
          <View style={styles.memeContainer}>
            <Image
              source={memeId ? { uri: memeId } : undefined} // Ensure uri is string or undefined
              style={styles.memeImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeMemeButton}
              onPress={() => {
                console.log("Closing meme preview");
                setShowMeme(false);
                setMemeId(undefined); // Reset memeId when closing
              }}
            >
              <FontAwesomeIcon icon={faTimes} size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }, [isLoading, error, messages, showMeme, memeId, renderMessage]);

  // PanResponder for swipe to close fullscreen meme
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const swipeThreshold = 50; // Minimum distance for a swipe

      if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
        setIsMemeFullscreenVisible(false);
      }
    },
  }), []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={{ flex: 1 }}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
              // Haptic Feedback
              Haptics.selectionAsync();
            }}
            style={styles.backButton}
          >
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
              console.log("Send button pressed. ShowMeme:", showMeme);
              showMeme ? handleSendMeme() : handleSendMessage();
            }}
            disabled={isSending}
          >
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <FontAwesomeIcon icon={sendIcon} size={24} color="white" />
              )}
            </Animated.View>
          </TouchableOpacity>

        </View>

        {/* Fullscreen Meme Modal */}
        {isMemeFullscreenVisible && (
          <Modal
            visible={isMemeFullscreenVisible}
            transparent={true}
            onRequestClose={() => setIsMemeFullscreenVisible(false)}
          >
            <View style={styles.fullscreenMemeContainer} {...panResponder.panHandlers}>
              <TouchableOpacity
                style={styles.fullscreenMemeCloseButton}
                onPress={() => setIsMemeFullscreenVisible(false)}
              >
                <FontAwesomeIcon icon={faTimes} size={30} color="#FFF" />
              </TouchableOpacity>
              {fullscreenMediaType === 'image' ? (
                <Image
                  source={fullscreenMemeUrl ? { uri: fullscreenMemeUrl } : undefined} // Ensure uri is string or undefined
                  style={styles.fullscreenMemeImage}
                  resizeMode={ResizeMode.CONTAIN}
                />
              ) : (
                <Video
                  source={fullscreenMemeUrl ? { uri: fullscreenMemeUrl } : undefined} // Ensure uri is string or undefined
                  style={styles.fullscreenMemeVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              )}
            </View>
          </Modal>
        )}

      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversations;
