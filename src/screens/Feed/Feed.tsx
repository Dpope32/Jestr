import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {debounce} from 'lodash';
import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../store/userStore';
// import {fetchComments} from '../../components/Meme/memeService';

import styles from './Feed.styles';
import {User} from '../../types/types';
import {FeedNavProp} from '../../navigation/NavTypes/FeedTypes';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import MemeList from '../../components/MediaPlayer/MemeList';
import {useTabBarStore} from '../../store/tabBarStore';

// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';

const Feed: React.FC = () => {
  const {isDarkMode} = useTheme();
  const navigation = useNavigation<FeedNavProp>();
  const user = useUserStore(state => state as User);
  const setTabBarVisibility = useTabBarStore(
    state => state.setTabBarVisibility,
  );

  const bgdColor = isDarkMode ? '#000' : '#1C1C1C';

  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // == CUSTOM HOOK for DATA in LISTING ==
  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} =
    useMemes();

  // Toggle Profile Panel
  const toggleProfilePanel = useCallback(() => {
    setProfilePanelVisible(true);
    setTabBarVisibility(false);
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

  // Handle End Reached
  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  // Top Panel
  const renderTopPanel = () => (
    <TopPanel
      onProfileClick={toggleProfilePanel}
      showLogo={true}
      // TODO: move these to the TopPanel component
      profilePicUrl={user.profilePic || ''}
    />
  );

  // MemeList
  const renderMemeList = () => {
    return (
      <MemeList
        toggleCommentFeed={toggleCommentFeed}
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={profilePanelVisible}
        // TODO: move these to the MemeList component
        memes={memes}
        user={user}
        isDarkMode={isDarkMode}
        onEndReached={handleEndReached}
        currentMediaIndex={currentMediaIndex}
        setCurrentMediaIndex={setCurrentMediaIndex}
        currentUserId={user.email}
        isLoadingMore={isLoading}
        numOfComments={0}
      />
    );
  };

  // Bottom Panel
  const renderBottomPanel = () => <BottomPanel onHomeClick={handleHomeClick} />;

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={[styles.container, {backgroundColor: bgdColor}]}>
      {/* == TOP PANEL == */}
      {renderTopPanel()}

      {/* == MEME LIST == */}
      {renderMemeList()}

      {/* == BOTTOM PANEL == */}
      {/* should apply a linear gradient overlay for bottom half of screen */}
      {/* {renderBottomPanel()} */}

      {/* == PROFILE PANEL == */}
      {profilePanelVisible && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => {
            setProfilePanelVisible(false);
            setTabBarVisibility(true);
          }}
          // TODO: move these to the ProfilePanel component
          profilePicUrl={user.profilePic || null}
          username={user.username || ''}
          displayName={user.displayName || 'N/A'}
          user={user}
          navigation={navigation}
        />
      )}

      {/* == COMMENT FEED == */}
      {isCommentFeedVisible && memes[currentMediaIndex] && (
        <CommentFeed
          isCommentFeedVisible={isCommentFeedVisible}
          toggleCommentFeed={toggleCommentFeed}
          // TODO: move these to the CommentFeed component
          memeID={memes[currentMediaIndex].memeID}
          mediaIndex={currentMediaIndex}
          profilePicUrl={user.profilePic || ''}
          user={user}
          updateCommentCount={() => {
            // should get commentCount from BackEnd
          }}
        />
      )}
    </View>
  );
};

export default Feed;
