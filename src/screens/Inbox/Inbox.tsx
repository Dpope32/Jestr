import React, { useState, useEffect } from 'react';
import { fetchConversations } from '../../services/authFunctions'; 
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faThumbtack, faBell } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/types'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NewMessageModal from '../../components/Modals/NewMessageModal';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Message } from './Conversations';
import styles from './Inbox.styles';
import { Dimensions } from 'react-native';
import { useTheme } from '../../ThemeContext';

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


interface ConversationResponse {
  ConversationID: string;
  partnerUser: {
    email: string;
    username: string;
    profilePic: string;
  };
  lastMessage: {
    Content: string;
    Timestamp: string;
  };
}

interface APIResponse {
  data: {
    conversations: ConversationResponse[];
  };
}

interface Conversation {
  id: string;
  userEmail: string;
  username: string;
  profilePicUrl: string | null;
  lastMessage: string;
  timestamp: string;
  messages: any[];
}

const Inbox: React.FC<{ route: any }> = ({ route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = route.params || {};
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Inbox'>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { isDarkMode } = useTheme();
  const [pinnedConversations, setPinnedConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  const toggleNewMessageModal = () => {
    setIsNewMessageModalVisible(!isNewMessageModalVisible);
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
        conversation: {
          ...conversation,
          lastMessage: getMessagePreview(conversation.lastMessage)
        }
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

  const handlePin = (id: string) => {
    const conversationToPin = conversations.find(conv => conv.id === id);
    if (conversationToPin) {
      setPinnedConversations([...pinnedConversations, conversationToPin]);
      setConversations(conversations.filter(conv => conv.id !== id));
    }
  };

  const fetchNotifications = () => {
    setNotifications(['New follower: @user1', 'Your meme was liked by @user2']);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
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
          userEmail: selectedUser.email,
          username: selectedUser.username,
          profilePicUrl: selectedUser.profilePic, // This line causes an error
          messages: [],
          lastMessage: '',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const generateUniqueId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    const loadConversations = async () => {
      if (localUser) {
        try {
          const userConversations = await fetchConversations(localUser.email);
          if (userConversations && userConversations.length > 0) {
            const formattedConversations = userConversations.map((conv: { 
              ConversationID: string; 
              partnerUser: { email: string; username: string | null; profilePic: string | null; }; 
              lastMessage: { Content: string; Timestamp: string; ReceiverID: string; }; 
            }) => ({
              id: conv.ConversationID,
              userEmail: conv.partnerUser.email,
              username: conv.partnerUser.username || conv.lastMessage.ReceiverID,
              profilePicUrl: conv.partnerUser.profilePic,
              lastMessage: conv.lastMessage ? conv.lastMessage.Content : 'No messages',
              timestamp: conv.lastMessage ? formatTimestamp(conv.lastMessage.Timestamp) : '',
              messages: [],
            }));
            setConversations(formattedConversations);
          } else {
            setConversations([]);
          }
        } catch (error) {
          setConversations([]);
        }
      }
    };
  
    loadConversations();
  }, [localUser]);

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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: isDarkMode ? '#000' : '#2E2E2E' }]}>
      <View style={styles.header}>
        <Text style={styles.sectionHeaderIn}>Inbox</Text>
        {localUser && (
          <TouchableOpacity onPress={handleProfileClick}>
            <Image 
              source={{ uri: localUser.profilePic || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg' }} 
              style={styles.profilePicTop} 
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
          <View style={styles.separator} />
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
          <View style={styles.separator} />
          {conversations.map(conversation => (
            <TouchableOpacity 
              key={conversation.id} 
              style={styles.conversationItem}
              onPress={() => handleThreadClick(conversation)}
            >
              <Image 
                source={{uri: conversation.profilePicUrl || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg'}} 
                style={styles.profilePic} 
              />
              <View style={styles.conversationInfo}>
                <Text style={styles.username}>{conversation.username}</Text>
                <Text style={styles.timestamp}>{conversation.timestamp}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  );
};



export default Inbox;
