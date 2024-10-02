// src/screens/AppNav/Inbox/Inbox.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {  View,  Text,  Image,  TextInput,  TouchableOpacity,  Animated, KeyboardAvoidingView,  Platform,} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faBell, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { Conversation, User, MessageContent } from '../../../types/types';
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
import { BUCKET_NAME } from '../../../services/config';
import { isMemeShareContent } from '../../../utils/typeGuards';

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

  const {
    conversations,
    isLoading: isStoreLoading,
    fetchConversations,
    pinConversation,
    unpinConversation,
    deleteConversation,
    pinnedConversations,
  } = useInboxStore();

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
    enabled: false, 
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
          // Optionally handle subsequent focus events
        }
      }
    }, [user.email, refetchConversations, fetchConversations, conversations.length])
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.rowFront}
      onPress={() => handleThreadClick(item, user, navigation)}
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
        {/* Use MessagePreview to handle Content rendering */}
        <MessagePreview content={item.lastMessage.Content} />
        <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.Timestamp)}</Text>
      </View>
      {item.UnreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCountText}>{item.UnreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const MessagePreview: React.FC<{ content: MessageContent }> = ({ content }) => {
    if (typeof content === 'string') {
      return <Text style={styles.preview}>{content}</Text>;
    } else if (isMemeShareContent(content)) {
      return (
        <>
          <Text style={styles.preview}>{content.message}</Text>
          <Image 
            source={{ uri: `${BUCKET_NAME}/${content.memeID}` }}
            style={styles.memeThumbnail} 
            resizeMode="cover" 
          />
        </>
      );
    } else {
      return <Text style={styles.preview}>Unknown message type</Text>;
    }
  };

  const renderHiddenItem = (
    { item }: { item: Conversation },
    rowMap: RowMap<Conversation>
  ) => (
    <View style={styles.rowBack}>
      {pinnedConversations.some((conv) => conv.id === item.id) ? (
        <TouchableOpacity
          style={styles.backLeftBtn}
          onPress={() => handleUnpinConversation(item.id, rowMap, unpinConversation)}
        >
          <FontAwesomeIcon icon={faThumbtack} size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.backLeftBtn}
          onPress={() => handlePinConversation(item.id, rowMap, pinConversation)}
        >
          <FontAwesomeIcon icon={faThumbtack} size={24} color="orange" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.backRightBtn}
        onPress={() => handleDeleteConversation(item.id, rowMap, deleteConversation)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleNewMessageModal = () => {
    toggleNewMessageModalHandler(isNewMessageModalVisible, setIsNewMessageModalVisible);
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
          { opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#1E1E1E' },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.sectionHeaderIn}>Inbox</Text>
          {user && (
            <TouchableOpacity onPress={() => handleProfileClick(drawerNavigation)}>
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
          onSelectUser={(selectedUser: User) =>
            handleUserSelect(selectedUser, user, navigation, toggleNewMessageModal, generateUniqueId)
          }
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
          allUsers={[]} // Populate this appropriately if needed
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default Inbox;
