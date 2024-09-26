import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Animated, Alert, KeyboardAvoidingView, Platform,} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faBell, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { Conversation, User } from '../../../types/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SwipeListView, RowMap } from 'react-native-swipe-list-view';
import { useQuery } from '@tanstack/react-query';

import styles from './Inbox.styles';
import NewMessageModal from '../../../components/Modals/NewMessageModal';
import { formatTimestamp } from '../../../utils/dateUtils';
import { generateUniqueId } from '../../../utils/helpers';
import { useTheme } from '../../../theme/ThemeContext';
import { useUserStore } from '../../../stores/userStore';
import { useInboxStore } from '../../../stores/inboxStore';
import { fetchConversations as apiFetchConversations } from '../../../services/socialService';
import { InboxNavProp } from '../../../navigation/NavTypes/InboxStackTypes';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import Toast from 'react-native-toast-message';

// Default profile picture URL
const DEFAULT_PROFILE_PIC_URL = 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg';

type InboxProps = {};

const Inbox: React.FC<InboxProps> = () => {
  const navigation = useNavigation<InboxNavProp>();
  const drawerNavigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const user = useUserStore((state) => state);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const [notifications] = useState<string[]>(['New follower: @Admin']);

  const {
    conversations,
    isLoading: isStoreLoading,
    fetchConversations,
    pinConversation,
    unpinConversation,
    deleteConversation,
    pinnedConversations,
  } = useInboxStore();

  // Exclude pinned conversations from the conversations list
  const filteredConversations = conversations.filter(
    (conv) => !pinnedConversations.some((pinnedConv) => pinnedConv.id === conv.id)
  );

  const {
    refetch: refetchConversations,
    isLoading: isServerLoading,
    error,
  } = useQuery({
    queryKey: ['conversations', user.email],
    queryFn: () => apiFetchConversations(user.email),
    enabled: false, // Disable automatic fetching
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user.email) {
        if (isInitialMount.current) {
          refetchConversations().then((result) => {
            if (result.data) {
              fetchConversations(user.email);
              console.log('Fetched fresh data from server on initial load');
            }
          });
          isInitialMount.current = false;
        } else {
          // Use data from InboxStore for subsequent accesses
          console.log('Using conversations from InboxStore:', conversations.length);
        }
      }
    }, [user.email, refetchConversations, fetchConversations, conversations.length])
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.rowFront}
      onPress={() => handleThreadClick(item)}
    >
      <Image
        source={{
          uri:
            item.partnerUser.profilePic && item.partnerUser.profilePic.trim() !== ''
              ? item.partnerUser.profilePic
              : DEFAULT_PROFILE_PIC_URL,
        }}
        style={styles.profilePic}
      />
      <View style={styles.conversationInfo}>
        <View style={styles.nameAndPin}>
          <Text style={styles.username}>{item.partnerUser.username}</Text>
          {pinnedConversations.some((conv) => conv.id === item.id) && (
            <FontAwesomeIcon icon={faThumbtack} size={16} color="orange" style={styles.pinIcon} />
          )}
        </View>
        <Text style={styles.preview}>{item.lastMessage.Content}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.Timestamp)}</Text>
      </View>
      {item.UnreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCountText}>{item.UnreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHiddenItem = (
    { item }: { item: Conversation },
    rowMap: RowMap<Conversation>
  ) => (
    <View style={styles.rowBack}>
      {pinnedConversations.some((conv) => conv.id === item.id) ? (
        <TouchableOpacity
          style={styles.backLeftBtn}
          onPress={() => handleUnpinConversation(item.id, rowMap)}
        >
          <FontAwesomeIcon icon={faThumbtack} size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.backLeftBtn}
          onPress={() => handlePinConversation(item.id, rowMap)}
        >
          <FontAwesomeIcon icon={faThumbtack} size={24} color="orange" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.backRightBtn}
        onPress={() => handleDeleteConversation(item.id, rowMap)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const closeRow = (rowMap: RowMap<Conversation>, rowKey: string) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const handlePinConversation = (conversationId: string, rowMap: RowMap<Conversation>) => {
    pinConversation(conversationId);
    closeRow(rowMap, conversationId);
    Toast.show({
      type: 'success',
      text1: 'Conversation pinned',
      position: 'top',
      visibilityTime: 1500,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const handleUnpinConversation = (conversationId: string, rowMap: RowMap<Conversation>) => {
    unpinConversation(conversationId);
    closeRow(rowMap, conversationId);
    Toast.show({
      type: 'success',
      text1: 'Conversation unpinned',
      position: 'top',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const handleDeleteConversation = (conversationId: string, rowMap: RowMap<Conversation>) => {
    closeRow(rowMap, conversationId);
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            deleteConversation(conversationId);
            Toast.show({
              type: 'success',
              text1: 'Conversation deleted',
              position: 'bottom',
              visibilityTime: 2000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40,
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleNewMessageModal = () => {
    setIsNewMessageModalVisible(!isNewMessageModalVisible);
  };

  const handleThreadClick = (conversation: Conversation) => {
    if (!user.email) {
      console.error('User is not logged in');
      return;
    }
    navigation.navigate('Conversations', {
      partnerUser: {
        email: conversation.userEmail,
        username: conversation.username,
        profilePic: conversation.profilePicUrl,
        headerPic: null,
        displayName: '',
        CreationDate: '',
        followersCount: 0,
        followingCount: 0,
      },
      conversation: conversation,
    });
  };

  const handleProfileClick = () => {
    try {
      drawerNavigation.navigate('Profile');
    } catch (error) {
      console.error('Error navigating to Profile from INBOX:', error);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    if (!user.email) {
      console.error('User is not logged in');
      return;
    }

    toggleNewMessageModal();
    const conversationID = generateUniqueId();
    navigation.navigate('Conversations', {
      partnerUser: selectedUser,
      conversation: {
        id: conversationID,
        ConversationID: conversationID,
        userEmail: selectedUser.email,
        username: selectedUser.username,
        profilePicUrl: selectedUser.profilePic,
        lastMessage: {
          Content: '',
          Timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        messages: [],
        UnreadCount: 0,
        LastReadMessageID: '',
        partnerUser: {
          email: selectedUser.email,
          username: selectedUser.username,
          profilePic:
            typeof selectedUser.profilePic === 'string' && selectedUser.profilePic.trim() !== ''
              ? selectedUser.profilePic
              : DEFAULT_PROFILE_PIC_URL,
        },
      },
    });
  };

  const SkeletonLoader = () => {
    const skeletons = Array.from({ length: 5 });
    return (
      <View>
        {skeletons.map((_, index) => (
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
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#2E2E2E' },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.sectionHeaderIn}>Inbox</Text>
          {user && (
            <TouchableOpacity onPress={handleProfileClick}>
              <Image
                source={{
                  uri:
                    typeof user.profilePic === 'string' && user.profilePic.trim() !== ''
                      ? user.profilePic
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
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Notifications</Text>
              {notifications.map((notification, index) => (
                <TouchableOpacity key={index} style={styles.notificationItem}>
                  <FontAwesomeIcon
                    icon={faBell}
                    size={20}
                    color="#00ff00"
                    style={styles.notificationIcon}
                  />
                  <Text style={styles.notificationText}>{notification}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isStoreLoading || isServerLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <Text>Error loading conversations</Text>
        ) : (
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
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80 }}
              />
            </View>
          </>
        )}

        <TouchableOpacity style={styles.newMessageButton} onPress={toggleNewMessageModal}>
          <FontAwesomeIcon icon={faPlus} size={20} color="#FFF" />
        </TouchableOpacity>

        <NewMessageModal
          isVisible={isNewMessageModalVisible}
          onClose={toggleNewMessageModal}
          onSelectUser={handleUserSelect}
          existingConversations={[...conversations, ...pinnedConversations]}
          currentUser={
            user || {
              email: '',
              username: '',
              profilePic: '',
              displayName: '',
              headerPic: '',
              CreationDate: '',
              followersCount: 0,
              followingCount: 0,
            }
          }
          allUsers={[]}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default Inbox;
