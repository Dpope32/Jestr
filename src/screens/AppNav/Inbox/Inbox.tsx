import React, {useState, useCallback, useEffect, useRef, useMemo} from 'react';
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
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faThumbtack} from '@fortawesome/free-solid-svg-icons';
import {User} from '../../../types/types';
import {Conversation, MessageContent} from '../../../types/messageTypes';
import {
  useFocusEffect,
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import {SwipeListView, RowMap} from 'react-native-swipe-list-view';
import {useQuery} from '@tanstack/react-query';

import styles from './Inbox.styles';
import NewMessageModal from '../../../components/Modals/NewMessageModal';
import {formatTimestamp} from '../../../utils/dateUtils';
import {generateUniqueId} from '../../../utils/helpers';
import {useTheme} from '../../../theme/ThemeContext';
import {useUserStore} from '../../../stores/userStore';
import {useInboxStore} from '../../../stores/inboxStore';
import {fetchConversations as apiFetchConversations} from '../../../services/socialService';
import {InboxNavProp} from '../../../navigation/NavTypes/InboxStackTypes';
import {AppNavProp} from '../../../navigation/NavTypes/RootNavTypes';
import {isMemeShareContent} from '../../../utils/typeGuards';
import {
  handleThreadClick,
  handleProfileClick,
  handleUserSelect,
  handlePinConversation,
  handleUnpinConversation,
  handleDeleteConversation,
  toggleNewMessageModalHandler,
} from './inboxHandlers';
import {DEFAULT_PROFILE_PIC_URL} from '../../../constants/uiConstants';

const Inbox: React.FC = () => {
  const navigation = useNavigation<InboxNavProp>();
  const drawerNavigation = useNavigation<AppNavProp>();
  const {isDarkMode} = useTheme();
  const user = useUserStore(state => state);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] =
    useState(false);

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

      // const unsubscribe = navigation.addListener('focus', () => {
      //   // Reset the navigation state to the Inbox when focused
      //   navigation.dispatch(
      //     CommonActions.reset({
      //       index: 0,
      //       routes: [{ name: 'Inbox' }],
      //     })
      //   );
      // });

      return () => {
        console.log('Inbox screen unfocused');
        // unsubscribe();
      };
    }, [navigation, user.email, refetchConversations, fetchConversations]),
  );

  const MessagePreview = useCallback(({content}: {content: MessageContent}) => {
    if (typeof content === 'string') {
      try {
        const parsedContent = JSON.parse(content);
        if (isMemeShareContent(parsedContent)) {
          const memeUrl = parsedContent.memeID.startsWith('http')
            ? parsedContent.memeID
            : `https://jestr-bucket.s3.amazonaws.com/${parsedContent.memeID}`;

          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.preview}>{parsedContent.message}</Text>
              <Image
                source={{uri: memeUrl}}
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
        }
      } catch (e) {
        // If parsing fails, it's not a JSON string, so we keep the original content
      }
      return <Text style={styles.preview}>{content}</Text>;
    } else if (isMemeShareContent(content)) {
      const memeUrl = content.memeID.startsWith('http')
        ? content.memeID
        : `https://jestr-bucket.s3.amazonaws.com/${content.memeID}`;

      return (
        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
          <Image
            source={{uri: memeUrl}}
            style={{width: 10, height: 10, borderRadius: 5, marginRight: 5}}
          />
          <Text style={styles.preview}>{content.message}</Text>
        </View>
      );
    } else {
      return <Text style={styles.preview}>Unknown message type</Text>;
    }
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Conversation}) => {
      const isPinned = pinnedConversations.some(conv => conv.id === item.id);
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
            <MessagePreview content={item.lastMessage.Content} />
            <Text style={styles.timestamp}>
              {formatTimestamp(item?.lastMessage?.Timestamp) || 'N/A'}
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

  const renderHiddenItem = useCallback(
    ({item}: {item: Conversation}, rowMap: RowMap<Conversation>) => {
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

  const toggleNewMessageModal = useCallback(() => {
    toggleNewMessageModalHandler(
      isNewMessageModalVisible,
      setIsNewMessageModalVisible,
    );
  }, [isNewMessageModalVisible]);

  const SkeletonLoader = () => (
    <View>
      {Array.from({length: 1}).map((_, index) => (
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

  const content = useMemo(() => {
    if (isStoreLoading || isServerLoading) {
      return <SkeletonLoader />;
    }
    if (error) {
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
              contentContainerStyle={{paddingBottom: 10}}
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
            contentContainerStyle={{paddingBottom: 80}}
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
      style={{flex: 1}}
      behavior={Platform.select({ios: 'padding', android: undefined})}>
      <Animated.View
        style={[
          styles.container,
          {opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#1E1E1E'},
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
