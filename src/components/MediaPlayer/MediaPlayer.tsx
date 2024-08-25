import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {Dimensions, Animated} from 'react-native';
import {StyleSheet, Platform, ViewStyle} from 'react-native';
import {GestureResponderEvent, ActivityIndicator} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';
import {BlurView} from 'expo-blur';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

import SafeImage from '../shared/SafeImage';
import styles from './MP.styles';
import {MediaPlayerProps} from '../../types/types';
import {addFollow} from '../../services/authFunctions';
import {usePanResponder} from './usePanResponder';
import {IconsAndContent} from './MediaPlayerContent';
import {useMediaPlayerLogic} from './useMediaPlayerLogic';
import {useUserStore} from '../../utils/userStore';
import {LongPressModal} from './LongPressModal';
import {useTheme} from '../../theme/ThemeContext';

import {getMediaSource} from '../../utils/utils';

const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);

const MediaPlayer: React.FC<MediaPlayerProps> = React.memo(
  ({
    memeUser = {email: ''},
    currentMedia,
    mediaType,
    prevMedia,
    nextMedia,
    caption,
    uploadTimestamp,
    handleDownload,
    toggleCommentFeed,
    goToPrevMedia,
    goToNextMedia,
    index,
    currentIndex,
    user,
    memeID,
    liked: initialLiked,
    doubleLiked: initialDoubleLiked,
    likeCount: initialLikeCount,
    currentUserId,
    downloadCount: initialDownloadCount,
    shareCount: initialShareCount,
    // not used, why?
    commentCount: initialCommentCount,
    onLikeStatusChange,
    numOfComments,
  }) => {
    const {isDarkMode} = useTheme();

    const video = useRef<Video>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const blurOpacity = useRef(new Animated.Value(0)).current;
    const lottieRef = useRef(null);
    const iconAreaRef = useRef(null);
    const isSwiping = useRef(false);

    const [status, setStatus] = useState<AVPlaybackStatus>(
      {} as AVPlaybackStatus,
    );
    const [imageSize, setImageSize] = useState({width: 0, height: 0});
    const [isLoading, setIsLoading] = useState(true);
    const [mediaLoadError, setMediaLoadError] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [isLongPressModalVisible, setIsLongPressModalVisible] =
      useState(false);
    const [likePosition, setLikePosition] = useState({x: 0, y: 0});
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    // const [viewedMemes, setViewedMemes] = useState<Set<string>>(new Set());

    // these are pointless, why?
    const bgdCol1 = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(28, 28, 28, 0.8)';
    const bgdCol2 = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(28, 28, 28, 0.5)';
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
        setImageSize({width: screenWidth, height: screenHeight});
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
    }, [loadMedia, nextMedia, prevMedia, memeID, index, currentIndex]);

    // === H A N D L E  S I N G L E  T A P ===
    const handleSingleTap = useCallback(() => {
      if (mediaType === 'video' && video.current) {
        if (status.isLoaded && status.isPlaying) {
          video.current.pauseAsync();
        } else if (status.isLoaded) {
          video.current.playAsync();
        }
      }
    }, [mediaType, status]);

    const {
      liked,
      doubleLiked,
      showSaveModal,
      showShareModal,
      showToast,
      toastMessage,
      counts,
      friends,
      debouncedHandleLike,
      handleDownloadPress,
      onShare,
      setShowSaveModal,
      setShowShareModal,
    } = useMediaPlayerLogic({
      initialLiked,
      initialDoubleLiked,
      initialLikeCount,
      initialDownloadCount,
      initialShareCount,
      initialCommentCount,
      user,
      memeID,
      handleDownload,
      onLikeStatusChange,
      handleSingleTap,
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
        const {pageX, pageY}: {pageX: number; pageY: number} =
          event.nativeEvent;

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
          handleSingleTap(); // This could be toggling video play/pause
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

    const {panHandlers, translateY, animatedBlurIntensity} = usePanResponder({
      onSwipeUp: handleSwipeUp,
      onSwipeDown: handleSwipeDown,
      handleTap,
      handleDoubleTap,
      handleLongPress,
      iconAreaRef,
      isSwiping,
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
          <Animated.View style={[styles.videoContainer, {opacity: fadeAnim}]}>
            <Video
              ref={video}
              // source={{uri: currentMedia}}
              source={mediaSource}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              useNativeControls
              shouldPlay={!isLoading}
              isLooping
              onPlaybackStatusUpdate={setStatus}
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
            width={imageSize.width}
            height={imageSize.height}
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
      imageSize,
      handleMediaError,
    ]);

    // === M A I N   R E N D E R ===
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateY}],
            backgroundColor: bgdCol3,
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
                source={require('./lottie-liked.json')}
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
          doubleLiked={doubleLiked}
          toggleCommentFeed={toggleCommentFeed}
          animatedBlurIntensity={animatedBlurIntensity}
          iconAreaRef={iconAreaRef}
          index={index}
          currentIndex={currentIndex}
          onShare={() => setShowShareModal(true)}
          user={user}
          numOfComments={numOfComments!}
        />

        {/* == TOAST MSG: NECESSARY LIKE THIS ?? == */}
        {showToast && (
          <View
            style={[
              styles.toastContainer,
              {
                backgroundColor: bgdCol1,
              },
            ]}>
            <FontAwesomeIcon icon={faCheckCircle} size={24} color="#4CAF50" />
            <Text style={styles.toastMessage}>{toastMessage}</Text>
          </View>
        )}

        <SaveSuccessModal
          visible={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        />

        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          friends={friends}
          onShare={onShare}
          currentMedia={currentMedia}
        />

        {/* == BLUR VIEW: CURRENTLY NOT WORKING == */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: blurOpacity,
              backgroundColor: bgdCol2,
            },
          ]}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
        </Animated.View>

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
  },
);

export default MediaPlayer;
