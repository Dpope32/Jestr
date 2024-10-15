import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { User, ProfileImage } from '../../types/types';
import { Conversation, MemeShareContent } from '../../types/messageTypes';
import { getAllUsers } from '../../services/userService';
import { FlashList } from '@shopify/flash-list';
import createStyles from './ModalStyles/NewMM.styles';
import { DEFAULT_PROFILE_PIC_URL } from '../../constants/uiConstants';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';

interface NewMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUser: Partial<User>;
  allUsers: User[];
  existingConversations: Conversation[];
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isVisible,
  onClose,
  onSelectUser,
  currentUser,
  allUsers: initialUsers,
  existingConversations,
}) => {
  const { isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const modalY = useRef(new Animated.Value(0)).current;
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  const filteredUsers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          user.email !== currentUser.email
      ),
    [searchQuery, allUsers, currentUser.email]
  );

  const suggestedUsers = useMemo(
    () =>
      allUsers
        .filter((user) => user.email !== currentUser.email)
        .slice(0, 5),
    [allUsers, currentUser.email]
  );

  useEffect(() => {
    if (isVisible) {
      Animated.timing(modalY, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Removed automatic focus to prevent keyboard from opening on modal open
    } else {
      Animated.timing(modalY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, modalY]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Fetch users only if initialUsers are not provided
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, [initialUsers]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  const getImageSource = (
    profilePic: string | ProfileImage | null | undefined
  ): ImageSourcePropType => {
    if (typeof profilePic === 'string' && profilePic.trim() !== '') {
      return { uri: profilePic };
    } else if (typeof profilePic === 'object' && profilePic !== null) {
      return {
        uri:
          profilePic.uri ||
          profilePic.url ||
          DEFAULT_PROFILE_PIC_URL,
      };
    }
    return { uri: DEFAULT_PROFILE_PIC_URL };
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const existingConversation = existingConversations.find(
      (conv) => conv.userEmail === item.email
    );
  
    let messageContent = 'No message';
    let memeURL = '';
  
    if (existingConversation?.lastMessage) {
      const content = existingConversation.lastMessage.Content;
      let parsedContent: any = null;
  
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content);
        } catch (e) {
          console.error('Failed to parse message content:', e);
          // Fallback: Treat the entire content as plain text
          messageContent = content;
        }
      } else if (typeof content === 'object') {
        parsedContent = content;
      }
  
      if (parsedContent) {
        switch (parsedContent.type) {
          case 'meme_share':
            messageContent = parsedContent.message || 'Shared a meme';
            memeURL = parsedContent.memeID.startsWith('http')
              ? parsedContent.memeID
              : `https://jestr-bucket.s3.amazonaws.com/${parsedContent.memeID}`;
            break;
  
          case 'text':
            messageContent = parsedContent.message || 'No message';
            break;
  
          // Handle other message types here if necessary
          default:
            messageContent = 'Unsupported message type';
            break;
        }
      }
    }
  
    return (
      <TouchableOpacity onPress={() => handleSelectUser(item)}>
        <View style={styles.userItem}>
          <Image
            source={getImageSource(item.profilePic)}
            style={styles.userAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{item.username}</Text>
            {existingConversation && (
              <View style={styles.messageContainer}>
                <Text style={styles.lastMessage}>{messageContent}</Text>
                {memeURL !== '' && (
                  <Image
                    source={{ uri: memeURL }}
                    style={styles.memeThumbnail}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      {
                        translateY: modalY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [SCREEN_HEIGHT, 0],
                        }),
                      },
                    ],
                  },
                ]}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  console.log('Animated.View dimensions:', width, height);
                }}
              >
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>New Chat Message</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesomeIcon
                      icon={faTimes}
                      size={20}
                      color="#1bd40b"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="To: Enter username"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <View style={styles.listContainer}>
                  {filteredUsers.length > 0 ? (
                    <View style={{ flex: 1 }}>
                      <FlashList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        estimatedItemSize={73}
                        keyboardShouldPersistTaps="handled"
                        keyExtractor={(item) => item.email}
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                        onLayout={(event) => {
                          const { width, height } = event.nativeEvent.layout;
                          console.log('FlashList (filteredUsers) dimensions:', width, height);
                        }}
                      />
                    </View>
                  ) : (
                    <Text style={styles.noResultsText}>No users found.</Text>
                  )}
                </View>
                <View style={styles.suggestionsContainer}>
  <Text style={styles.suggestionsTitle}>Suggested Users</Text>
  {/* Set a fixed height for the FlashList container */}
  <View style={styles.suggestedListContainer}>
    <FlashList
      data={suggestedUsers}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleSelectUser(item)}
          style={styles.suggestionItem}
        >
          <Image
            source={getImageSource(item.profilePic)}
            style={styles.suggestionAvatar}
          />
          <Text
            style={styles.suggestionUsername}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.username}
          </Text>
        </TouchableOpacity>
      )}
      estimatedItemSize={85}
      horizontal
      keyboardShouldPersistTaps="handled"
      keyExtractor={(item) => item.email}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('FlashList (suggestedUsers) dimensions:', width, height);
      }}
    />
  </View>
</View>

              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default NewMessageModal;
