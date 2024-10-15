// src/screens/AppNav/Inbox/Inbox.tsx

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../../types/types';
import { Conversation, MessageContent, MemeShareContent } from '../../../types/messageTypes';
import {
  useFocusEffect,
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';
import { useQuery } from '@tanstack/react-query';

import styles from './Inbox.styles';
import NewMessageModal from '../../../components/Modals/NewMessageModal';
import { formatTimestamp } from '../../../utils/dateUtils';
import { generateUniqueId } from '../../../utils/helpers';
import { useTheme } from '../../../theme/ThemeContext';
import { useUserStore } from '../../../stores/userStore';
import { useInboxStore } from '../../../stores/inboxStore';
import { fetchConversations as apiFetchConversations } from '../../../services/inboxServices';
import { InboxNavProp } from '../../../navigation/NavTypes/InboxStackTypes';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import {
  handleThreadClick,
  handleProfileClick,
  handleUserSelect,
  handlePinConversation,
  handleUnpinConversation,
  handleDeleteConversation,
  toggleNewMessageModalHandler,
} from './inboxHandlers';
import { DEFAULT_PROFILE_PIC_URL } from '../../../constants/uiConstants';

const Inbox: React.FC = () => {
  const navigation = useNavigation<InboxNavProp>();
  const drawerNavigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const user = useUserStore(state => state);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);

  const {
    conversations,
    isLoading: isStoreLoading,
    fetchConversations,
    pinConversation,
    unpinConversation,
    deleteConversation,
    pinnedConversations,
  } = useInboxStore();

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        conv =>
          !pinnedConversations.some(pinnedConv => pinnedConv.id === conv.id),
      ),
    [conversations, pinnedConversations],
  );

  const {
    refetch: refetchConversations,
    isLoading: isServerLoading,
    error,
  } = useQuery({
    queryKey: ['conversations', user.email],
    queryFn: () => apiFetchConversations(user.email),
    enabled: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      console.log('Inbox screen focused');

      if (user.email && isInitialMount.current) {
        refetchConversations().then(result => {
          if (result.data) {
            fetchConversations(user.email);
            console.log('Fetched fresh data from server on initial load');
          }
        });
        isInitialMount.current = false;
      }

      return () => {
        console.log('Inbox screen unfocused');
      };
    }, [navigation, user.email, refetchConversations, fetchConversations]),
  );

  const MessagePreview = useCallback(({ content }: { content: MessageContent }) => {
    const renderMemeShare = (memeContent: MemeShareContent) => {
      const memeUrl = memeContent.memeID.startsWith('http')
        ? memeContent.memeID
        : `https://jestr-bucket.s3.amazonaws.com/${memeContent.memeID}`;
  
      console.log('Rendering meme share content:', memeContent);
  
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.preview}>{memeContent.message || 'Shared a meme'}</Text>
          <Image
            source={{ uri: memeUrl }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
              marginTop: -20,
              marginLeft: 20,
            }}
          />
        </View>
      );
    };
  
    if (typeof content === 'string') {
      return <Text style={styles.preview}>{content}</Text>;
    } else if (typeof content === 'object') {
      if (content.type === 'meme_share') {
        return renderMemeShare(content);
      } else if (content.type === 'text') {
        return <Text style={styles.preview}>{content.message}</Text>;
      }
    }
  
    console.warn('Unknown message content type:', content);
    return <Text style={styles.preview}>Unknown message type</Text>;
  }, []);
  /**
   * Renders each conversation item in the SwipeListView.
   */
  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const isPinned = pinnedConversations.some(conv => conv.id === item.id);
      const lastMessageTimestamp = item.lastMessage?.Timestamp || '';
  
      // Ensure lastMessage.Content is properly parsed if it's a string
      const lastMessageContent = typeof item.lastMessage.Content === 'string' 
        ? JSON.parse(item.lastMessage.Content) 
        : item.lastMessage.Content;
  
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.rowFront, isPinned && styles.pinnedConversation]}
          onPress={() => handleThreadClick(item, user, navigation)}>
          <Image
            source={{
              uri:
                item.partnerUser.profilePic?.trim() || DEFAULT_PROFILE_PIC_URL,
            }}
            style={styles.profilePic}
          />
          <View style={styles.conversationInfo}>
            <View style={styles.nameAndPin}>
              <Text style={styles.username}>{item.partnerUser.username}</Text>
              {isPinned && (
                <FontAwesomeIcon
                  icon={faThumbtack}
                  size={16}
                  color="orange"
                  style={styles.pinIcon}
                />
              )}
            </View>
            <MessagePreview content={lastMessageContent} />
            <Text style={styles.timestamp}>
              {formatTimestamp(lastMessageTimestamp) || 'N/A'}
            </Text>
          </View>
          {item.UnreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>{item.UnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [pinnedConversations, user, navigation, MessagePreview],
  );
  /**
   * Renders the hidden item (for swipe actions) in the SwipeListView.
   */
  const renderHiddenItem = useCallback(
    ({ item }: { item: Conversation }, rowMap: RowMap<Conversation>) => {
      const isPinned = pinnedConversations.some(conv => conv.id === item.id);
      return (
        <View style={styles.rowBack}>
          <TouchableOpacity
            style={styles.backLeftBtn}
            onPress={() =>
              isPinned
                ? handleUnpinConversation(item.id, rowMap, unpinConversation)
                : handlePinConversation(item.id, rowMap, pinConversation)
            }>
            <FontAwesomeIcon
              icon={faThumbtack}
              size={24}
              color={isPinned ? 'white' : 'orange'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backRightBtn}
            onPress={() =>
              handleDeleteConversation(item.id, rowMap, deleteConversation)
            }>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [
      pinnedConversations,
      unpinConversation,
      pinConversation,
      deleteConversation,
    ],
  );

  /**
   * Toggles the visibility of the New Message Modal.
   */
  const toggleNewMessageModal = useCallback(() => {
    toggleNewMessageModalHandler(
      isNewMessageModalVisible,
      setIsNewMessageModalVisible,
    );
  }, [isNewMessageModalVisible]);

  /**
   * SkeletonLoader Component
   * Displays a loading skeleton while conversations are being fetched.
   */
  const SkeletonLoader = () => (
    <View>
      {Array.from({ length: 1 }).map((_, index) => (
        <View key={index} style={styles.skeletonContainer}>
          <View style={styles.skeletonProfilePic} />
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonText} />
            <View style={styles.skeletonTextShort} />
          </View>
        </View>
      ))}
    </View>
  );

  /**
   * Determines the content to display based on the loading and error states.
   */
  const content = useMemo(() => {
    if (isStoreLoading || isServerLoading) {
      return <SkeletonLoader />;
    }
    if (error) {
      console.error('Error loading conversations:', error);
      return <Text>Error loading conversations</Text>;
    }
    return (
      <>
        {pinnedConversations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Pinned Messages</Text>
            <SwipeListView
              data={pinnedConversations}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              leftOpenValue={75}
              rightOpenValue={-75}
              disableLeftSwipe={false}
              disableRightSwipe={false}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>All Conversations</Text>
          <SwipeListView
            data={filteredConversations}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            leftOpenValue={75}
            rightOpenValue={-75}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </View>
      </>
    );
  }, [
    isStoreLoading,
    isServerLoading,
    error,
    pinnedConversations,
    filteredConversations,
    renderItem,
    renderHiddenItem,
  ]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#1E1E1E' },
        ]}>
        <View style={styles.header}>
          <Text style={styles.sectionHeaderIn}>Inbox</Text>
          {user && (
            <TouchableOpacity
              onPress={() => handleProfileClick(drawerNavigation)}>
              <Image
                source={{
                  uri:
                    typeof user.profilePic === 'string' &&
                    user.profilePic.trim() !== ''
                      ? user.profilePic.trim()
                      : DEFAULT_PROFILE_PIC_URL,
                }}
                style={styles.profilePic}
              />
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="Search messages"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

        {content}

        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={toggleNewMessageModal}>
          <FontAwesomeIcon icon={faPlus} size={20} color="#FFF" />
        </TouchableOpacity>

        <NewMessageModal
          isVisible={isNewMessageModalVisible}
          onClose={toggleNewMessageModal}
          onSelectUser={(selectedUser: User) =>
            handleUserSelect(
              selectedUser,
              user,
              navigation,
              toggleNewMessageModal,
              generateUniqueId,
            )
          }
          existingConversations={[...conversations, ...pinnedConversations]}
          currentUser={user}
          allUsers={[]}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default Inbox;
