import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import { User } from '../Feed/Feed';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Conversation from './Conversations'

type RootStackParamList = {
    Feed: undefined;
    MemeUpload: undefined;
    Inbox: undefined;
    Conversations: {
      user: {
        username: string;
        profilePic: string;
        email: string;
        displayName: string;
        headerPic: string;
        creationDate: string;
      };
      conversation: Conversation;
    };
  };

  type Conversation = {
    id: string;
    username: string;
    profilePicUrl: string;
    lastMessage: string;
    timestamp: string;
  };
  

  const conversations = [
    {
      id: '1', 
      username: 'JohnDoe',
      profilePicUrl: 'https://placekitten.com/200/200',
      lastMessage: 'Sounds good, see you then!',
      timestamp: '5 mins ago',
      messages: [
        { id: '1', text: 'Hey, how are you?', timestamp: '10 mins ago', sentByMe: false },
        { id: '2', text: 'I\'m doing well, thanks! How about you?', timestamp: '8 mins ago', sentByMe: true },
        { id: '3', text: 'Not bad, just staying busy. We still on for tonight?', timestamp: '6 mins ago', sentByMe: false },
        { id: '4', text: 'Yep, I\'ll meet you at the restaurant at 7!', timestamp: '5 mins ago', sentByMe: true },
        { id: '5', text: 'Sounds good, see you then!', timestamp: '5 mins ago', sentByMe: false },
      ]
    },
    {
      id: '2',
      username: 'JaneDoe',
      profilePicUrl: 'https://placekitten.com/200/200', 
      lastMessage: 'Okay, have a great weekend!',
      timestamp: '30 mins ago',
      messages: [
        { id: '1', text: 'Hey Jane, did you finish that report?', timestamp: '35 mins ago', sentByMe: true },
        { id: '2', text: 'Almost done, I\'ll send it over this afternoon.', timestamp: '32 mins ago', sentByMe: false },
        { id: '3', text: 'Great, thanks! Let me know if you need any help.', timestamp: '31 mins ago', sentByMe: true },  
        { id: '4', text: 'Will do. Have a good one!', timestamp: '30 mins ago', sentByMe: false },
        { id: '5', text: 'Okay, have a great weekend!', timestamp: '30 mins ago', sentByMe: true },
      ]
    }
  ];

const Inbox:  React.FC<{ route: any }> = ({ route }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = route.params || {};
    const [localUser, setLocalUser] = useState<User | null>(user || null);
    const [profilePanelVisible, setProfilePanelVisible] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isDropdownEnabled, setIsDropdownEnabled] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const toggleProfilePanel = () => {
        setProfilePanelVisible(!profilePanelVisible);
      };

      const handleThreadClick = (conversation: typeof conversations[number]) => {
        const selectedConversation = conversations.find(conv => conv.id === conversation.id);
        if (selectedConversation) {
          navigation.navigate('Conversations', {
            user: {
              username: selectedConversation.username,
              profilePic: selectedConversation.profilePicUrl,
              email: '',
              displayName: '',
              headerPic: '',
              creationDate: '',
            },
            conversation: selectedConversation,
          });
        }
      };


      return (
        <View style={styles.container}>
          <TopPanel
            onProfileClick={toggleProfilePanel}
            profilePicUrl={localUser ? localUser.profilePic : ''}
            username={localUser ? localUser.username : 'Default Username'}
            enableDropdown={false}
            showLogo={true}
          />
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
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.messageContainer} onPress={() => handleThreadClick(item)}>
                        <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
                        <View style={styles.messageText}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.message}>{item.lastMessage}</Text>
                        </View>
                        <Text style={styles.timestamp}>{item.timestamp}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={[styles.newMessageButton, { bottom: 70 }]}>
                <FontAwesomeIcon icon={faPlus} size={20} color="#FFF" />
            </TouchableOpacity>
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
        paddingTop: 80, // Adjust the top padding to make room for the top panel
        backgroundColor: '#1C1C1C',
        borderTopWidth: 2,  // Adds a visual separation
        borderTopColor: '#444',  // Subtle color for the top border
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF', // White color for the header
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBar: {
        backgroundColor: '#333',
        borderRadius: 20,
        color: '#FFF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        marginBottom: 10
    },
    messageContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        borderBottomColor: '#444', // Subtle separator color
        borderBottomWidth: 1
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10
    },
    messageText: {
        flex: 1
    },
    username: {
        fontWeight: 'bold',
        color: '#1bd40b', // Green color for username
    },
    message: {
        color: '#CCC'
    },
    timestamp: {
        color: '#999'
    },
    newMessageButton: {
        position: 'absolute',
        right: 15,
        bottom: 80, // Moved up slightly to avoid overlapping with BottomPanel
        backgroundColor: '#1bd40b',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
     headerContainer: {
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#444',
    paddingTop: 10,
  },
});

export default Inbox;