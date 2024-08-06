import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Animated, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/types'; 
import { getAllUsers } from '../../services/authFunctions';
import { FlashList } from '@shopify/flash-list';

interface NewMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUser: Partial<User>;
  allUsers: User[];
  existingConversations: Conversation[];
};

type Conversation = {
  id: string;
  userEmail: string;
  lastMessage: string;
};

const NewMessageModal: React.FC<NewMessageModalProps> = ({ isVisible, onClose, onSelectUser, currentUser, allUsers: initialUsers, existingConversations
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
  


  //search query to populate potential users
  useEffect(() => {
    const filtered = allUsers.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      user.email !== currentUser.email // Exclude the current user
    );
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, currentUser.email]);


  //get all users except yourself
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

  const renderUserItem = ({ item }: { item: User }) => {
    const existingConversation = existingConversations.find(
      conv => conv.userEmail === item.email
    );

    return (
      <TouchableOpacity onPress={() => onSelectUser(item)}>
        <View style={styles.userItem}>
          <Image source={{ uri: item.profilePic }} style={styles.userAvatar} />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            {existingConversation && (
              <Text style={styles.lastMessage}>{existingConversation.lastMessage}</Text>
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
                  outputRange: [300, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Chat Message</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} size={24} color="#1bd40b" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="To: Enter username"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlashList
          data={filteredUsers}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectUser(item)} style={styles.userItem}>
             {item.profilePic && <Image source={{ uri: item.profilePic }} style={styles.userAvatar} />}
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Users</Text>
          <FlashList
            data={suggestedUsers}
            keyExtractor={(item) => item.email}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectUser(item)} style={styles.suggestionItem}>
                <Image source={{ uri: item.profilePic }} style={styles.userAvatar} />
                <Text style={styles.username}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#1C1C1C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  lastMessage: {
    color: '#999',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  username: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  suggestionsContainer: {
    marginTop: 10,
    padding: 10,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  suggestionItem: {
    alignItems: 'center',
    marginRight: 10,
  },
});

export default NewMessageModal;
