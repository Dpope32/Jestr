import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {debounce, set} from 'lodash';
import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../utils/userStore';
import {getToken} from '../../utils/secureStore';
import {fetchComments} from '../../components/Meme/memeService';

import styles from './Feed.styles';
import {RootStackParamList, User} from '../../types/types';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import MemeList from '../../components/MediaPlayer/MemeList';

// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';

const Feed: React.FC = React.memo(() => {
  const {isDarkMode} = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useUserStore(state => state as User);

  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currCommentsLength, setCurrCommentsLength] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} = useMemes(
    user,
    accessToken,
  );

  // NOT NECESSARY, memes[currentMediaIndex].commentCount is appropiate and already available
  // to pass through props to child components
  // and would be the latest value from BackEnd
  const updateCommentCount = async (memeID: string) => {
    const updatedComments = await fetchComments(memeID);
    // console.log('Updated comments:', updatedComments.length);
    setCurrCommentsLength(updatedComments.length);
  };

  // useEffect(() => {
  //   console.log('Feed - Memes updated:', memes.length);
  // }, [memes]);

  useEffect(() => {
    console.log('Feed - Current media index changed:', currentMediaIndex);
    // console.log('memes[currentMediaIndex].memeID', memes[currentMediaIndex]);
    // if (memes[currentMediaIndex]) {
    //   console.log('111111');
    //   updateCommentCount(memes[currentMediaIndex].memeID);
    // }
  }, [currentMediaIndex, memes]);

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
    () => debounce(fetchMoreMemes, 500, {leading: true, trailing: false}),
    [fetchMoreMemes],
  );

  // Handle Home Click
  const handleHomeClick = useCallback(() => {
    fetchInitialMemes();
    setCurrentMediaIndex(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [fetchInitialMemes]);

  // Update Like Status
  const updateLikeStatus = useCallback(
    (memeID: string, status: any, newLikeCount: number) => {
      console.log('Like status updated:', {memeID, status, newLikeCount});
    },
    [],
  );

  // Handle End Reached
  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  // Memoized Top Panel
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
    [
      user.profilePic,
      user.username,
      user.isAdmin,
      toggleProfilePanel,
      navigation,
    ],
  );

  // Memoized MemeList
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

  // Memoized Bottom Panel
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

  // Rendering
  // if (isLoading && memes.length === 0) {
  //   return <LoadingText />;
  // }

  if (error) {
    return <Text>{error}</Text>;
  }

  // if (!user || !accessToken) {
  //   return <Text>User or access token not available</Text>;
  // }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000' : '#1C1C1C'},
      ]}>
      {/* == TOP PANEL == */}
      {memoizedTopPanel}

      {/* == MEME LIST == */}
      {memoizedMemeList}

      {/* == BOTTOM PANEL == */}
      {memoizedBottomPanel}

      {/* == PROFILE PANEL == */}
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

      {/* == COMMENT FEED == */}
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
