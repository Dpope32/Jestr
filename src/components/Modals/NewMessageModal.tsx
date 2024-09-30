import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Animated, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { User, ProfileImage } from '../../types/types'; 
import { getAllUsers } from '../../services/userService';
import { FlashList } from '@shopify/flash-list';
import styles from './ModalStyles/NewMM.styles'

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NewMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUser: Partial<User>;
  allUsers: User[];
  existingConversations: Conversation[];
}

type Conversation = {
  id: string;
  userEmail: string;
  lastMessage: {
    Content: string;
    Timestamp: string;
  };
};

const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isVisible,
  onClose,
  onSelectUser,
  currentUser,
  allUsers: initialUsers,
  existingConversations
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [modalY] = useState(new Animated.Value(0));
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

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
    const filtered = allUsers.filter(user => 
      typeof user.username === 'string' &&
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      user.email !== currentUser.email
    );
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, currentUser.email]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
        setSuggestedUsers(users.filter(user => user.email !== currentUser.email).slice(0, 5));
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

  const getImageSource = (profilePic: string | ProfileImage | null | undefined): ImageSourcePropType => {
    if (typeof profilePic === 'string') {
      return { uri: profilePic };
    } else if (profilePic && 'uri' in profilePic) {
      return { uri: profilePic.uri };
    } else if (profilePic && 'url' in profilePic) {
      return { uri: profilePic.url };
    }
    return require('../../assets/images/Jestr.jpg'); 
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const existingConversation = existingConversations.find(
      conv => conv.userEmail === item.email
    );
  
    return (
      <TouchableOpacity onPress={() => onSelectUser(item)}>
        <View style={styles.userItem}>
          <Image source={getImageSource(item.profilePic)} style={styles.userAvatar} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            {existingConversation && (
              <Text style={styles.lastMessage}>{existingConversation.lastMessage.Content}</Text> 
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
    >
      <Animated.View 
        style={[
          styles.modalContainer,
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
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Chat Message</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} size={20} color="#1bd40b" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="To: Enter username"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlashList
            data={filteredUsers}
            keyExtractor={(item) => item.email}
            renderItem={renderUserItem}
            contentContainerStyle={styles.userList}
            estimatedItemSize={73}
          />
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Users</Text>
          <FlashList
            data={suggestedUsers}
            keyExtractor={(item) => item.email}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSelectUser(item)} style={styles.suggestionItem}>
                <Image source={getImageSource(item.profilePic)} style={styles.suggestionAvatar} />
                <Text style={styles.suggestionUsername} numberOfLines={1} ellipsizeMode="tail">
                  {item.username}
                </Text>
              </TouchableOpacity>
              )}
              contentContainerStyle={styles.suggestionsList}
              estimatedItemSize={85}
            />
        </View>
      </Animated.View>
    </Modal>
  );
};

export default NewMessageModal;