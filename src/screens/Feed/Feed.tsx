import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { debounce } from 'lodash';
import { useTheme } from '../../theme/ThemeContext';
import { useUserStore } from '../../utils/userStore';
import { useMemes } from './useMemes';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import MemeList from '../../components/MediaPlayer/MemeList';
import styles from './Feed.styles';
import { RootStackParamList, User } from '../../types/types';
import { getToken } from '../../utils/secureStore';

const Feed: React.FC = React.memo(() => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const user = useUserStore(state => state as User);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const { memes, isLoading, isLoadingMore, error, fetchMoreMemes, fetchInitialMemes } = useMemes(user, accessToken);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Fetch access token
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken('accessToken');
      setAccessToken(token);
    };
    fetchToken();
  }, []);

  // Toggle Profile Panel
  const toggleProfilePanel = useCallback(() => {
    setProfilePanelVisible(prev => !prev);
  }, []);

  // Toggle Comment Feed
  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible(prev => !prev);
  }, []);

  // Debounced Fetch More Memes
  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, { leading: true, trailing: false }),
    [fetchMoreMemes]
  );

  // Handle Home Click
  const handleHomeClick = useCallback(() => {
    fetchInitialMemes();
    setCurrentMediaIndex(0);
  }, [fetchInitialMemes]);

  // Update Like Status
  const updateLikeStatus = useCallback((memeID: string, status: any, newLikeCount: number) => {
    console.log('Like status updated:', { memeID, status, newLikeCount });
  }, []);

  // Handle End Reached
  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoadingMore, memes.length, debouncedFetchMoreMemes]);

  // Go to Next Media
  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndex((prevIndex) => {
      const nextIndex = Math.min(memes.length - 1, prevIndex + 1);
      if (nextIndex === memes.length - 1) {
        handleEndReached();
      }
      return nextIndex;
    });
  }, [memes.length, handleEndReached]);

  // Go to Previous Media
  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndex((prevIndex) => Math.max(0, prevIndex - 1));
  }, []);

  // Memoized Top Panel
  const memoizedTopPanel = useMemo(() => (
    <TopPanel
      onProfileClick={toggleProfilePanel}
      profilePicUrl={user.profilePic || ''}
      username={user.username || ''}
      enableDropdown={true}
      showLogo={true}
      isAdmin={user.isAdmin || false}
      isUploading={false}
      onAdminClick={() => navigation.navigate('AdminPage')}
    />
  ), [user.profilePic, user.username, user.isAdmin, toggleProfilePanel, navigation]);

  // Memoized MemeList
  const memoizedMemeList = useMemo(() => (
    <MemeList
      memes={memes}
      user={user}
      isDarkMode={isDarkMode}
      onEndReached={handleEndReached}
      toggleCommentFeed={toggleCommentFeed}
      updateLikeStatus={updateLikeStatus}
      currentMediaIndex={currentMediaIndex}
      setCurrentMediaIndex={setCurrentMediaIndex}
      currentUserId={user.email}
    />
  ), [memes, user, isDarkMode, handleEndReached, toggleCommentFeed, updateLikeStatus, currentMediaIndex]);

  // Memoized Bottom Panel
  const memoizedBottomPanel = useMemo(() => (
    <BottomPanel
      onHomeClick={handleHomeClick}
      currentMediaIndex={currentMediaIndex}
      toggleCommentFeed={toggleCommentFeed}
      user={user}
    />
  ), [handleHomeClick, currentMediaIndex, toggleCommentFeed, user]);

  // Rendering
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!user || !accessToken) {
    return <Text>User or access token not available</Text>;
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {memoizedTopPanel}
      {memoizedMemeList}
      {memoizedBottomPanel}
      {profilePanelVisible && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => setProfilePanelVisible(false)}
          profilePicUrl={user.profilePic || null}
          username={user.username || ''}
          displayName={user.displayName || 'N/A'}
          followersCount={user.followersCount || 0}
          followingCount={user.followingCount || 0}
          user={user}
          navigation={navigation}
        />
      )}
      {isCommentFeedVisible && memes[currentMediaIndex] && (
        <CommentFeed
          memeID={memes[currentMediaIndex].memeID}
          mediaIndex={currentMediaIndex}
          profilePicUrl={user.profilePic || ''}
          user={user}
          isCommentFeedVisible={isCommentFeedVisible}
          toggleCommentFeed={toggleCommentFeed}
          updateCommentCount={() => {}}
        />
      )}
    </View>
  );
});

export default Feed;
