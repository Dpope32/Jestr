import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faBell } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/types'; 
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import NewMessageModal from '../../components/Modals/NewMessageModal';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Conversation } from './Conversations';
import styles from './Inbox.styles';
import { Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useUserStore } from 'utils/userStore';
import BottomPanel from '../../components/Panels/BottomPanel'; 
import { useInboxStore } from './inboxStore';

const windowWidth = Dimensions.get('window').width;

type RootStackParamList = {
  Feed: undefined;
  MemeUpload: undefined;
  Inbox: undefined;
  Profile: { user: User };
  Conversations: { 
    localUser: User;
    partnerUser: User;
    conversation: Conversation;
  };
};


const Inbox: React.FC<{ route: any }> = ({ route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = route.params || {};
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Inbox'>>();
  const { conversations, isLoading, fetchConversations } = useInboxStore();
  const { isDarkMode } = useTheme();
  const [pinnedConversations, setPinnedConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const setDarkMode = useUserStore((state) => state.setDarkMode);

  const toggleNewMessageModal = () => {
    setIsNewMessageModalVisible(!isNewMessageModalVisible);
  };

  const fetchNotifications = () => {
    setNotifications(['New follower: @Admin']);
  };

  const handleThreadClick = (conversation: Conversation) => {
    if (localUser) {
      navigation.navigate('Conversations', {
        localUser: localUser,
        partnerUser: {
          email: conversation.userEmail,
          username: conversation.username,
          profilePic: conversation.profilePicUrl,
          headerPic: null,
          displayName: '',
          CreationDate: '',
          followersCount: 0,
          followingCount: 0
        },
        conversation: conversation
      });
    }
  };

  const handleProfileClick = () => {
    if (localUser) {
      navigation.navigate('Profile', { user: localUser });
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

 // const handlePin = (id: string) => {
 //   const conversationToPin = conversations.find(conv => conv.id === id);
 //   if (conversationToPin) {
 //     setPinnedConversations([...pinnedConversations, conversationToPin]);
 //     setConversations(conversations.filter(conv => conv.id !== id));
 //   }
//  };



  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const generateUniqueId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleUserSelect = (selectedUser: User) => {
    toggleNewMessageModal();
    const conversationID = generateUniqueId();
    if (localUser) {
      navigation.navigate('Conversations', {
        localUser: localUser,
        partnerUser: selectedUser,
        conversation: {
          id: conversationID,
          ConversationID: conversationID,
          userEmail: selectedUser.email,
          username: selectedUser.username,
          profilePicUrl: selectedUser.profilePic,
          lastMessage: {
            Content: '',
            Timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          messages: [],
          UnreadCount: 0,
          LastReadMessageID: '',
          partnerUser: {
            email: selectedUser.email,
            username: selectedUser.username,
            profilePic: typeof selectedUser.profilePic === 'string' ? selectedUser.profilePic : null // Ensure it's string or null
          }
        }
      });
    }
  };

  const loadConversations = useCallback(async () => {
    if (localUser) {
      await fetchConversations(localUser.email);
    }
  }, [localUser, fetchConversations]);

  useEffect(() => {
    loadConversations();
    fetchNotifications();
  }, [loadConversations]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );


 const getMessagePreview = (content: string) => {
    if (typeof content !== 'string') {
      return 'Unable to display message';
    }
    if (content.trim().startsWith('{')) {
      try {
        const parsedContent = JSON.parse(content);
        if (parsedContent.type === 'meme_share') {
          return parsedContent.message || 'Shared a meme';
        }
      } catch (e) {}
    }
    return content.length > 50 ? content.substring(0, 47) + '...' : content;
  };

  const SkeletonLoader = () => {
    const skeletons = Array.from({ length: 5 }); // Number of skeleton items
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
    <View style={{ flex: 1 }}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#2E2E2E' }]}>
        <View style={styles.header}>
          <Text style={styles.sectionHeaderIn}>Inbox</Text>
          {localUser && (
            <TouchableOpacity onPress={handleProfileClick}>
              <Image
                source={{
                  uri:
                    typeof localUser.profilePic === 'string'
                      ? localUser.profilePic
                      : localUser.profilePic?.uri || undefined,
                }}
                style={styles.profilePic}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView>
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
              <TouchableOpacity 
                key={index} 
                style={styles.notificationItem}
              >
                <FontAwesomeIcon icon={faBell} size={20} color="#00ff00" style={styles.notificationIcon} />
                <Text style={styles.notificationText}>{notification}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
          <Text style={styles.sectionHeader}>All Conversations</Text>
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            conversations.map(conversation => (
              <TouchableOpacity 
                key={conversation.id} 
                style={styles.conversationItem}
                onPress={() => handleThreadClick(conversation)}
              >
                <Image
                  source={{
                    uri: conversation.partnerUser.profilePic || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg'
                  }}
                  style={styles.profilePic}
                />
                <View style={styles.conversationInfo}>
                  <Text style={styles.username}>{conversation.partnerUser.username || conversation.partnerUser.email}</Text>
                  <Text style={styles.preview}>{conversation.lastMessage.Content}</Text>
                  <Text style={styles.timestamp}>{formatTimestamp(conversation.lastMessage.Timestamp)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        </ScrollView>

        <TouchableOpacity style={styles.newMessageButton} onPress={toggleNewMessageModal}>
          <FontAwesomeIcon icon={faPlus} size={20} color="#FFF" />
        </TouchableOpacity>

        <NewMessageModal
          isVisible={isNewMessageModalVisible}
          onClose={toggleNewMessageModal}
          onSelectUser={handleUserSelect}
          existingConversations={conversations}
          currentUser={localUser || { 
            email: '', 
            username: '', 
            profilePic: '', 
            displayName: '', 
            headerPic: '', 
            CreationDate: '', 
            followersCount: 0,  
            followingCount: 0 
          }}
          allUsers={[]}
        />
      </Animated.View>
      
      <BottomPanel
        onHomeClick={() => navigation.navigate('Feed' as never)}
        handleLike={() => {}}
        handleDislike={() => {}}
        likedIndices={new Set()}
        dislikedIndices={new Set()}
        likeDislikeCounts={{}}
        currentMediaIndex={0}
        toggleCommentFeed={() => {}}
        user={localUser}
      />
    </View>
  );
};

export default Inbox;
