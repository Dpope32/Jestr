import React, { useState, useEffect, useCallback } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { animated, useSpring } from 'react-spring';
import { Animated } from 'react-native';
import MediaPlayer from '../../components/MediaPlayer';
import CommentFeed from '../../components/CommentFeed';
import ProfilePanel from '../../components/ProfilePanel';
import TopPanel from '../../components/TopPanel';
import BottomPanel from '../../components/BottomPanel';
import { getFromS3 } from '../../utils/s3Utils';
import styles from './Feed.styles';
import radialGradientBg from '../../assets/images/radial_gradient_bg.png'
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type FeedNavigationProp = NavigationProp<RootStackParamList, 'Feed'>;

type LetterScale = {
  scale: Animated.AnimatedInterpolation<string | number>;
  opacity: Animated.AnimatedInterpolation<string | number>;
}[];

const Feed: React.FC<{ navigation: FeedNavigationProp }> = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [username, setUsername] = useState('');
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
  const [user, setUser] = useState<User | null>(null);
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
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
            username={user ? user.username : 'Default Username'} // or user.username ?? 'Default Username'
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
          />
           {isProfilePanelVisible && user && (
            <ProfilePanel
            isVisible={isProfilePanelVisible}
            onClose={() => setIsProfilePanelVisible(false)}
            profilePicUrl={user ? user.profilePic : ''}
            username={user ? user.username : ''}
            displayName={user ? user.displayName : ''}
            followersCount={ '0'} 
            followingCount={'0'} 
            onDarkModeToggle={() => {}} 
            user={user}
            navigation={navigation}
          />
          )}
          {isCommentFeedVisible && <CommentFeed mediaIndex={currentMediaIndex} />}
          {/* Render other components */}
        </ScrollView>
      )}
    </ImageBackground>
  );
};

export default Feed;