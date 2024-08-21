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

const Feed: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();
  const user = useUserStore(state => state as User);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const { memes, isLoading, isLoadingMore, error, fetchMoreMemes, fetchInitialMemes } = useMemes(user, accessToken);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);


  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken('accessToken');
      setAccessToken(token);
    };
    fetchToken();
  }, []);
  



  const toggleProfilePanel = useCallback(() => {
    setProfilePanelVisible(prev => !prev);
  }, []);

  const toggleCommentFeed = useCallback(() => {
    setIsCommentFeedVisible(prev => !prev);
  }, []);

  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, { leading: true, trailing: false }),
    [fetchMoreMemes]
  );

  const handleHomeClick = useCallback(() => {
    fetchInitialMemes();
    setCurrentMediaIndex(0);
  }, [fetchInitialMemes]);

  const updateLikeStatus = useCallback((memeID: string, status: any, newLikeCount: number) => {
    // Implement this function to update like status
    console.log('Like status updated:', { memeID, status, newLikeCount });
  }, []);

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && memes.length > 0) {
      console.log('Fetching more memes...');
      fetchMoreMemes();
    }
  }, [isLoadingMore, memes.length, fetchMoreMemes]);

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndex((prevIndex) => {
      const nextIndex = Math.min(memes.length - 1, prevIndex + 1);
      console.log('Going to next media. New index:', nextIndex);
      if (nextIndex === memes.length - 1) {
        handleEndReached();
      }
      return nextIndex;
    });
  }, [memes.length, handleEndReached]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndex((prevIndex) => {
      const nextIndex = Math.max(0, prevIndex - 1);
      console.log('Going to previous media. New index:', nextIndex);
      return nextIndex;
    });
  }, []);


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
      <MemeList
        memes={memes}
        user={user}
        isDarkMode={isDarkMode}
        onEndReached={handleEndReached}
        toggleCommentFeed={toggleCommentFeed}
        updateLikeStatus={updateLikeStatus}
        goToNextMedia={goToNextMedia}
        goToPrevMedia={goToPrevMedia}
        currentMediaIndex={currentMediaIndex}
        setCurrentMediaIndex={setCurrentMediaIndex}
        currentUserId={user.email} // Add this line
      />
      <BottomPanel
        onHomeClick={handleHomeClick}
        currentMediaIndex={currentMediaIndex}
        toggleCommentFeed={toggleCommentFeed}
        user={user}
      />
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
          key={user.followingCount}
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
};

export default Feed;