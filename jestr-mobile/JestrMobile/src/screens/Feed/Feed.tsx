import React, { useState, useEffect } from 'react';
import { View, ImageBackground, TextInput, ScrollView } from 'react-native';
import { Animated } from 'react-native';
import MediaPlayer from '../../components/MediaPlayer';
import CommentFeed from '../../components/CommentFeed';
import ProfilePanel from '../../components/ProfilePanel';
import TopPanel from '../../components/TopPanel';
import BottomPanel from '../../components/BottomPanel';
import styles from './Feed.styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import radialGradientBg from '../../assets/images/radial_gradient_bg.png';

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
};

type RootStackParamList = {
  LandingPage: undefined;
  Feed: { user: User };
};

const Feed: React.FC<{ route: any }> = ({ route }) => {
  const { user } = route.params || {};
  console.log('Received user data in Feed:', user); // Log received data

  // Define the user state
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(user ? user.profilePic : '');
  const [username, setUsername] = useState(user ? user.username : '');
  const [shuffledMedia, setShuffledMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [handleLike, setHandleLike] = useState<(index: number) => void>(() => {});
  const [handleDislike, setHandleDislike] = useState<(index: number) => void>(() => {});
  const [likedIndices, setLikedIndices] = useState<Set<number>>(new Set());
  const [dislikedIndices, setDislikedIndices] = useState<Set<number>>(new Set());
  const [likeDislikeCounts, setLikeDislikeCounts] = useState({});
  const [toggleCommentFeed, setToggleCommentFeed] = useState<() => void>(() => {});
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [goToPrevMedia, setGoToPrevMedia] = useState<() => void>(() => {});
  const [goToNextMedia, setGoToNextMedia] = useState<() => void>(() => {});
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
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
  }, []);

  return (
    <ImageBackground source={radialGradientBg} style={styles.container} resizeMode="cover">
      {!isAuthenticated && (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {/* Render other components */}
          <TopPanel
            onProfileClick={() => setIsProfilePanelVisible(!isProfilePanelVisible)}
            profilePicUrl={profilePicUrl}
            username={localUser ? localUser.username : 'Default Username'}
          />
          <MediaPlayer
            currentMedia={shuffledMedia[currentMediaIndex]}
            handleLike={handleLike}
            handleDislike={handleDislike}
            likedIndices={likedIndices}
            dislikedIndices={dislikedIndices}
            likeDislikeCounts={likeDislikeCounts}
            currentMediaIndex={currentMediaIndex}
            toggleCommentFeed={toggleCommentFeed}
            goToPrevMedia={goToPrevMedia}
            goToNextMedia={goToNextMedia}
          />
          <BottomPanel
            onHomeClick={() => {}}
            handleLike={handleLike}
            handleDislike={handleDislike}
            likedIndices={likedIndices}
            dislikedIndices={dislikedIndices}
            likeDislikeCounts={likeDislikeCounts}
            currentMediaIndex={currentMediaIndex}
            toggleCommentFeed={toggleCommentFeed}
            user={localUser} // Pass the localUser as the user prop
          />
          {isProfilePanelVisible && localUser && (
          <ProfilePanel
          isVisible={isProfilePanelVisible}
          onClose={() => setIsProfilePanelVisible(false)}
          profilePicUrl={localUser.profilePic}
          username={localUser.username}
          displayName={localUser.displayName}
          followersCount="0"
          followingCount="0"
          onDarkModeToggle={() => {}}
          user={localUser}
          navigation={navigation}  // Pass the navigation prop here
        />
          )}
          {isCommentFeedVisible && <CommentFeed mediaIndex={currentMediaIndex} />}
        </ScrollView>
      )}
    </ImageBackground>
  );
};

export default Feed;
