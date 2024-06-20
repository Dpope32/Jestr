import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { User } from '../Feed/Feed';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigation } from '@react-navigation/native';

export type Message = {
    id: string;
    text: string;
    timestamp: string;
    sentByMe: boolean;
    read: boolean;
  };

  type Conversation = {
    id: string;
    username: string;
    profilePicUrl: string;
    lastMessage: string;
    timestamp: string;
  };

  type ConversationsParams = {
    user: User;
    conversation: {
      id: string;
      username: string;
      profilePicUrl: string;
      messages: Message[];
    };
    previewMeme: string;
  };

  
  type ConversationsProps = StackScreenProps<RootStackParamList, 'Conversations'>;

  const Conversations: React.FC<ConversationsProps> = ({ route }) => {
    const { user, conversation } = route.params;
    const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState('');
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const navigation = useNavigation();
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    // Function to send a message
    console.log('Send message:', newMessage);
    setNewMessage('');
    navigation.goBack();
  };

  const toggleProfilePanel = () => {
    setProfilePanelVisible(!profilePanelVisible);
  };

  return (
      <View style={[styles.container, { height: '90%' }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
      </TouchableOpacity>
      <View style={styles.userDetails}>
        <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
        <Text style={styles.username}>{user.username}</Text>
      </View>
      <View style={styles.separator} />
      {isTyping && <Text style={styles.typingIndicator}>Typing...</Text>}
      <View style={styles.messagesContainer}>
      <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, { alignSelf: item.sentByMe ? 'flex-end' : 'flex-start', backgroundColor: item.sentByMe ? '#4299e1' : '#2d3748' }]}>
              <Text style={[styles.messageText, { color: 'white' }]}>{item.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
                {item.read && <Text style={styles.readReceipt}>Read</Text>}
              </View>
            </View>
          )}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Start a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.emojiButton}>
        <Text>😀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <FontAwesomeIcon icon={faArrowUp} size={24} color="white" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#1C1C1C',
    borderTopWidth: 2,  // Adds a visual separation
    borderTopColor: '#444',  // Subtle color for the top border
    paddingTop: 20, 
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',  // Centers text horizontally
    alignSelf: 'center',
    padding: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  username: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  messageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 10,
    color: '#aaa',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    marginBottom: 60,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#888',
    color: 'white',
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#1bd40b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  backButton: {
    marginLeft: 10,
  },
  separator: {
    borderBottomColor: '#444',
    borderBottomWidth: 1,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  typingIndicator: {
    color: '#888',
    marginBottom: 5,
    marginLeft: 10,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  readReceipt: {
    color: '#888',
    fontSize: 12,
    marginLeft: 5,
  },
  emojiButton: {
    marginLeft: 10,
    fontSize: 24,
  },
});

export default Conversations;