import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { fetchComments } from '../../../services/socialService';
import styles from './Feed.styles';
import CommentFeed from '../../../components/Modals/CommentFeed';
import MemeList from '../../../components/MediaPlayer/Logic/MemeList';
import { getToken } from '../../../stores/secureStore';
import { useUserStore, isEmptyUserState } from '../../../stores/userStore';
import { fetchUserDetails } from '../../../services/userService';
import { useMemes } from '../../../services/memeService';

const Feed: React.FC = React.memo(() => {
  const userStore = useUserStore();
  const { isDarkMode } = useTheme();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currCommentsLength, setCurrCommentsLength] = useState(0);

  const {memes, isLoading,isError,error,fetchNextPage,hasNextPage, refetch,handleMemeViewed,} = useMemes(userStore, accessToken);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const token = await getToken('accessToken');
        console.log('Loaded token:', token);
        setAccessToken(token);
        if (token && userStore.email && isEmptyUserState(userStore)) {
          const userDetails = await fetchUserDetails(userStore.email, token);
          useUserStore.getState().setUserDetails(userDetails);
        }
      };
      loadUserData();
    }, [userStore.email])
  );

  useFocusEffect(
    useCallback(() => {
      if (accessToken && memes.length === 0) {
        console.log('Triggering initial meme fetch');
        refetch();
      }
    }, [accessToken, memes.length, refetch])
  );

  const updateCommentCount = useCallback(async (memeID: string) => {
    const updatedComments = await fetchComments(memeID);
    setCurrCommentsLength(updatedComments.length);
  }, []);

  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible(prev => !prev);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage) {
      console.log('Fetching next page of memes');
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const updateLikeStatus = useCallback(
    (memeID: string, status: any, newLikeCount: number) => {
      console.log('Like status updated:', { memeID, status, newLikeCount });
    },
    []
  );

  const memoizedMemeList = useMemo(() => {
    if (memes.length === 0) return null;

    const memeListProps = {
      memes,
      user: userStore,
      isDarkMode,
      onEndReached: handleEndReached,
      toggleCommentFeed,
      updateLikeStatus,
      currentMediaIndex,
      setCurrentMediaIndex,
      currentUserId: userStore.email,
      isCommentFeedVisible,
      isLoadingMore: isLoading,
      numOfComments: currCommentsLength,
      handleMemeViewed,
    };

    return <MemeList {...memeListProps} />;
  }, [
    memes,
    userStore,
    isDarkMode,
    handleEndReached,
    toggleCommentFeed,
    updateLikeStatus,
    currentMediaIndex,
    isCommentFeedVisible,
    isLoading,
    currCommentsLength,
    handleMemeViewed
  ]);

  if (isLoading && memes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }]}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }]}>
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>{error?.message || 'An error occurred'}</Text>
        </View>
      </View>
    );
  }

  if (!userStore || !accessToken) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }]}>
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>Loading user data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }]}>
      {memoizedMemeList}
      {isCommentFeedVisible && memes[currentMediaIndex] && (
        <CommentFeed
          memeID={memes[currentMediaIndex].memeID}
          mediaIndex={currentMediaIndex}
          profilePicUrl={userStore.profilePic || ''}
          user={userStore}
          isCommentFeedVisible={isCommentFeedVisible}
          toggleCommentFeed={toggleCommentFeed}
          updateCommentCount={updateCommentCount}
        />
      )}
    </View>
  );
});

export default Feed;