// src/screens/AppNav/Inbox/inboxHandlers.tsx

import { Alert } from 'react-native';
import { RowMap } from 'react-native-swipe-list-view';
import { Conversation } from '../../../types/messageTypes';
import { User } from '../../../types/types';
import Toast from 'react-native-toast-message';
import { DEFAULT_PROFILE_PIC_URL } from '../../../constants/uiConstants';
import * as Haptics from 'expo-haptics';

export const handleThreadClick = (
  conversation: Conversation,
  user: any, 
  navigation: any
) => {
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
  Haptics.selectionAsync(); 
};

// Handler to navigate to the profile screen
export const handleProfileClick = (
  drawerNavigation: any // Replace 'any' with your actual drawer navigation type
) => {
  try {
    drawerNavigation.navigate('Profile');
  } catch (error) {
    console.error('Error navigating to Profile from INBOX:', error);
  }
};

// Handler when a user is selected to start a new conversation
export const handleUserSelect = (
  selectedUser: User,
  user: any, // Replace 'any' with your actual user type
  navigation: any, // Replace 'any' with your actual navigation type
  toggleNewMessageModal: () => void,
  generateUniqueIdFn: () => string
  
) => {
  if (!user.email) {
    console.error('User is not logged in');
    return;
  }

  toggleNewMessageModal();
  const conversationID = [user.email, selectedUser.email].sort().join("#"); // Corrected conversationID
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

// Handler to pin a conversation
export const handlePinConversation = (
  conversationId: string,
  rowMap: RowMap<Conversation>,
  pinConversation: (id: string) => void
) => {
  pinConversation(conversationId);
  closeRow(rowMap, conversationId);
  Haptics.selectionAsync(); 
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

// Handler to unpin a conversation
export const handleUnpinConversation = (
  conversationId: string,
  rowMap: RowMap<Conversation>,
  unpinConversation: (id: string) => void
) => {
  unpinConversation(conversationId);
  closeRow(rowMap, conversationId);
  Haptics.selectionAsync()
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

// Handler to delete a conversation
export const handleDeleteConversation = (
  conversationId: string,
  rowMap: RowMap<Conversation>,
  deleteConversation: (id: string) => void
) => {
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
          Haptics.selectionAsync(); 
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

// Function to close a row in SwipeListView
const closeRow = (rowMap: RowMap<Conversation>, rowKey: string) => {
  if (rowMap[rowKey]) {
    rowMap[rowKey].closeRow();
  }
};

// Handler to toggle the New Message modal
export const toggleNewMessageModalHandler = (
  isNewMessageModalVisible: boolean,
  
  setIsNewMessageModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  
) => {
  setIsNewMessageModalVisible(!isNewMessageModalVisible);
};
