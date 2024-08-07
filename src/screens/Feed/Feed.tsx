import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Dimensions, StyleSheet, Text, ViewStyle } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSadTear } from '@fortawesome/free-solid-svg-icons';
import { FlashList } from '@shopify/flash-list';
import { CommonActions } from '@react-navigation/native';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import TopPanel from '../../components/Panels/TopPanel';
import BottomPanel from '../../components/Panels/BottomPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import CommentFeed from '../../components/Modals/CommentFeed';
import styles from './Feed.styles';
import { fetchMemes, getLikeStatus } from '../../components/Meme/memeService';
import { User, Meme, OnViewableItemsChanged } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { debounce } from 'lodash';
import ErrorBoundary from '../../components/ErrorBoundary';
import isEqual from 'lodash/isEqual';
import { useUserStore } from '../userStore';
import { handleSignOut } from '../../services/authFunctions';

const { height, width } = Dimensions.get('window');

const Feed: React.FC<{ route: { params: { user?: User } } }> = ({ route }) => {
  const user = useUserStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const userState = useUserStore();
  const [localUser, setLocalUser] = useState<User | null>(() => {
    if (!userState) return null;
    return {
      ...userState,
      profilePic: userState.profilePic || '', // Remove .uri
      headerPic: userState.headerPic || '',   // Remove .uri
    } as User;
  });
  const [memes, setMemes] = useState<Meme[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [allMemesViewed, setAllMemesViewed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [memeLikeStatuses, setMemeLikeStatuses] = useState<Record<string, { liked: boolean; doubleLiked: boolean }>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const isFetchingMore = useRef(false);

  useEffect(() => {
    console.log('Feed component mounted');
    console.log('User object:', JSON.stringify(user, null, 2));
    const initializeFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          useUserStore.getState().setUserDetails(parsedUser);
        }
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (!storedUser || !storedToken) {
          throw new Error('User data or access token not found in storage');
        }
        const parsedUser = JSON.parse(storedUser);
        setLocalUser(parsedUser);
        setAccessToken(storedToken);
  
        if (parsedUser.email && storedToken) {
          await fetchInitialMemes(parsedUser.email, storedToken);
        } else {
          throw new Error('User email or access token is missing');
        }
      } catch (error) {
        console.error('Error initializing feed:', error);
        setError('Failed to initialize feed. Please try again.');
        await handleSignOut();
        await AsyncStorage.clear(); // Clear all stored data
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'LandingPage' }],
          })
        );
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeFeed();
  }, []);
  
  

  const clearStoredData = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('idToken');
  };



  const fetchInitialMemes = async (email: string, token: string) => {
    setIsLoading(true);
    setMemes([]);
    setLastEvaluatedKey(null);
    setAllMemesViewed(false);
    try {
      const result = await fetchMemes(null, email, 5, token);
      if (result.memes.length === 0) {
        setAllMemesViewed(true);
      } else {
        setMemes(result.memes);
        setLastEvaluatedKey(result.lastEvaluatedKey);
        updateLikeStatuses(result.memes);
      }
      console.log('Initial memes Count:', result.memes.length);
    } catch (error) {
      console.error('Error fetching initial memes:', error);
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMoreMemes = useCallback(async () => {
    if (isFetchingMore.current || allMemesViewed || !localUser?.email || !accessToken) return;
    isFetchingMore.current = true;
    try {
      const result = await fetchMemes(lastEvaluatedKey, localUser.email, 5, accessToken);
      if (result.memes.length === 0) {
        setAllMemesViewed(true);
      } else {
        setMemes(prevMemes => {
          const newMemes = [...prevMemes, ...result.memes];
          const uniqueMemes = Array.from(new Map(newMemes.map(meme => [meme.memeID, meme])).values());
          console.log('Updated memes Count:', uniqueMemes.length);
          return uniqueMemes;
        });
        setLastEvaluatedKey(result.lastEvaluatedKey);
        updateLikeStatuses(result.memes);
      }
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      isFetchingMore.current = false;
    }
  }, [allMemesViewed, localUser, accessToken, lastEvaluatedKey]);

  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, { leading: true, trailing: false }),
    [fetchMoreMemes]
  );

  const handleHomeClick = useCallback(() => {
    console.log('Home clicked, fetching initial memes');
    setIsLoading(true);
    if (localUser && accessToken) {
      fetchInitialMemes(localUser.email, accessToken);
    } else {
      console.error('User or access token not available');
      setIsLoading(false);
    }
  }, [localUser, accessToken]);
  

  const updateLikeStatuses = useCallback(async (newMemes: Meme[]) => {
    if (!localUser) return;
    const statusPromises = newMemes.map(meme => 
      getLikeStatus(meme.memeID, localUser.email)
        .then(status => ({ [meme.memeID]: status }))
        .catch(error => {
          console.error('Error fetching like status:', error);
          return null;
        })
    );
  
    const statuses = await Promise.all(statusPromises);
    const validStatuses = statuses.filter(Boolean);
    
    setMemeLikeStatuses(prev => ({
      ...prev,
      ...Object.assign({}, ...validStatuses)
    }));
  }, [localUser]);


