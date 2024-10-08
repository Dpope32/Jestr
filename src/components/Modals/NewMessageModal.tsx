import React, {useState, useEffect, useRef} from 'react';
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
  SafeAreaView,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {User, ProfileImage} from '../../types/types';
import {
  Conversation,
  MessageContent,
  MemeShareContent,
} from '../../types/messageTypes';
import {getAllUsers} from '../../services/userService';
import {FlashList} from '@shopify/flash-list';
import createStyles from './ModalStyles/NewMM.styles';
import {DEFAULT_PROFILE_PIC_URL} from '../../constants/uiConstants';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../theme/ThemeContext';

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
  const {isDarkMode} = useTheme();
  const styles = createStyles(isDarkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [modalY] = useState(new Animated.Value(0));
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const inputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const isMemeShareContent = (content: any): content is MemeShareContent => {
    return (
      content &&
      typeof content === 'object' &&
      content.type === 'meme_share' &&
      typeof content.memeID === 'string'
    );
  };

  useEffect(() => {
    if (isVisible) {
      Animated.timing(modalY, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, modalY]);

  useEffect(() => {
    const filtered = allUsers.filter(
      user =>
        typeof user.username === 'string' &&
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        user.email !== currentUser.email,
    );
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, currentUser.email]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        setSuggestedUsers(
          users.filter(user => user.email !== currentUser.email).slice(0, 5),
        );
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser.email]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  const getImageSource = (
    profilePic: string | ProfileImage | null | undefined,
  ): ImageSourcePropType => {
    if (typeof profilePic === 'string' && profilePic.trim() !== '') {
      return {uri: profilePic};
    } else if (typeof profilePic === 'object' && profilePic !== null) {
      if (
        'uri' in profilePic &&
        typeof profilePic.uri === 'string' &&
        profilePic.uri.trim() !== ''
      ) {
        return {uri: profilePic.uri};
      } else if (
        'url' in profilePic &&
        typeof profilePic.url === 'string' &&
        profilePic.url.trim() !== ''
      ) {
        return {uri: profilePic.url};
      }
    }
    return {uri: DEFAULT_PROFILE_PIC_URL};
  };

  const renderUserItem = ({item}: {item: User}) => {
    const existingConversation = existingConversations.find(
      conv => conv.userEmail === item.email,
    );

    let messageContent = 'No message';
    let memeURL = '';

    if (existingConversation && existingConversation.lastMessage) {
      const content = existingConversation.lastMessage.Content;

      if (typeof content === 'string') {
        try {
          const parsedContent = JSON.parse(content);
          if (isMemeShareContent(parsedContent)) {
            messageContent = parsedContent.message || 'Shared a meme';
            memeURL = parsedContent.memeID.startsWith('http')
              ? parsedContent.memeID
              : `https://jestr-bucket.s3.amazonaws.com/${parsedContent.memeID}`;
          } else {
            messageContent = content; // It's a plain text message
          }
        } catch (e) {
          console.warn('Failed to parse message content:', e);
          messageContent = content; // Fallback to displaying the raw string
        }
      } else if (isMemeShareContent(content)) {
        messageContent = content.message || 'Shared a meme';
        memeURL = content.memeID.startsWith('http')
          ? content.memeID
          : `https://jestr-bucket.s3.amazonaws.com/${content.memeID}`;
      }
    }

    return (
      <TouchableOpacity onPress={() => handleSelectUser(item)}>
        <View style={styles.userItem}>
          <Image
            source={getImageSource(item.profilePic)}
            style={styles.userAvatar}
          />
          <View style={{flex: 1}}>
            <Text style={styles.username}>{item.username}</Text>
            {existingConversation && (
              <View style={styles.messageContainer}>
                <Text style={styles.lastMessage}>{messageContent}</Text>
                {memeURL && (
                  <Image
                    source={{uri: memeURL}}
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
      <SafeAreaView
        style={{flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#494949'}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>New Chat Message</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}>
                    <FontAwesomeIcon icon={faTimes} size={20} color="#1bd40b" />
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
                  <FlashList
                    data={filteredUsers}
                    renderItem={renderUserItem}
                    estimatedItemSize={73}
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={item => item.email}
                  />
                </View>
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Suggested Users</Text>
                  <View style={styles.horizontalListContainer}>
                    <FlashList
                      data={suggestedUsers}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          onPress={() => handleSelectUser(item)}
                          style={styles.suggestionItem}>
                          <Image
                            source={getImageSource(item.profilePic)}
                            style={styles.suggestionAvatar}
                          />
                          <Text
                            style={styles.suggestionUsername}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.username}
                          </Text>
                        </TouchableOpacity>
                      )}
                      estimatedItemSize={85}
                      horizontal
                      keyboardShouldPersistTaps="handled"
                      keyExtractor={item => item.email}
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default NewMessageModal;
