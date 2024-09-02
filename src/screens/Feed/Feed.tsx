import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { debounce } from 'lodash';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { useMemes } from './useMemes';
import { useUserStore } from '../../utils/userStore';
import { getToken } from '../../utils/secureStore';
import { logStorageContents } from '../../utils/debugUtils';
import { fetchComments } from '../../components/Meme/memeService';
import { fetchUserDetails } from '../../services/authFunctions';

import styles from './Feed.styles';
import { RootStackParamList, User } from '../../types/types';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import MemeList from '../../components/MediaPlayer/MemeList';

const Feed: React.FC = React.memo(() => {
  const route = useRoute<RouteProp<RootStackParamList, 'Feed'>>();
  const userParams = route.params?.user ?? {};
  const userStore = useUserStore(state => state as User);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [user, setUser] = useState<User>({ ...userStore, ...userParams });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const { memes, isLoading, error, fetchMoreMemes, fetchInitialMemes } = useMemes(
    user,
    accessToken,
  );
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currCommentsLength, setCurrCommentsLength] = useState(0);

  const updateCommentCount = async (memeID: string) => {
    const updatedComments = await fetchComments(memeID);
    setCurrCommentsLength(updatedComments.length);
  };

  useEffect(() => {
    console.log('Feed - Current media index changed:', currentMediaIndex);
  }, [currentMediaIndex, memes]);

  useEffect(() => {
    const loadUserData = async () => {
      const token = await getToken('accessToken');
      setAccessToken(token);
      if (token && user.email) {
        const userDetails = await fetchUserDetails(user.email, token);
        setUser(prevUser => ({ ...prevUser, ...userDetails }));
        useUserStore.getState().setUserDetails(userDetails);
      }
    };
    loadUserData();
    logStorageContents();
  }, [user.email]);

  const toggleProfilePanel = useCallback(() => {
    setProfilePanelVisible(prev => !prev);
  }, []);

  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible(prev => !prev);
  }, []);

  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, { leading: true, trailing: false }),
    [fetchMoreMemes],
  );

  const handleHomeClick = useCallback(() => {
    fetchInitialMemes();
    setCurrentMediaIndex(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [fetchInitialMemes]);

  const updateLikeStatus = useCallback(
    (memeID: string, status: any, newLikeCount: number) => {
      console.log('Like status updated:', { memeID, status, newLikeCount });
    },
    [],
  );

  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  const memoizedTopPanel = useMemo(
    () => (
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
    ),
    [user.profilePic, user.username, user.isAdmin, toggleProfilePanel, navigation],
  );

  const memoizedMemeList = useMemo(() => {
    console.log('Feed - Rendering MemeList with', memes.length, 'memes');
    return (
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
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={profilePanelVisible}
        isLoadingMore={isLoading}
        numOfComments={currCommentsLength}
      />
    );
  }, [
    memes,
    user,
    isDarkMode,
    handleEndReached,
    toggleCommentFeed,
    updateLikeStatus,
    currentMediaIndex,
    isCommentFeedVisible,
    profilePanelVisible,
    isLoading,
    currCommentsLength,
  ]);

  const memoizedBottomPanel = useMemo(
    () => (
      <BottomPanel
        onHomeClick={handleHomeClick}
        currentMediaIndex={currentMediaIndex}
        toggleCommentFeed={toggleCommentFeed}
        user={user}
      />
    ),
    [handleHomeClick, currentMediaIndex, toggleCommentFeed, user],
  );

  if (isLoading && memes.length === 0) {
    return <Text>Loading...</Text>;
  }

  if (memes.length === 0) {
    return <Text>Out of memes</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!user || !accessToken) {
    return <Text>User or access token not available</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
      ]}>
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
          updateCommentCount={updateCommentCount}
        />
      )}
    </View>
  );
});

export default Feed;