const updateCommentCount = useCallback((memeID: string, newCount: number) => {
  setCommentCounts(prev => ({ ...prev, [memeID]: newCount }));
}, []);


const toggleProfilePanel = useCallback(() => {
  setProfilePanelVisible(prev => !prev);
}, []);


const toggleCommentFeed = useCallback(() => {
  setIsCommentFeedVisible(prev => !prev);
}, []);


const renderItem = useCallback(({ item, index }: { item: Meme; index: number }) => {
  const prevMedia = index > 0 ? memes[index - 1].url : null;
  const nextMedia = index < memes.length - 1 ? memes[index + 1].url : null;

  return (
    <MediaPlayer
      memeUser={{
        email: item.email,
        username: item.username,
        profilePic: item.profilePicUrl,
      }}
      currentMedia={item.url}
      mediaType={item.mediaType}
      prevMedia={prevMedia}
      nextMedia={nextMedia}
      username={item.username}
      caption={item.caption}
      uploadTimestamp={item.uploadTimestamp}
      handleLike={() => {}}
      handleDownload={() => {}}
      toggleCommentFeed={toggleCommentFeed}
      goToPrevMedia={() => setCurrentMediaIndex(prev => Math.max(0, prev - 1))}
      goToNextMedia={() => {
        setCurrentMediaIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= memes.length - 2) {
            debouncedFetchMoreMemes();
          }
          return Math.min(memes.length - 1, nextIndex);
        });
      }}
      currentMediaIndex={index}
      user={localUser}
      likeCount={item.likeCount}
      downloadCount={item.downloadCount}
      commentCount={commentCounts[item.memeID] || item.commentCount}
      shareCount={item.shareCount}
      profilePicUrl={item.profilePicUrl}
      memeID={item.memeID}
      liked={memeLikeStatuses[item.memeID]?.liked || false}
      doubleLiked={memeLikeStatuses[item.memeID]?.doubleLiked || false}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      onLikeStatusChange={(memeID, status, newLikeCount) => {
        setMemeLikeStatuses(prev => ({ ...prev, [memeID]: status }));
        setMemes(prev => prev.map(meme => meme.memeID === memeID ? { ...meme, LikeCount: newLikeCount } : meme));
      }}
      initialLikeStatus={memeLikeStatuses[item.memeID] || { liked: false, doubleLiked: false }}
      likedIndices={new Set()}
      doubleLikedIndices={new Set()}
      downloadedIndices={new Set()}
      likeDislikeCounts={{}}
    />
  );
}, [memes, localUser, isDarkMode, memeLikeStatuses, commentCounts, toggleCommentFeed, debouncedFetchMoreMemes]);

const handleAdminClick = () => {
  navigation.navigate('AdminPage');
};


