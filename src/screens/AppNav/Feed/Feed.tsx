import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {FlatList, AppState, Animated, Platform} from 'react-native';
import {Video, ResizeMode} from 'expo-av';
import {Image} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useQueryClient} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {User, Meme} from '../../../types/types';
import styles, {
  ListEmptyComponent,
  screenHeight,
  ViewableItemsType,
  LoadingComponent,
} from './componentData';
import {ErrorComponent, NoDataComponent} from './componentData';
import {getToken} from '../../../stores/secureStore';
import {useUserStore} from '../../../stores/userStore';
import {useFetchMemes} from './useFetchMemes';
import {pruneCache} from './useFetchMemes';
import {storage} from '../../../utils/mmkvPersister';
import {useLikeMutation} from './useLikeMutation';
import {updateMemeReaction} from '../../../services/memeService';
import {ShareType} from '../../../types/types';
import {useTheme} from '../../../theme/ThemeContext';
// import {handleShareMeme} from '../../../services/memeService';
// import useLogPersistedData from '../../../utils/useLogPersistedData';

import LeftContentFeed from '../../../components/LeftContentFeed/LeftContentFeed';
import RightContentFeed from '../../../components/RightContentFeed/RightContentFeed';
import LikeAnimation from './LikeAnimation';
import {LongPressModal} from '../../../components/MediaPlayer/LongPress/LongPressModal';
import ShareModal from '../../../components/Modals/ShareModal';
import CommentFeed from '../../../components/Modals/CommentFeed/CommentFeed';

const viewabilityConfig = {itemVisiblePercentThreshold: 50};

