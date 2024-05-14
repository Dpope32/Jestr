import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import MediaPlayer from '../../components/MediaPlayer';
import TopPanel from '../../components/TopPanel';
import BottomPanel from '../../components/BottomPanel';
import styles from './Feed.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMemes } from '../../components/Meme/memeService';
import { useNavigation } from '@react-navigation/native';

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
};

type Meme = {
  memeID: string;
  email: string;
  url: string;
  uploadTimestamp: string;
  username: string;
  caption: string;
};

const Feed: React.FC<{ route: any }> = ({ route }) => {
  const { user } = route.params || {};
  console.log('Received user data in Feed:', user); // Log received data

  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [profilePicUrl, setProfilePicUrl] = useState(user ? user.profilePic : '');
  const [shuffledMedia, setShuffledMedia] = useState<Meme[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
          setProfilePicUrl(parsedUser.profilePic);
        }
      } catch (error) {
        console.error('Error retrieving user from AsyncStorage:', error);
      }
    };
  
    fetchUser();
  
    const loadMemes = async () => {
      const memesData = await fetchMemes();
      setShuffledMedia(memesData);
      console.log('Fetched memes:', memesData); // Log fetched memes
    };
  
    loadMemes();
  }, []);

  const goToPrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const goToNextMedia = () => {
    if (currentMediaIndex < shuffledMedia.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <TopPanel
          onProfileClick={() => {}}
          profilePicUrl={profilePicUrl}
          username={localUser ? localUser.username : 'Default Username'}
        />
        {shuffledMedia.length > 0 ? (
          <MediaPlayer
            currentMedia={shuffledMedia[currentMediaIndex].url}
            handleLike={() => {}}
            handleDislike={() => {}}
            likedIndices={new Set()}
            dislikedIndices={new Set()}
            likeDislikeCounts={{}}
            currentMediaIndex={currentMediaIndex}
            toggleCommentFeed={() => {}}
            goToPrevMedia={goToPrevMedia}
            goToNextMedia={goToNextMedia}
          />
        ) : (
          <Text>No memes available</Text>
        )}
        <BottomPanel
          onHomeClick={() => {}}
          handleLike={() => {}}
          handleDislike={() => {}}
          likedIndices={new Set()}
          dislikedIndices={new Set()}
          likeDislikeCounts={{}}
          currentMediaIndex={currentMediaIndex}
          toggleCommentFeed={() => {}}
          user={localUser}
        />
      </ScrollView>
    </View>
  );
};

export default Feed;
