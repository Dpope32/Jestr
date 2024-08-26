import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {debounce} from 'lodash';
import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../utils/userStore';
// import {fetchComments} from '../../components/Meme/memeService';

import styles from './Feed.styles';
import {RootStackParamList, User} from '../../types/types';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import MemeList from '../../components/MediaPlayer/MemeList';

// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';

const Feed: React.FC = () => {
  const {isDarkMode} = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useUserStore(state => state as User);

  const bgdColor = isDarkMode ? '#000' : '#1C1C1C';

  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // == CUSTOM HOOK for DATA in LISTING ==
  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} =
    useMemes();

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
      profilePicUrl={user.profilePic || ''}
      showLogo={true}
    />
  );

  // MemeList
  const renderMemeList = () => {
    return (
      <MemeList
        memes={memes}
        user={user}
        isDarkMode={isDarkMode}
        onEndReached={handleEndReached}
        toggleCommentFeed={toggleCommentFeed}
        currentMediaIndex={currentMediaIndex}
        setCurrentMediaIndex={setCurrentMediaIndex}
        currentUserId={user.email}
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={profilePanelVisible}
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
      {renderBottomPanel()}

      {/* == PROFILE PANEL == */}
      {profilePanelVisible && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => setProfilePanelVisible(false)}
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
          memeID={memes[currentMediaIndex].memeID}
          mediaIndex={currentMediaIndex}
          profilePicUrl={user.profilePic || ''}
          user={user}
          isCommentFeedVisible={isCommentFeedVisible}
          toggleCommentFeed={toggleCommentFeed}
          updateCommentCount={() => {
            // should get commentCount from BackEnd
          }}
        />
      )}
    </View>
  );
};

export default Feed;