useEffect(() => {
  if (currentMediaIndex >= memes.length - 2 && !isLoadingMore && !allMemesViewed) {
    console.log('fetchingMoreMemes');
    debouncedFetchMoreMemes();
  }
}, [currentMediaIndex, memes.length, isLoadingMore, allMemesViewed, debouncedFetchMoreMemes]);

const keyExtractor = useCallback((item: Meme, index: number) => `${item.memeID}-${index}`, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: OnViewableItemsChanged) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentMediaIndex(viewableItems[0].index);
    }
  }, []);

  const memoizedMemes = useDeepCompareMemo(memes);

  function useDeepCompareMemo<T>(value: T): T {
    const ref = useRef<T>(value);
    
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
    
    return ref.current;
  }
  
  const memoizedFlashList = useMemo(() => (
    <FlashList
      data={memes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={height}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled={true}
      initialScrollIndex={currentMediaIndex}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50
      }}
      removeClippedSubviews={true}
    />
  ), [memoizedMemes, renderItem, keyExtractor, debouncedFetchMoreMemes, currentMediaIndex, onViewableItemsChanged]);
  

  if (isLoading) {
    return (
      <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/animations/loading-animation.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Loading Memes...</Text>
        </View>
      </BlurView>
    );
  }

if (error) {
  return (
    <View style={styles.centerEverything}>
      <Text style={styles.errorText}>{`Error: ${error}`}</Text>
      <Text style={styles.errorDetails}>{`User: ${localUser ? JSON.stringify(localUser) : 'Not set'}`}</Text>
      <Text style={styles.errorDetails}>{`Token: ${accessToken ? 'Set' : 'Not set'}`}</Text>
    </View>
  );
}

//  console.log('Rendering Feed component');
//  console.log('Local user:', localUser);
 // console.log('Memes count:', memes.length);

  return (
    <ErrorBoundary>
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TopPanel
        onProfileClick={toggleProfilePanel}
        profilePicUrl={localUser?.profilePic || ''}
        username={localUser?.username || ''}
        enableDropdown={true}
        showLogo={true}
        isAdmin={localUser?.isAdmin || false}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isUploading={false}
        onAdminClick={handleAdminClick}
/>
      {memes.length === 0 ? (
        <View style={styles.noMemesContainer}>
          <FontAwesomeIcon icon={faSadTear} size={50} color="#1bd40b" />
          <Text style={styles.noMemesText}>Damn dude You've scrolled to the end of the DB</Text>
          <Text style={styles.noMemesSubText}>Time to go outside and touch some grass</Text>
        </View>
      ) : (
        <View style={styles.flash}>
          {memoizedFlashList}
        </View>
      )}
      <BottomPanel
        onHomeClick={handleHomeClick}
        handleLike={() => {}}
        handleDislike={() => {}}
        likedIndices={new Set()}
        dislikedIndices={new Set()}
        likeDislikeCounts={{}}
        currentMediaIndex={currentMediaIndex}
        toggleCommentFeed={toggleCommentFeed}
        user={localUser}
      />
      {profilePanelVisible && (
        <View style={styles.overlay} />
      )}
      {profilePanelVisible && localUser && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => setProfilePanelVisible(false)}
          profilePicUrl={localUser.profilePic}
          username={localUser.username}
          displayName={localUser.displayName || 'N/A'}
          followersCount={localUser.followersCount}
          followingCount={localUser.followingCount}
          onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
          user={localUser}
          navigation={navigation}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}

      {isCommentFeedVisible && currentMediaIndex < memes.length && (
        <CommentFeed
          memeID={memes[currentMediaIndex].memeID}
          mediaIndex={currentMediaIndex}
          profilePicUrl={localUser?.profilePic || ''}
          user={localUser}
          isCommentFeedVisible={isCommentFeedVisible}
          toggleCommentFeed={toggleCommentFeed}
          updateCommentCount={updateCommentCount}
        />
      )}
    </View>
    </ErrorBoundary>
  );
};

export default Feed;