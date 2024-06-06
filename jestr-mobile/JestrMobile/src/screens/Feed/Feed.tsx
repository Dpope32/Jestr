import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import MediaPlayer from '../../components/MediaPlayer';
import TopPanel from '../../components/TopPanel';
import BottomPanel from '../../components/BottomPanel';
import styles from './Feed.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMemes } from '../../components/Meme/memeService';
import { useNavigation } from '@react-navigation/native';
import ProfilePanel from '../../components/ProfilePanel';
import CommentFeed from '../../components/CommentFeed';

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
};

export type Meme = {
  memeID: string;
  email: string;
  url: string;
  uploadTimestamp: string;
  username: string;
  caption: string;
  likeCount: number;
  downloadCount: number;
  commentCount: number;
  profilePicUrl: string;
};

const Feed: React.FC<{ route: any }> = ({ route }) => {
  const { user } = route.params || {};
  const navigation = useNavigation();
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [profilePicUrl, setProfilePicUrl] = useState(user ? user.profilePic : '');
  const [shuffledMedia, setShuffledMedia] = useState<Meme[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState<boolean>(false);

  const toggleProfilePanel = () => {
    setProfilePanelVisible(!profilePanelVisible);
  };

  const toggleCommentFeed = () => {
    console.log("toggleCommentFeed called: currently", isCommentFeedVisible);
    setIsCommentFeedVisible(!isCommentFeedVisible);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
          setProfilePicUrl(parsedUser.profilePic);
          console.log('User data from AsyncStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error retrieving user from AsyncStorage:', error);
      }
    };

    fetchUser();

    const loadMemes = async () => {
      const memesData = await fetchMemes();
      setShuffledMedia(memesData);
      console.log('Fetched memes:', memesData);
    };

    loadMemes();
  }, []);

  useEffect(() => {
    if (shuffledMedia.length > 0) {
      console.log('Current media URL:', shuffledMedia[currentMediaIndex].url);
    }
  }, [currentMediaIndex, shuffledMedia]);

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

  useEffect(() => {
    if (shuffledMedia.length > 0 && shuffledMedia[currentMediaIndex]) {
      console.log('Current media URL:', shuffledMedia[currentMediaIndex].url);
      const memeID = shuffledMedia[currentMediaIndex].memeID;
      // Use memeID for further operations here
    }
  }, [currentMediaIndex, shuffledMedia]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <TopPanel
          onProfileClick={toggleProfilePanel}
          profilePicUrl={localUser ? localUser.profilePic : ''}
          username={localUser ? localUser.username : 'Default Username'}
        />
        {profilePanelVisible && localUser && (
          <ProfilePanel
            isVisible={profilePanelVisible}
            onClose={() => setProfilePanelVisible(false)}
            profilePicUrl={localUser.profilePic}
            username={localUser.username}
            displayName={localUser.displayName || 'N/A'}
            followersCount="0"
            followingCount="0"
            onDarkModeToggle={() => console.log("Dark Mode Toggle")}
            user={localUser}
            navigation={navigation}
          />
        )}
        {shuffledMedia.length > 0 ? (
          <>
            <MediaPlayer
              currentMedia={shuffledMedia[currentMediaIndex].url}
              handleLike={() => {}}
              handleDownload={() => {}}
              likedIndices={new Set()}
              downloadedIndices={new Set()}
              likeDislikeCounts={{}}
              currentMediaIndex={currentMediaIndex}
              toggleCommentFeed={toggleCommentFeed}
              goToPrevMedia={goToPrevMedia}
              goToNextMedia={goToNextMedia}
              username={shuffledMedia[currentMediaIndex].username}
              caption={shuffledMedia[currentMediaIndex].caption}
              uploadTimestamp={shuffledMedia[currentMediaIndex].uploadTimestamp}
              user={localUser}
              memeID={shuffledMedia[currentMediaIndex].memeID}
              likeCount={shuffledMedia[currentMediaIndex].likeCount}
              downloadCount={shuffledMedia[currentMediaIndex].downloadCount}
              commentCount={shuffledMedia[currentMediaIndex].commentCount}
              profilePicUrl={shuffledMedia[currentMediaIndex].profilePicUrl}
            />
            {isCommentFeedVisible && (
              <CommentFeed
                key={`${shuffledMedia[currentMediaIndex].memeID}-${isCommentFeedVisible}`}
                memeID={shuffledMedia[currentMediaIndex].memeID}
                mediaIndex={currentMediaIndex}
                profilePicUrl={localUser ? localUser.profilePic : ''}
                user={localUser}
                isCommentFeedVisible={isCommentFeedVisible}
                toggleCommentFeed={toggleCommentFeed} // Pass the toggleCommentFeed prop
              />
            )}
          </>
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