const Feed: React.FC = () => {
  const queryClient = useQueryClient();
  const userStore = useUserStore();
  const userEmail = userStore.email;
  const likeMutation = useLikeMutation(userEmail);
  const {isDarkMode} = useTheme();
  const bgdCol = isDarkMode ? '#1C1C1C' : '#1C1C1C';
  // const bgdCol = '#1C1C1C';
  // useLogPersistedData();
  const tabBarHeight = useBottomTabBarHeight();

  const heightItem = Platform.select({
    ios: screenHeight,
    android: screenHeight + tabBarHeight,
  });

  // console.log('userEmail:', userEmail);

  const video = useRef<Video>(null);
  const lastViewedIndexRef = useRef(0);
  const lastTap = useRef<number>(0);
  const blurOpacity = useRef(new Animated.Value(0)).current;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastViewedIndex, setLastViewedIndex] = useState(0);
  const [lastViewedMemeId, setLastViewedMemeId] = useState<string | null>(null);

  const [selectedMeme, setSelectedMeme] = useState<Meme | undefined>(undefined);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);

  // EFFECT: load user's access token
  useEffect(() => {
    const getUserToken = async () => {
      const token = await getToken('accessToken');
      // console.log('Loaded token:', token);
      if (token) {
        setAccessToken(token);
      } else {
        console.log('FEED effect: No token found.');
      }
    };

    getUserToken();
  }, []);

  // EFFECT: Load last viewed index and memeId from storage
  useEffect(() => {
    const indexStr = storage.getString('LAST_VIEWED_INDEX');
    const memeId = storage.getString('LAST_VIEWED_MEME_ID');

    if (indexStr !== undefined) {
      setLastViewedIndex(parseInt(indexStr, 10));
    }
    if (memeId !== undefined) {
      setLastViewedMemeId(memeId);
    }
  }, []);

  // QUERY: Fetch memes
  const {
    memes,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError,
    error,
    isFetching,
    refetch,
    isRefetching,
    data,
  } = useFetchMemes({
    accessToken,
    userEmail,
    lastViewedMemeId,
  });

  // console.log('memes in FEED ==========>', memes?.length);

  // EFFECT: Prune cache on fresh data
  useEffect(() => {
    if (data) {
      pruneCache(queryClient, userEmail, lastViewedIndexRef.current);
    }
  }, [data, queryClient, userEmail]);

  // EFFECT: Save last viewed index and memeId when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        storage.set('LAST_VIEWED_INDEX', lastViewedIndex.toString());
        if (memes[lastViewedIndex]?.memeID) {
          storage.set('LAST_VIEWED_MEME_ID', memes[lastViewedIndex].memeID);
        }

        // Prune the cache when app goes to background
        pruneCache(queryClient, userEmail, lastViewedIndex);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [lastViewedIndex, memes, userEmail]);

  const handleDoubleTap = () => {
    const incrementLikes = !memes[lastViewedIndex]?.likedByUser;
    likeMutation.mutate({
      memeID: memes[lastViewedIndex]?.memeID as string,
      incrementLikes,
      email: userEmail,
      doubleLike: false,
      incrementDownloads: false,
    });
    setShowLikeAnimation(true);
  };

  const closeLongPressModal = useCallback(() => {
    Animated.timing(blurOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsLongPressModalVisible(false);
    });
  }, [blurOpacity]);

  const handleDownloadPress = async () => {
    try {
      await updateMemeReaction({
        memeID: memes[lastViewedIndex].memeID,
        incrementLikes: false,
        email: userEmail,
        doubleLike: false,
        incrementDownloads: true,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Meme added to your gallery!',
        visibilityTime: 2000,
        topOffset: 30,
      });
    } catch (error) {
      console.error('Error updating meme reaction DOWNLOADS:', error);
      Toast.show({
        type: 'error',
        text1: 'Success',
        text2: 'Operation not successful',
        visibilityTime: 2000,
        topOffset: 30,
      });
    }
  };

  const handleShare = async (
    type: ShareType,
    username?: string,
    message?: string,
  ) => {
    try {
      // await onShare(type, username ?? '', message ?? '');
    } catch (error) {
      console.error('Error in handleShare:', error);
    }
  };

  const toggleCommentFeed = () => {
    setIsCommentFeedVisible(prev => !prev);
  };

  // Handle End Reached
  const handleEndReached = () => {
    console.log('End reached');
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onViewableItemsChanged = ({viewableItems}: ViewableItemsType) => {
    if (
      viewableItems?.length > 0 &&
      typeof viewableItems[0].index === 'number'
    ) {
      console.log('CURRENT MEME IDX:', viewableItems[0].index);
      const index = viewableItems[0].index;
      setLastViewedIndex(index);
      lastViewedIndexRef.current = index;

      const memeId = memes[index]?.memeID || null;
      // console.log('CURRENT MEME ID ====>', memeId);
      setLastViewedMemeId(memeId);
    }
  };

  // ==> KEY EXTRACTOR
  const keyExtractor = (item: Meme | undefined, index: number) =>
    item?.memeID || `meme-${index}`;

  // == ITEM IN THE LIST ==
  const renderItem = useCallback(
    ({item, index}: {item: Meme | undefined; index: number}) => {
      // console.log('Rendering item:', item);

      // console.log('Rendering item:', item);
      // if (!item || !item.url) {
      //   return null;
      // }

      const isVideo =
        item?.url?.toLowerCase().endsWith('.mp4') ||
        item?.mediaType === 'video';

      const mediaSource = {uri: item?.url || ''};
      // console.log('Media Source:', mediaSource);

      const loadMedia = () => {
        if (isVideo) {
          return (
            <Video
              ref={video}
              source={mediaSource}
              style={[StyleSheet.absoluteFill, styles.video]}
              resizeMode={ResizeMode.COVER}
              useNativeControls
              shouldPlay={true}
              isLooping
              isMuted={true}
              videoStyle={{}}
              // shouldPlay={!isLoading}
            />
          );
        } else {
          return (
            <Image
              source={mediaSource}
              style={[styles.imgContainer, {height: heightItem}]}
              resizeMode="contain"
            />
          );
        }
      };

      const handleLongPress = () => {
        setSelectedMeme(item);
        setIsLongPressModalVisible(true);
      };

      const handlePress = () => {
        const now = Date.now();
        if (lastTap.current && now - lastTap.current < 300) {
          handleDoubleTap();
        } else {
          lastTap.current = now;
        }
      };

      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={{
            height: screenHeight,
          }}>
          {loadMedia()}
        </TouchableOpacity>
      );
    },
    [],
  );

  const validInitialScrollIndex =
    lastViewedIndex < memes.length ? lastViewedIndex : 0;

  const getItemLayout = (data: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  });

  // ==> DATA IS FETCHING
  if (isFetching) {
    return <LoadingComponent style={{backgroundColor: bgdCol}} />;
  }

  // ==> ERROR FROM QUERY
  if (isError) {
    return <ErrorComponent error={error} style={{backgroundColor: bgdCol}} />;
  }

  // ==> NO DATA
  if (memes?.length === 0) {
    return <NoDataComponent style={{backgroundColor: bgdCol}} />;
  }

  // LOG CURRENT MEME IN VIEW
  console.log('Current meme:', memes[lastViewedIndex]);

  // == M A I N  R E N D E R ==
  return (
    <View style={[styles.container, {backgroundColor: bgdCol}]}>
      {/* == M E M E S  L I S T == */}
      <FlatList
        keyExtractor={keyExtractor}
        data={memes}
        renderItem={renderItem}
        initialScrollIndex={validInitialScrollIndex}
        getItemLayout={getItemLayout}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        style={styles.flatlistStyle}
        contentContainerStyle={styles.contentCtrStyle}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        updateCellsBatchingPeriod={100}
        snapToInterval={screenHeight}
        decelerationRate="fast"
        snapToAlignment="start"
        // removeClippedSubviews={Platform.OS !== 'android'}
      />

      {/* == M E M E  D E T A I L S == */}
      <LinearGradient
        pointerEvents="box-none"
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <LeftContentFeed
          username={memes[lastViewedIndex]?.username ?? ''}
          caption={memes[lastViewedIndex]?.caption ?? ''}
          uploadTimestamp={memes[lastViewedIndex]?.uploadTimestamp ?? ''}
        />

        <RightContentFeed
          isFollowing={memes[lastViewedIndex]?.isFollowed}
          likesCount={memes[lastViewedIndex]?.likeCount}
          sharesCount={memes[lastViewedIndex]?.shareCount}
          commentsCount={memes[lastViewedIndex]?.commentCount}
          userImgSrc={memes[lastViewedIndex]?.profilePicUrl}
          memeUserEmail={memes[lastViewedIndex]?.email}
          userEmail={userEmail}
          memeUsername={memes[lastViewedIndex]?.username}
          currentMemeID={memes[lastViewedIndex]?.memeID}
          likedByUser={memes[lastViewedIndex]?.likedByUser ?? false}
          onShare={() => setShowShareModal(true)}
          setIsCommentFeedVisible={setIsCommentFeedVisible}
        />
      </LinearGradient>

      {/* == COMMENT FEED MODAL == */}
      {isCommentFeedVisible && (
        <CommentFeed
          isCommentFeedVisible={isCommentFeedVisible}
          setIsCommentFeedVisible={setIsCommentFeedVisible}
          memeID={memes[lastViewedIndex]?.memeID}
          userEmail={userEmail}
          toggleCommentFeed={toggleCommentFeed}
        />
      )}

      {/* == SHARE MODAL == */}
      {/* FIXME: onShare isn't used inside the component! */}
      {showShareModal && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          friends={[]}
          onShare={handleShare}
          currentMedia={memes[lastViewedIndex]?.url}
        />
      )}

      {/* === LongPress Modal === */}
      {isLongPressModalVisible && (
        <LongPressModal
          isVisible={isLongPressModalVisible}
          onClose={closeLongPressModal}
          meme={{
            id: selectedMeme?.memeID as string,
            url: selectedMeme?.url as string,
          }}
          onSaveToProfile={handleDownloadPress}
          onShare={() => setShowShareModal(true)}
          onReport={() => {}}
        />
      )}

      {showLikeAnimation && (
        <LikeAnimation onAnimationFinish={() => setShowLikeAnimation(false)} />
      )}
    </View>
  );
};

export default Feed;
