import React, {useState, useCallback, useMemo} from 'react';
import {useRef} from 'react';
import {View, FlatList, ViewToken} from 'react-native';
import {ActivityIndicator, ViewStyle, StyleSheet} from 'react-native';
import {Pressable, Animated, Image} from 'react-native';
import {debounce} from 'lodash';
import LottieView from 'lottie-react-native';
import {Dimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import Toast from 'react-native-toast-message';
// import {useNavigation} from '@react-navigation/native';
// import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../store/userStore';

// import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import styles from './styles';
import {Meme, User, ShareType} from '../../types/types';
import RightContentFeed from '../../components/RightContentFeed/RightContentFeed';
import LeftContentFeed from '../../components/LeftContentFeed/LeftContentFeed';
import ShareModal from '../../components/Modals/ShareModal';
import {LongPressModal} from '../../components/MediaPlayer/LongPressModal';
import {getMediaSource} from '../../utils/utils';
import {SafeAreaView} from 'react-native-safe-area-context';

// import {FeedNavProp} from '../../navigation/NavTypes/FeedTypes';
// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';

const viewabilityConfig = {itemVisiblePercentThreshold: 50};
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const Feed = () => {
  const {isDarkMode} = useTheme();

  const user = useUserStore(state => state as User);

  const bgdColor = isDarkMode ? '#000' : '#1C1C1C';

  const video = useRef<Video>(null);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const counts = {
    likes: 0,
    comments: 0,
    downloads: 0,
    shares: 0,
  };

  const memeDetails = {
    id: 'memeID',
    url: '',
    caption: '',
  };

  const lottieStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 200,
    height: 200,
  };

  // == CUSTOM HOOK for DATA in LISTING ==
  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} =
    useMemes();

  // console.log('memes:', memes);

  // Debounced Fetch More Memes
  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, {leading: true, trailing: false}),
    [fetchMoreMemes],
  );

  const handleFollow = async () => {
    // if (!currentUserId || !memeUser.email) return;
    // try {
    //   await addFollow(currentUserId, memeUser.email);
    //   setIsFollowing(true);
    //   useUserStore.getState().incrementFollowingCount();
    //   Toast.show({
    //     type: 'success',
    //     text1: 'Successfully followed user',
    //     position: 'bottom',
    //     visibilityTime: 2000,
    //   });
    // } catch (error) {
    //   console.error('Error following user:', error);
    // }
  };

  const handleLikePress = async () => {
    console.log('handleLikePress');
    // if (user) {
    //   const newLikedState = !liked;
    //   let newDoubleLikedState = doubleLiked;
    //   let newLikeCount = counts.likes;

    //   if (newLikedState) {
    //     if (doubleLiked) {
    //       newDoubleLikedState = false;
    //       newLikeCount -= 1;
    //     } else {
    //       newLikeCount += 1;
    //     }
    //   } else {
    //     newLikeCount -= 1;
    //   }

    //   setLiked(newLikedState);
    //   setDoubleLiked(newDoubleLikedState);
    //   setCounts(prevCounts => ({...prevCounts, likes: newLikeCount}));

    //   try {
    //     // COMMENTED OUT FOR NOW
    //     // await updateMemeReaction(
    //     //   memeID,
    //     //   newLikedState,
    //     //   newDoubleLikedState,
    //     //   false,
    //     //   user.email,
    //     // );
    //   } catch (error) {
    //     console.error('Error updating meme reaction:', error);
    //     // Revert changes if the request fails
    //     setLiked(!newLikedState);
    //     setDoubleLiked(!newDoubleLikedState);
    //     setCounts(prevCounts => ({...prevCounts, likes: initialLikeCount}));
    //   }
    // }
  };

  const onShare = async (
    type: ShareType,
    username: string,
    message: string,
  ) => {
    // if (user && type === 'friend' && username) {
    //   try {
    //     await handleShareMeme(
    //       memeID,
    //       user.email,
    //       user.username,
    //       username,
    //       message,
    //     );
    //     setCounts(prev => ({...prev, shares: prev.shares + 1}));
    //   } catch (error) {
    //     console.error('Sharing failed:', error);
    //   }
    // }
  };

  const handleDownloadPress = async () => {
    // if (user) {
    //   try {
    //     const newSavedState = !isSaved;
    //     // COMMENTED OUT FOR NOW
    //     // await updateMemeReaction(
    //     //   memeID,
    //     //   false,
    //     //   false,
    //     //   newSavedState,
    //     //   user.email,
    //     // );
    //     setIsSaved(newSavedState);
    //     setCounts(prev => ({
    //       ...prev,
    //       downloads: prev.downloads + (newSavedState ? 1 : -1),
    //     }));
    //   } catch (error) {
    //     console.error('Error updating meme reaction:', error);
    //   }
    // }
  };

  const closeLongPressModal = () => {
    setIsLongPressModalVisible(false);
    // Animated.timing(blurOpacity, {
    //   toValue: 0,
    //   duration: 300,
    //   useNativeDriver: false,
    // }).start();
  };

  // Handle End Reached
  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  const setCurrentMediaIndexCallback = useCallback(
    (index: number) => {
      if (index >= 0 && index < memes.length) {
        setCurrentMediaIndex(index);
      }
    },
    [setCurrentMediaIndex],
  );

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (
      viewableItems.length > 0 &&
      typeof viewableItems[0].index === 'number'
    ) {
      console.log('Currently visible media index:', viewableItems[0].index);
      setCurrentMediaIndexCallback(viewableItems[0].index);
    }
  };

  const keyExtractor = (item: Meme | undefined, index: number) =>
    item?.memeID || `meme-${index}`;

  // == ITEM IN THE LIST ==
  const renderItem = ({
    item,
    index,
  }: {
    item: Meme | undefined;
    index: number;
  }) => {
    if (!item || !item.url) {
      return null;
    }

    // console.log('Rendering item:', item);

    const isLocalFile = item.url.startsWith('../assets/');
    const isVideo =
      item.url.toLowerCase().endsWith('.mp4') || item.mediaType === 'video';

    const mediaSource = isLocalFile
      ? getMediaSource(item.url)
      : {uri: item.url};

    const loadMedia = () => {
      if (isVideo) {
        return (
          <Video
            ref={video}
            source={mediaSource}
            style={[StyleSheet.absoluteFill, styles.video]}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            // shouldPlay={!isLoading}
            shouldPlay={true}
            isLooping
            isMuted={true}
            videoStyle={{}}
          />
        );
      } else {
        return (
          <Image
            source={mediaSource}
            style={[styles.imgContainer]}
            resizeMode="contain"
          />
        );
      }
    };

    return <View style={{height: screenHeight}}>{loadMedia()}</View>;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // == M A I N  R E N D E R ==
  return (
    <View style={styles.container}>
      {/* == LOTTIE LIKE ANIMATION == */}
      {showLikeAnimation && (
        <LottieView
          source={require('../../assets/animations/lottie-liked.json')}
          style={lottieStyle as ViewStyle}
          autoPlay
          loop={false}
        />
      )}

      {/* == M E M E S  L I S T == */}
      <FlatList
        keyExtractor={keyExtractor}
        data={memes}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        style={{
          height: screenHeight,
          // borderWidth: 3,
          // borderColor: 'red',
        }}
        contentContainerStyle={{}}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />

      <LinearGradient
        pointerEvents="box-none"
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <LeftContentFeed memeUser={''} caption={''} uploadTimestamp={''} />

        <RightContentFeed
          memeUser={''}
          isFollowing={false}
          handleFollow={handleFollow}
          counts={counts}
          debouncedHandleLike={handleLikePress}
          liked={false}
          index={0}
          currentIndex={currentMediaIndex}
          onShare={() => setShowShareModal(true)}
          user={user}
          numOfComments={0}
        />
      </LinearGradient>

      {/* L O N G  P R E S S  M O D A L */}
      <LongPressModal
        isVisible={isLongPressModalVisible}
        onClose={closeLongPressModal}
        meme={memeDetails}
        onSaveToProfile={handleDownloadPress}
        onShare={() => setShowShareModal(true)}
        onReport={() => {}}
      />

      {/* S H A R E  M O D A L */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={onShare}
        // currMedia is item.url
        currentMedia={''}
      />
    </View>
  );
};

export default Feed;
