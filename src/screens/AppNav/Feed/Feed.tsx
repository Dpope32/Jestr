import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {View, Text} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {debounce} from 'lodash';
// import * as Haptics from 'expo-haptics';

import {useTheme} from '../../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../../stores/userStore';
import {getToken} from '../../../stores/secureStore';
import {fetchComments} from '../../../services/socialService';
import {fetchUserDetails} from '../../../services/userService';

import styles from './Feed.styles';
import {isEmptyUserState} from '../../../stores/userStore';
import CommentFeed from '../../../components/Modals/CommentFeed';
import MemeList from '../../../components/MediaPlayer/Logic/MemeList';
// import ProfilePanel from '../../../components/Panels/ProfilePanel';
// import {logStorageContents} from '../../../utils/debugUtils';

const Feed: React.FC = React.memo(() => {
  const userStore = useUserStore();
  const {isDarkMode} = useTheme();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} = useMemes(
    userStore,
    accessToken,
  );
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [currCommentsLength, setCurrCommentsLength] = useState(0);

  // !!! profilePanelVisible to be removed, replaced by Drawer Navigation
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);

  // console.log('Feed - User:', userStore);
  // console.log('Feed - Memes:', memes);
  // console.log('Feed - accessToken:', accessToken);

  const isFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      if (memes.length === 0) {
        fetchInitialMemes();
      }
      return () => {
        isFocused.current = false;
      };
    }, [fetchInitialMemes, memes.length]),
  );

  useEffect(() => {
    fetchInitialMemes();
  }, []);

  const updateCommentCount = useCallback(async (memeID: string) => {
    const updatedComments = await fetchComments(memeID);
    setCurrCommentsLength(updatedComments.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const token = await getToken('accessToken');
        setAccessToken(token);
        if (token && userStore.email && isEmptyUserState(userStore)) {
          const userDetails = await fetchUserDetails(userStore.email, token);
          useUserStore.getState().setUserDetails(userDetails);
        }
      };
      loadUserData();
      //  logStorageContents();
    }, [userStore.email]),
  );

  // const toggleProfilePanel = useCallback(() => {
  //   setProfilePanelVisible(prev => !prev);
  // }, []);

  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible(prev => !prev);
  }, []);

  const debouncedFetchMoreMemes = useMemo(
    () =>
      debounce(
        () => {
          if (isFocused.current) {
            fetchMoreMemes();
          }
        },
        500,
        {leading: true, trailing: false},
      ),
    [fetchMoreMemes],
  );

  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0 && isFocused.current) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  // const handleHomeClick = useCallback(() => {
  //   if (isFocused.current) {
  //     fetchInitialMemes();
  //     setCurrentMediaIndex(0);
  //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  //   }
  // }, [fetchInitialMemes]);

  const updateLikeStatus = useCallback(
    (memeID: string, status: any, newLikeCount: number) => {
      console.log('Like status updated:', {memeID, status, newLikeCount});
    },
    [],
  );

  // const memoizedTopPanel = useMemo(
  //   () => (
  //     <TopPanel
  //       onProfileClick={toggleProfilePanel}
  //       profilePicUrl={userStore.profilePic || ''}
  //       username={userStore.username || ''}
  //       enableDropdown={true}
  //       showLogo={true}
  //       isAdmin={userStore.isAdmin || false}
  //       isUploading={false}
  //       onAdminClick={() => {
  //         if (navigation) {
  //           navigation.navigate('AdminPage');
  //         } else {
  //           console.warn('Navigation object is not available');
  //         }
  //       }}
  //     />
  //   ),
  //   [
  //     userStore.profilePic,
  //     userStore.username,
  //     userStore.isAdmin,
  //     toggleProfilePanel,
  //     navigation,
  //   ],
  // );

  const memoizedMemeList = useMemo(() => {
    //  console.log('Feed - Rendering MemeList with', memes.length, 'memes');
    return (
      <MemeList
        memes={memes}
        user={userStore}
        isDarkMode={isDarkMode}
        onEndReached={handleEndReached}
        toggleCommentFeed={toggleCommentFeed}
        updateLikeStatus={updateLikeStatus}
        currentMediaIndex={currentMediaIndex}
        setCurrentMediaIndex={setCurrentMediaIndex}
        currentUserId={userStore.email}
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={profilePanelVisible}
        isLoadingMore={isLoading}
        numOfComments={currCommentsLength}
      />
    );
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
  ]);

  // const memoizedBottomPanel = useMemo(
  //   () => (
  //     <BottomPanel
  //       onHomeClick={handleHomeClick}
  //       currentMediaIndex={currentMediaIndex}
  //       toggleCommentFeed={toggleCommentFeed}
  //       user={userStore}
  //     />
  //   ),
  //   [handleHomeClick, currentMediaIndex, toggleCommentFeed, userStore],
  // );

  if (isLoading && memes.length === 0) {
    return <Text>Loading...</Text>;
  }

  if (memes.length === 0) {
    return <Text>Out of memes</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!userStore || !accessToken) {
    return <Text>User or access token not available</Text>;
  }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000' : '#1C1C1C'},
      ]}>
      {/* {memoizedTopPanel} */}

      {memoizedMemeList}
      {/* {memoizedBottomPanel} */}
      {/* {profilePanelVisible && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => setProfilePanelVisible(false)}
          profilePicUrl={userStore.profilePic || null}
          username={userStore.username || ''}
          displayName={userStore.displayName || 'N/A'}
          followersCount={userStore.followersCount || 0}
          followingCount={userStore.followingCount || 0}
          user={userStore}
          navigation={navigation ? navigation : undefined}
        />
      )} */}
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
