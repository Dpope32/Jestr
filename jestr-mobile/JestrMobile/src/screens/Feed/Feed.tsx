import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import MediaPlayer from '../../components/MediaPlayer';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import styles from './Feed.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMemes, getLikeStatus } from '../../components/Meme/memeService';
import { useNavigation } from '@react-navigation/native';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import { Image } from 'react-native';
import CommentFeed from '../../components/Modals/CommentFeed';

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
  followersCount: number;
  followingCount: number;
  Bio: string;
  bio?: string; // Include this to handle lowercase 'bio'
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
  shareCount: number;
  profilePicUrl: string;
  memeUser: User; // Add this line
};

const Feed: React.FC<{ route: any }> = ({ route }) => {
  const { user } = route.params || {};
  const navigation = useNavigation();
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [profilePicUrl, setProfilePicUrl] = useState(user ? user.profilePic : '');
  const [memes, setMemes] = useState<Meme[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState<boolean>(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memeLikeStatuses, setMemeLikeStatuses] = useState<Record<string, { liked: boolean; doubleLiked: boolean }>>({});

  useEffect(() => {
    console.log('Received user in Feed:', user);
  }, []);

  useEffect(() => {
    const fetchLikeStatuses = async () => {
      if (user) {
        const statuses: Record<string, { liked: boolean; doubleLiked: boolean }> = {};
        for (let meme of memes) {
          const status = await getLikeStatus(meme.memeID, user.email);
          statuses[meme.memeID] = status;
        }
        setMemeLikeStatuses(statuses);
      }
    };
    fetchLikeStatuses();
  }, [user, memes]);

  const onLikeStatusChange = (memeID: string, status: { liked: boolean; doubleLiked: boolean }) => {
    setMemeLikeStatuses(prev => ({
      ...prev,
      [memeID]: status
    }));
  };

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
        }
      } catch (error) {
        console.error('Error retrieving user from AsyncStorage:', error);
      }
    };

    fetchUser();
    fetchInitialMemes();
  }, []);

  const fetchInitialMemes = async () => {
    setIsLoading(true);
    const result = await fetchMemes();
    setMemes(result.memes);
    setLastEvaluatedKey(result.lastEvaluatedKey);
    setIsLoading(false);
  };

  const fetchMoreMemes = async () => {
    if (isLoading || !lastEvaluatedKey) return;
    setIsLoading(true);
    const result = await fetchMemes(lastEvaluatedKey); // Remove JSON.stringify
    setMemes(prevMemes => [...prevMemes, ...result.memes]);
    setLastEvaluatedKey(result.lastEvaluatedKey);
    setIsLoading(false);
  };

  const goToPrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const goToNextMedia = () => {
    if (currentMediaIndex < memes.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
    if (currentMediaIndex === memes.length - 3 && !isLoading) {
      fetchMoreMemes();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <TopPanel
          onProfileClick={toggleProfilePanel}
          profilePicUrl={localUser ? localUser.profilePic : ''}
          username={localUser ? localUser.username : 'Default Username'}
          enableDropdown={true} // Enable dropdown only where needed
          showLogo={true} // Show logo in Feed
        />
        {profilePanelVisible && localUser && (
          <ProfilePanel
            isVisible={profilePanelVisible}
            onClose={() => setProfilePanelVisible(false)}
            profilePicUrl={localUser.profilePic}
            username={localUser.username}
            displayName={localUser.displayName || 'N/A'}
            followersCount={localUser.followersCount}
            followingCount={localUser.followingCount}
            onDarkModeToggle={() => console.log("Dark Mode Toggle")}
            user={localUser}
            navigation={navigation}
          />
        )}
        {memes.length > 0 ? (
          <>
            <MediaPlayer
              memeUser={memes[currentMediaIndex].memeUser} // Ensure this data is correctly passed
              user={localUser}
              prevMedia={memes[currentMediaIndex - 1] ? memes[currentMediaIndex - 1].url : null}
              currentMedia={memes[currentMediaIndex].url}
              nextMedia={memes[currentMediaIndex + 1] ? memes[currentMediaIndex + 1].url : null}
              handleLike={() => { }}
              handleDownload={() => { }}
              likedIndices={new Set()}
              doubleLikedIndices={new Set()}
              downloadedIndices={new Set()}
              likeDislikeCounts={{}}
              currentMediaIndex={currentMediaIndex}
              toggleCommentFeed={toggleCommentFeed}
              goToPrevMedia={goToPrevMedia}
              goToNextMedia={goToNextMedia}
              username={memes[currentMediaIndex].username}
              caption={memes[currentMediaIndex].caption}
              uploadTimestamp={memes[currentMediaIndex].uploadTimestamp}
              memeID={memes[currentMediaIndex].memeID}
              likeCount={memes[currentMediaIndex].likeCount}
              downloadCount={memes[currentMediaIndex].downloadCount}
              shareCount={memes[currentMediaIndex].shareCount}
              commentCount={memes[currentMediaIndex].commentCount}
              profilePicUrl={memes[currentMediaIndex].profilePicUrl}
              initialLikeStatus={memeLikeStatuses[memes[currentMediaIndex].memeID] || { liked: false, doubleLiked: false }}
              onLikeStatusChange={onLikeStatusChange}
            />
            {isCommentFeedVisible && (
              <CommentFeed
                key={`${memes[currentMediaIndex].memeID}-${isCommentFeedVisible}`}
                memeID={memes[currentMediaIndex].memeID}
                mediaIndex={currentMediaIndex}
                profilePicUrl={localUser ? localUser.profilePic : ''}
                user={localUser}
                isCommentFeedVisible={isCommentFeedVisible}
                toggleCommentFeed={toggleCommentFeed}
              />
            )}
          </>
        ) : (
          <Text>No memes available</Text>
        )}

        <BottomPanel
          onHomeClick={() => { }}
          handleLike={() => { }}
          handleDislike={() => { }}
          likedIndices={new Set()}
          dislikedIndices={new Set()}
          likeDislikeCounts={{}}
          currentMediaIndex={currentMediaIndex}
          toggleCommentFeed={() => { }}
          user={localUser}
        />
      </ScrollView>
    </View>
  );
};

export default Feed;
