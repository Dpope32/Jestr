import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View,Text,Image,TextInput,TouchableOpacity,Animated,ScrollView,} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faBell} from '@fortawesome/free-solid-svg-icons';
import {Conversation, User} from '../../../types/types';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

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
import {useQuery} from '@tanstack/react-query';

type InboxProps = {navigation: any;};

const Inbox: React.FC<InboxProps> = () => {
  const navigation = useNavigation<InboxNavProp>();
  const drawerNavigation = useNavigation<AppNavProp>();
  const {isDarkMode} = useTheme();
  const user = useUserStore(state => state);
  const isInitialMount = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] =useState(false);
  const [notifications] = useState<string[]>(['New follower: @Admin']);
  const {conversations,isLoading: isStoreLoading,fetchConversations,} = useInboxStore();

  const {
    refetch: refetchConversations, isLoading: isServerLoading, error} = useQuery({
    queryKey: ['conversations', user.email],
    queryFn: () => apiFetchConversations(user.email),
    enabled: false, // Disable automatic fetching
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1,duration: 500,useNativeDriver: true,}).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user.email) {
        if (isInitialMount.current) {
          refetchConversations().then(result => {
            if (result.data) {
              fetchConversations(user.email);
              console.log('Fetched fresh data from server on initial load');
            }
          });
          isInitialMount.current = false;
        } else {
          // Use data from InboxStore for subsequent accesses
          console.log(
            'Using conversations from InboxStore:',
            conversations.length,
          );
        }}}, 
    [user.email,refetchConversations,fetchConversations,conversations.length])
  );

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
            typeof selectedUser.profilePic === 'string'
              ? selectedUser.profilePic
              : null,
        },
      },
    });
  };

  const SkeletonLoader = () => {
    const skeletons = Array.from({length: 5});
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
    <View style={{flex: 1}}>
      <Animated.View style={[styles.container,{opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#2E2E2E'}]}>

        <View style={styles.header}>
          <Text style={styles.sectionHeaderIn}>Inbox</Text>
          {user && (
            <TouchableOpacity onPress={handleProfileClick}>
              <Image source={{uri: typeof user.profilePic === 'string' ? user.profilePic: user.profilePic?.uri || undefined}}style={styles.profilePic}/>
            </TouchableOpacity>)}
         </View>

        <ScrollView>
          <TextInput style={styles.searchBar} placeholder="Search messages" value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#999"/>
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

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>All Conversations</Text>
            {isStoreLoading || isServerLoading ? (
              <SkeletonLoader />
            ) : error ? (
              <Text>Error loading conversations</Text>
            ) : (
              conversations.map((conversation: Conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  style={styles.conversationItem}
                  onPress={() => handleThreadClick(conversation)}>
                  <Image source={{uri: conversation.partnerUser.profilePic || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg'}}style={styles.profilePic}/>
                  <View style={styles.conversationInfo}>
                    <Text style={styles.username}>
                      {conversation.partnerUser.username || conversation.partnerUser.email}
                    </Text>
                    <Text style={styles.preview}>
                      {conversation.lastMessage.Content}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(conversation.lastMessage.Timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={toggleNewMessageModal}>
          <FontAwesomeIcon icon={faPlus} size={20} color="#FFF" />
        </TouchableOpacity>

        <NewMessageModal
          isVisible={isNewMessageModalVisible}
          onClose={toggleNewMessageModal}
          onSelectUser={handleUserSelect}
          existingConversations={conversations}
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
    </View>
  );
};

export default Inbox;
