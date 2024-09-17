// Feed.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { fetchComments } from '../../../services/socialService';
import styles from './Feed.styles';
import CommentFeed from '../../../components/Modals/CommentFeed';
import MemeList from '../../../components/MediaPlayer/Logic/MemeList';
import { getToken } from '../../../stores/secureStore';
import { useUserStore, isEmptyUserState } from '../../../stores/userStore';
import { fetchUserDetails } from '../../../services/userService';
import { useMemes } from '../../../services/memeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_VIEWED_MEME_INDEX_KEY = 'lastViewedMemeIndex';
const LAST_VIEWED_MEME_KEY = 'lastViewedMemeId';

const Feed: React.FC = () => {
  const userStore = useUserStore();
  const { isDarkMode } = useTheme();
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currCommentsLength, setCurrCommentsLength] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const userEmail = userStore.email;
  // Load last viewed meme index on mount
  useEffect(() => {
    const loadLastViewedIndex = async () => {
      const savedIndex = await AsyncStorage.getItem(LAST_VIEWED_MEME_INDEX_KEY);
      if (savedIndex !== null) {
        setCurrentMediaIndex(Number(savedIndex));
      }
    };
    loadLastViewedIndex();
  }, []);

  // Handle meme viewed to save current position
  const handleMemeViewed = useCallback(
    async (memeId: string) => {
      if (userStore.email) {
        await AsyncStorage.setItem(LAST_VIEWED_MEME_KEY, memeId);
        await AsyncStorage.setItem(
          LAST_VIEWED_MEME_INDEX_KEY,
          currentMediaIndex.toString()
        );
      }
    },
    [userStore.email, currentMediaIndex]
  );

  // Load user data and access token
  useEffect(() => {
    const loadUserData = async () => {
      const token = await getToken('accessToken');
      console.log('Loaded token:', token);
      setAccessToken(token);
      if (token && userEmail && isEmptyUserState(userStore)) {
        const userDetails = await fetchUserDetails(userEmail, token);
        useUserStore.getState().setUserDetails(userDetails);
      }
    };
    loadUserData();
  }, [userEmail]);

  // Use the useMemes hook only when userEmail and accessToken are available
  const {
    memes,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = useMemes(userStore, accessToken);

  const updateCommentCount = useCallback(async (memeID: string) => {
    const updatedComments = await fetchComments(memeID);
    setCurrCommentsLength(updatedComments.length);
  }, []);

  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible((prev) => !prev);
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

  if (isLoading && memes.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}
      >
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>
            {error?.message || 'An error occurred'}
          </Text>
        </View>
      </View>
    );
  }

  if (!userStore || !accessToken) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
        ]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.centerText}>Loading user data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
      ]}
    >
      <MemeList
        memes={memes}
        user={userStore}
        onEndReached={handleEndReached}
        toggleCommentFeed={toggleCommentFeed}
        updateLikeStatus={updateLikeStatus}
        currentMediaIndex={currentMediaIndex}
        setCurrentMediaIndex={setCurrentMediaIndex}
        currentUserId={userStore.email}
        isCommentFeedVisible={isCommentFeedVisible}
        isLoadingMore={isLoading}
        numOfComments={currCommentsLength}
        handleMemeViewed={handleMemeViewed}
      />
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
};

export default Feed;
