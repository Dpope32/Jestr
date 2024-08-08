import React, { useState, useEffect } from 'react';
import { fetchConversations } from '../../services/authFunctions'; 
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Animated  } from 'react-native';
//import { Swipeable } from 'react-native-gesture-handler';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faTrash, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/types'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NewMessageModal from '../../components/Modals/NewMessageModal';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Message } from './Conversations';
import { Dimensions } from 'react-native';
import ProfilePanel from '../../components/Panels/ProfilePanel';

const windowWidth = Dimensions.get('window').width;

type RootStackParamList = {
  Feed: undefined;
  MemeUpload: undefined;
  Inbox: undefined;
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
  profilePicUrl: string;
  lastMessage: string;
  timestamp: string;
  messages: any[];
}


const Inbox: React.FC<{ route: any }> = ({ route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = route.params || {};
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Inbox'>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
          displayName: conversation.username,
          headerPic: '',
          creationDate: '',
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      if (localUser) {
        try {
          const userConversations = await fetchConversations(localUser.email);
          // Check if we correctly receive the conversation array
          console.log('Received conversations:', userConversations);
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
            console.log('No conversations found or received empty array');
            setConversations([]);
          }
        } catch (error) {
          console.error('Error loading conversations:', error);
          setConversations([]);
        }
      }
    };
  
    loadConversations();
  }, [localUser]);
  

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
          userEmail: selectedUser.email,
          username: selectedUser.username,
          profilePicUrl: selectedUser.profilePic,
          messages: [],
          lastMessage: '',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const handleDelete = (id: string) => {
  };

  const handlePin = (id: string) => {
  };

  const toggleProfilePanel = () => {
    console.log("Profile Panel visibility before toggle:", profilePanelVisible);
    setProfilePanelVisible(!profilePanelVisible);
    console.log("Profile Panel visibility after toggle:", profilePanelVisible);
};

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
    } catch (e) {
      // JSON parsing failed, use the content as is
    }
  }
  // Truncate long messages
  return content.length > 50 ? content.substring(0, 47) + '...' : content;
};

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: Conversation
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, windowWidth / 5],  // Adjusted to a smaller swipe gesture
      outputRange: [300, 0],            // Starts just off-screen from the right
      extrapolate: 'clamp'
    });
  
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <TouchableOpacity
          style={styles.rightAction}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: Conversation
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [-100, 0], // Changed to slide in from the left
      extrapolate: 'clamp'
    });
  
    return (
      <Animated.View style={{ flex: 1, marginLeft:10, transform: [{ translateX: trans }] }}>
        <TouchableOpacity
          style={styles.leftAction}
          onPress={() => handlePin(item.id)}
        >
          <FontAwesomeIcon icon={faThumbtack} size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
 // const renderConversationItem = ({ item }: { item: Conversation }) => (
//    <Swipeable
 //     renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
 //     renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
 //   >
  //    <TouchableOpacity style={styles.messageContainer} onPress={() => handleThreadClick(item)}>
  //      <Image 
    //      source={{uri: item.profilePicUrl || 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg'}} 
     //     style={styles.profilePic} 
   //     />
     //   <View style={styles.messageText}>
    //      <Text style={styles.username}>{item.username || item.userEmail}</Text>
   //       <Text style={styles.message}>{getMessagePreview(item.lastMessage)}</Text>
   //     </View>
    //    <Text style={styles.timestamp}>{item.timestamp}</Text>
   //   </TouchableOpacity>
   // </Swipeable>
 // );


  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1C1C1C' : '#696969' }]}>
<TopPanel
  onProfileClick={toggleProfilePanel}
  profilePicUrl={localUser ? localUser.profilePic : ''}
  username={localUser ? localUser.username : 'Default Username'}
  enableDropdown={true}
  showLogo={true}
  isAdmin={false}  // Make sure localUser correctly holds the user data
  onAdminClick={console.log}
  isDarkMode={isDarkMode}
  setIsDarkMode={setIsDarkMode}
  isUploading={false}
/>

{localUser && (
    <ProfilePanel
        isVisible={profilePanelVisible}
        onClose={() => setProfilePanelVisible(false)}
        profilePicUrl={localUser.profilePic}
        username={localUser.username}
        displayName={localUser.displayName || 'N/A'}
        followersCount={localUser.followersCount}
        followingCount={localUser.followingCount}
        onDarkModeToggle={() => console.log("Dark Mode Toggle")}
        user={localUser}
        navigation={navigation}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
)}


      <View style={styles.headerContainer}>
        <Text style={styles.header}>All Conversations</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search messages"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#999"
      />

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
          creationDate: '', 
          followersCount: 0, 
          followingCount: 0 
        }}
        allUsers={[]}
      />
            <BottomPanel
        onHomeClick={() => {}}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 80,
    backgroundColor: '#1C1C1C',
    borderTopWidth: 2,
    borderTopColor: '#444',
  },
  headerContainer: {
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#444',
    paddingTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    padding: 10,
  },
  searchBar: {
    backgroundColor: '#333',
    borderRadius: 20,
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  rightAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    width: 100,
  },
  deleteAction: {
    padding: 20,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  leftAction: {
    backgroundColor: 'green',
    justifyContent: 'center',
    height: '100%',
    width: 100,
  },
  pinAction: {
    padding: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  messageText: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: '#1bd40b',
  },
  unread: {
    color: '#FF6347', 
  },
  message: {
    color: '#CCC',
  },
  timestamp: {
    color: '#999',
  },
  emptyMessage: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
  newMessageButton: {
    position: 'absolute',
    right: 15,
    bottom: 80,
    backgroundColor: '#1bd40b',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 100,
    backgroundColor: '#333',
  },
});

export default Inbox;
