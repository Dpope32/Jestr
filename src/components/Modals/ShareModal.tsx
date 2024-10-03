// src/components/Modals/ShareModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faCopy,
  faCommentSms,
  faSms,
  faFlag,
  faE,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookMessenger, faSnapchatGhost, faFacebookF, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import Toast from 'react-native-toast-message';
import { FriendType, ShareType, User } from '../../types/types';
import NewMessageModal from '../Modals/NewMessageModal';
import { useInboxStore } from '../../stores/inboxStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LastMessage } from '../../types/messageTypes';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabNavParamList } from '../../navigation/NavTypes/BottomTabsTypes';
import { InboxNavParamList } from '../../navigation/NavTypes/InboxStackTypes';
import * as Haptics from 'expo-haptics';
const { width, height } = Dimensions.get('window');

// Define a composite navigation prop to handle nested navigators
type ShareModalNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabNavParamList>,
  NativeStackNavigationProp<InboxNavParamList>
>;

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  friends?: FriendType[];
  onShare: (type: ShareType, username?: string, message?: string) => Promise<void>;
  currentMedia: string;
  user: any;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  friends,
  onShare,
  currentMedia,
  user,
}) => {
  const [selectedFriend, setSelectedFriend] = useState<FriendType | null>(null);
  const [message, setMessage] = useState('');
  const [isNewMessageModalVisible, setIsNewMessageModalVisible] = useState(false);
  const navigation = useNavigation<ShareModalNavigationProp>();
  const { conversations, pinnedConversations } = useInboxStore();

  // Hard-coded friends for testing
  const hardCodedFriends: FriendType[] = [
    { username: 'User 1', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-headerPic.jpg' },
    { username: 'User 2', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-profilePic.jpg' },
    { username: 'User 3', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-headerPic.jpg' },
    { username: 'User 4', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-profilePic.jpg' },
    { username: 'User 5', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-headerPic.jpg' },
    { username: 'User 6', profilePic: 'https://jestr-bucket.s3.us-east-2.amazonaws.com/pope.dawson%40gmail.com-profilePic.jpg' },
  ];

  // Use hard-coded friends if no friends are passed as props
  const displayFriends = friends && friends.length > 0 ? friends : hardCodedFriends;

  const handleFriendSelect = (friend: FriendType) => {
    setSelectedFriend(friend);
  };

  const handleClose = () => {
    setSelectedFriend(null);
    setMessage('');
    onClose();
  };

  const handleIconClick = (type: ShareType) => {
    console.log(`Clicked on ${type} icon`);
    if (type === 'message') {
      setIsNewMessageModalVisible(true);
    } else {
      Alert.alert(`Share via ${type.charAt(0).toUpperCase() + type.slice(1)}`);
      // Implement actual share functionality here
    }
  };

  const toggleNewMessageModal = () => {
    setIsNewMessageModalVisible(!isNewMessageModalVisible);
  };

  const handleUserSelect = (selectedUser: User) => {
    console.log("Selected user:", selectedUser);
    console.log("Current media in ShareModal:", currentMedia);
    Haptics.selectionAsync();

    // Find existing conversation or create a new one
    let conversation = [...conversations, ...pinnedConversations].find(
      conv => conv.userEmail === selectedUser.email
    );

    if (!conversation) {
      const placeholderLastMessage: LastMessage = {
        Content: "Start a conversation",
        Timestamp: new Date().toISOString()
      };

      // Create a new conversation object if it doesn't exist
      conversation = {
        id: `${user.email}-${selectedUser.email}`,
        ConversationID: `${user.email}-${selectedUser.email}`,
        userEmail: selectedUser.email,
        username: selectedUser.username || "",
        profilePicUrl: selectedUser.profilePic,
        lastMessage: placeholderLastMessage,
        timestamp: new Date().toISOString(),
        messages: [],
        UnreadCount: 0,
        LastReadMessageID: '',
        partnerUser: {
          email: selectedUser.email,
          username: selectedUser.username || null,
          profilePic: typeof selectedUser.profilePic === 'string' ? selectedUser.profilePic : null
        },
      };
    }

    // Navigate to the Conversations screen
    navigation.navigate('Conversations', {
      partnerUser: selectedUser,
      conversation: conversation,
      currentMedia: currentMedia, // Make sure this line is present
    });

    // If you need to pass currentMedia, you can do it through the inboxStore or another method
    // For example, you could set it in the store before navigation:
    // inboxStore.setCurrentMediaForConversation(conversation.id, currentMedia);

    toggleNewMessageModal();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Instant background opacity */}
      <View style={styles.modalBackground}>
        <TouchableOpacity style={styles.overlay} onPress={handleClose} activeOpacity={1} />

        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <FontAwesomeIcon icon={faTimes} size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Share Meme</Text>

          {/* Friends Section */}
          <Text style={styles.sectionTitle}>Share with a Friend</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsContainer}
          >
            {displayFriends.map((friend, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleFriendSelect(friend)}
                style={styles.friendItem}
              >
                <Image
                  source={{ uri: friend.profilePic }}
                  style={styles.friendImage}
                />
                <Text style={styles.friendName}>{friend.username}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Share Options */}
          <View style={styles.iconsContainer}>
            {icons.map((iconObj) => (
              <TouchableOpacity
                key={iconObj.type}
                onPress={() => handleIconClick(iconObj.type)}
                style={styles.iconButton}
              >
                <FontAwesomeIcon icon={iconObj.icon} size={28} color={iconObj.color} style={styles.icon} />
                <Text style={styles.iconLabel}>{iconObj.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <NewMessageModal
        isVisible={isNewMessageModalVisible}
        onClose={toggleNewMessageModal}
        onSelectUser={handleUserSelect}
        currentUser={user}
        allUsers={[]} // You might want to fetch this or pass it from a parent component
        existingConversations={[...conversations, ...pinnedConversations]}
        currentMedia={currentMedia}
        user={user}
        navigation={navigation} // Pass navigation if needed
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  friendsContainer: {
    paddingVertical: 10,
  },
  friendItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#444444',
    marginVertical: 20,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconButton: {
    alignItems: 'center',
    width: width / 4 - 10, 
    marginVertical: 10,
  },
  icon: {
    marginBottom: 5,
  },
  iconLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});


const icons: { type: ShareType; icon: any; color: string; label: string }[] = [
  { type: 'message', icon: faEnvelope, color: '#4CAF50', label: 'Message' },
  { type: 'snapchat', icon: faSnapchatGhost, color: '#FFFC00', label: 'Snapchat' },
  { type: 'facebook', icon: faFacebookF, color: '#1877F2', label: 'Facebook' },
  { type: 'twitter', icon: faXTwitter, color: '#1DA1F2', label: 'Twitter' },
  { type: 'sms', icon: faSms, color: '#25D366', label: 'SMS' },
  { type: 'facebookMessenger', icon: faFacebookMessenger, color: '#1877F2', label: 'Messenger' },
  { type: 'copy', icon: faCopy, color: '#FFFFFF', label: 'Copy Link' },
  { type: 'report', icon: faFlag, color: '#990000', label: 'Report' },
];

export default ShareModal;
