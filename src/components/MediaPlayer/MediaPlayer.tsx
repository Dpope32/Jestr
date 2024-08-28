import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {Dimensions, Animated} from 'react-native';
import {StyleSheet, Platform, ViewStyle} from 'react-native';
import {GestureResponderEvent, ActivityIndicator} from 'react-native';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
// import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
// import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
// import {BlurView} from 'expo-blur';

import SafeImage from '../shared/SafeImage';
import styles from './MP.styles';
import {MediaPlayerProps} from '../../types/types';
import {addFollow} from '../../services/authFunctions';
import {usePanResponder} from './usePanResponder';
import {IconsAndContent} from './MediaPlayerContent';
import {useMediaPlayerLogic} from './useMediaPlayerLogic';
import {useUserStore} from '../../store/userStore';
import {LongPressModal} from './LongPressModal';
import {useTheme} from '../../theme/ThemeContext';

import {getMediaSource} from '../../utils/utils';

const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  index,
  currentIndex,
  user,
  currentUserId,
  memeUser = {email: ''},
  currentMedia,
  liked: initialLiked,
  numOfComments,
  goToPrevMedia,
  goToNextMedia,
  // {...user} props
  mediaType,
  caption,
  uploadTimestamp,
  memeID,
  likeCount: initialLikeCount,
  downloadCount: initialDownloadCount,
  shareCount: initialShareCount,
  commentCount: initialCommentCount,
}) => {
  const {isDarkMode} = useTheme();

  const video = useRef<Video>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);
  const iconAreaRef = useRef(null);

  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
  const [likePosition, setLikePosition] = useState({x: 0, y: 0});
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // these are pointless, why?
  const bgdCol3 = isDarkMode ? '#000' : '#1C1C1C';

  const lottieStyle = {
    position: 'absolute',
    left: likePosition.x,
    top: likePosition.y,
    width: 200,
    height: 200,
  };

  const memeDetails = {
    id: memeID,
    url: currentMedia,
    caption: caption,
  };

  const handleMediaError = useCallback(() => {
    setMediaLoadError(true);
    // goToNextMedia();
  }, [goToNextMedia]);

  // === L O A D   M E D I A ===
  const loadMedia = useCallback(() => {
    setMediaLoadError(false);
    setIsLoading(true);
    fadeAnim.setValue(0);

    const isVideo =
      currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';

    if (isVideo) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [currentMedia, mediaType, handleMediaError, fadeAnim]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia, memeID, index, currentIndex]);

  // === H A N D L E  S I N G L E  T A P ===
  const handleSingleTap = useCallback(() => {
    if (mediaType === 'video' && video.current) {
      if (status?.isLoaded && status.isPlaying) {
        video.current.pauseAsync();
      } else if (status?.isLoaded) {
        video.current.playAsync();
      }
    } else {
    }
  }, [mediaType, status]);

  const {
    liked,
    showSaveModal,
    showShareModal,
    counts,
    debouncedHandleLike,
    handleDownloadPress,
    onShare,
    setShowSaveModal,
    setShowShareModal,
  } = useMediaPlayerLogic({
    initialLiked,
    initialLikeCount,
    initialDownloadCount,
    initialShareCount,
    initialCommentCount,
    user,
    memeID,
  });

  const handleSwipeUp = useCallback(() => {
    // console.log(`MediaPlayer ${index} - Swipe up`);
    goToNextMedia();
  }, [index, goToNextMedia]);

  const handleSwipeDown = useCallback(() => {
    //  console.log(`MediaPlayer ${index} - Swipe down`);
    goToPrevMedia();
  }, [index, goToPrevMedia]);

  const handleFollow = useCallback(async () => {
    if (!currentUserId || !memeUser.email) return;
    try {
      await addFollow(currentUserId, memeUser.email);
      setIsFollowing(true);

      useUserStore.getState().incrementFollowingCount();

      Toast.show({
        type: 'success',
        text1: 'Successfully followed user',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [currentUserId, memeUser.email]);

  const handleLongPress = useCallback(() => {
    setIsLongPressModalVisible(true);
    Animated.timing(blurOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [blurOpacity]);

  const handleDoubleTap = useCallback(
    (event: GestureResponderEvent) => {
      const {pageX, pageY}: {pageX: number; pageY: number} = event.nativeEvent;

      const updateLikePosition = (x: number, y: number) => {
        const xOffset = Platform.OS === 'ios' ? -100 : -100;
        const yOffset = Platform.OS === 'ios' ? -250 : -220;

        setLikePosition({
          x: x + xOffset,
          y: y + yOffset,
        });
      };

      updateLikePosition(pageX, pageY);
      setShowLikeAnimation(true);
      debouncedHandleLike();

      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000);
    },
    [debouncedHandleLike],
  );

  const handleTap = useCallback(
    (event: GestureResponderEvent) => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;

      if (now - lastTap < DOUBLE_PRESS_DELAY) {
        handleDoubleTap(event);
      } else {
        handleSingleTap();
      }
      setLastTap(now);
    },
    [lastTap, handleDoubleTap, handleSingleTap],
  );

  const closeLongPressModal = useCallback(() => {
    setIsLongPressModalVisible(false);
    Animated.timing(blurOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [blurOpacity]);

  const {panHandlers, translateY} = usePanResponder({
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    handleTap,
    handleDoubleTap,
    handleLongPress,
    isCommentFeedVisible: false,
    isProfilePanelVisible: false,
  });

  const renderMedia = useMemo(() => {
    // const isLocalFile = currentMedia.startsWith('file://');

    if (!currentMedia) {
      return <Text style={styles.errorText}>Media not available</Text>;
    }

    if (isLoading) {
      return <ActivityIndicator size="large" color="#1bd40b" />;
    }

    if (mediaLoadError) {
      return <Text style={styles.errorText}>Failed to load media.</Text>;
    }

    if (!currentMedia) {
      return <Text style={styles.errorText}>Media not available.</Text>;
    }

    // const isVideo =
    //   currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';

    const isLocalFile = currentMedia.startsWith('../assets/');
    const isVideo =
      currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';

    const mediaSource = isLocalFile
      ? getMediaSource(currentMedia)
      : {uri: currentMedia};

    if (isVideo) {
      console.log('Rendering video:', currentMedia);
      return (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.videoContainer,
            {opacity: fadeAnim},
          ]}>
          <Video
            ref={video}
            // source={{uri: currentMedia}}
            source={mediaSource}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={!isLoading}
            isLooping
            onPlaybackStatusUpdate={status => setStatus(() => status)}
            isMuted={true}
            onError={handleMediaError}
          />
        </Animated.View>
      );
    } else {
      return (
        <AnimatedSafeImage
          // source={{uri: currentMedia}}
          source={mediaSource}
          style={[styles.memeImage]}
          width={screenWidth}
          height={screenHeight}
          resizeMode="cover"
          onError={handleMediaError}
        />
      );
    }
  }, [
    currentMedia,
    mediaType,
    isLoading,
    mediaLoadError,
    fadeAnim,
    handleMediaError,
  ]);

  // === M A I N   R E N D E R ===
  // TODO: add a play icon when video is paused
  return (
    <Animated.View
      style={[
        styles.container,
        {
          // transform: [{translateY}],
          // backgroundColor: bgdCol3,
          // borderWidth: 1,
          // borderColor: 'yellow',
        },
      ]}
      {...panHandlers}>
      {/* == */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View
          style={[
            styles.mediaContainer,
            {
              backgroundColor: bgdCol3,
            },
          ]}>
          {/* == R E N D E R  M E D I A == */}
          {renderMedia}

          {/* == LOTTIE LIKE ANIMATION == */}
          {showLikeAnimation && (
            <LottieView
              ref={lottieRef}
              source={require('../../assets/animations/lottie-liked.json')}
              style={lottieStyle as ViewStyle}
              autoPlay
              loop={false}
            />
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* == LIKE, COMMENT, SHARE ICONS == */}
      <IconsAndContent
        memeUser={memeUser}
        caption={caption}
        uploadTimestamp={uploadTimestamp}
        isFollowing={isFollowing}
        handleFollow={handleFollow}
        counts={counts}
        debouncedHandleLike={debouncedHandleLike}
        liked={liked}
        iconAreaRef={iconAreaRef}
        index={index}
        currentIndex={currentIndex}
        onShare={() => setShowShareModal(true)}
        user={user}
        numOfComments={numOfComments!}
      />

      {/* == TODO: replace with CustomToast component == */}
      <SaveSuccessModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        // friends={friends}
        onShare={onShare}
        currentMedia={currentMedia}
      />

      {/* == MODAL TRIGGERED BY LONG PRESS == */}
      <LongPressModal
        isVisible={isLongPressModalVisible}
        onClose={closeLongPressModal}
        meme={memeDetails}
        onSaveToProfile={handleDownloadPress}
        onShare={() => setShowShareModal(true)}
        onReport={() => {}}
      />
    </Animated.View>
  );
};

export default MediaPlayer;
