import React, {useState, useCallback, useMemo} from 'react';
import {View, FlatList, ViewToken} from 'react-native';
import {ActivityIndicator, ViewStyle} from 'react-native';
import {debounce} from 'lodash';
import LottieView from 'lottie-react-native';
// import Toast from 'react-native-toast-message';
// import {useNavigation} from '@react-navigation/native';
// import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../store/userStore';

import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import styles from './Feed.styles';
import {Meme, User, ShareType} from '../../types/types';
import {IconsAndContent} from '../../components/MediaPlayer/MediaPlayerContent';
import ShareModal from '../../components/Modals/ShareModal';
import SaveSuccessModal from '../../components/Modals/SaveSuccessModal';
import {LongPressModal} from '../../components/MediaPlayer/LongPressModal';

// import {fetchComments} from '../../components/Meme/memeService';
// import {FeedNavProp} from '../../navigation/NavTypes/FeedTypes';
// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';
// const {height} = Dimensions.get('window');

const viewabilityConfig = {itemVisiblePercentThreshold: 50};

const Feed = () => {
  // const navigation = useNavigation<FeedNavProp>();
  const {isDarkMode} = useTheme();

  const user = useUserStore(state => state as User);

  const bgdColor = isDarkMode ? '#000' : '#1C1C1C';

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (
        viewableItems.length > 0 &&
        typeof viewableItems[0].index === 'number'
      ) {
        console.log('Currently visible media index:', viewableItems[0].index);
        setCurrentMediaIndexCallback(viewableItems[0].index);
      }
    },
    [setCurrentMediaIndexCallback],
  );

  const keyExtractor = (item: Meme | undefined, index: number) =>
    item?.memeID || `meme-${index}`;

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndexCallback(
      Math.min(currentMediaIndex + 1, memes.length - 1),
    );
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.max(currentMediaIndex - 1, 0));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

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

    // console.log('MemeList - Rendering item:', item);

    return (
      <MediaPlayer
        {...item}
        key={item.memeID}
        index={index}
        currentIndex={currentMediaIndex}
        currentMedia={item.url}
        goToPrevMedia={goToPrevMedia}
        goToNextMedia={goToNextMedia}
        // user={user}
        // currentUserId={user.email}
        // memeUser={item.memeUser || {}}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // TODO: should apply a linear gradient overlay for bottom half of screen
  return (
    <View style={[styles.container, {backgroundColor: bgdColor}]}>
      {/* == LOTTIE LIKE ANIMATION == */}
      {showLikeAnimation && (
        <LottieView
          source={require('../../assets/animations/lottie-liked.json')}
          style={lottieStyle as ViewStyle}
          autoPlay
          loop={false}
        />
      )}

      {/* == LIKE, COMMENT, SHARE ICONS == */}
      <IconsAndContent
        memeUser={''}
        caption={''}
        uploadTimestamp={''}
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

      {/* S A V E  S U C C E S S  M O D A L */}
      {/* == TODO: replace with CustomToast component == */}
      <SaveSuccessModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />

      {/* == M E M E S  L I S T == */}
      <FlatList
        keyExtractor={keyExtractor}
        data={memes}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        style={{}}
        contentContainerStyle={{flexGrow: 1}}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default Feed;
