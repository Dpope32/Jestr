import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, GestureResponderEvent, Dimensions, Animated, PanResponder, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import SafeImage from './SafeImage';
import styles from './MP.styles';
import { MediaPlayerProps } from '../../types/types';
import { updateMemeReaction, getLikeStatus } from '../Meme/memeService';
import { handleShareMeme, recordMemeView } from '../../services/authFunctions';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import LottieView from 'lottie-react-native';
import { usePanResponder } from './usePanResponder';
import { IconsAndContent } from './MediaPlayerContent';
import { useMediaPlayerLogic } from './useMediaPlayerLogic';
import { useUserStore } from '../../utils/userStore';
const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const { width, height } = Dimensions.get('window');

const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);

const MediaPlayer: React.FC<MediaPlayerProps> = React.memo(({
  memeUser = {},
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
  user,
  memeID,
  liked: initialLiked,
  doubleLiked: initialDoubleLiked,
  likeCount: initialLikeCount,
  downloadCount: initialDownloadCount,
  shareCount: initialShareCount,
  commentCount: initialCommentCount,
  onLikeStatusChange,
}) => {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);

  const handleSingleTap = useCallback(() => {
    if (mediaType === 'video' && video.current) {
      if ('isPlaying' in status && status.isPlaying) {
        video.current.pauseAsync();
      } else {
        video.current.playAsync();
      }
    }
  }, [mediaType, status]);

  const {
    liked,
    doubleLiked,
    isSaved,
    showSaveModal,
    showShareModal,
    showToast,
    toastMessage,
    showLikeAnimation,
    likePosition,
    counts,
    friends,
    handleDoubleTap,
    debouncedHandleLike,
    handleDownloadPress,
    onShare,
    formatDate,
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
    mediaType,
    video,
    status,
    handleSingleTap,
  });

  useEffect(() => {
    console.log(`MediaPlayer mounted for memeID: ${memeID}`);
    return () => {
      console.log(`MediaPlayer unmounted for memeID: ${memeID}`);
    };
  }, [memeID]);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useUserStore();
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = height * 0.05;
  const lottieRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);

  const handleTap = useCallback((event: GestureResponderEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      handleDoubleTap(event);
    } else {
      handleSingleTap();
    }
    setLastTap(now);
  }, [lastTap, handleDoubleTap, handleSingleTap]);
  
  const handleMediaError = useCallback(() => {
    setMediaLoadError(true);
    goToNextMedia();
  }, [goToNextMedia]);

  useEffect(() => {
    setMediaLoadError(false);
    setIsLoading(true);
    fadeAnim.setValue(0);
    translateY.setValue(0);
    animatedBlurIntensity.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const isVideo = currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';
    const screenWidth = Dimensions.get('window').width;

    if (isVideo) {
      setImageSize({ width: screenWidth, height: screenWidth * (9 / 16) });
      setIsLoading(false);
    } else {
      Image.getSize(
        currentMedia,
        (width, height) => {
          const aspectRatio = width / height;
          const calculatedHeight = screenWidth / aspectRatio;
          setImageSize({ width: screenWidth, height: calculatedHeight });
          setIsLoading(false);
        },
        (error) => {
          console.error('Failed to load image:', error);
          handleMediaError();
        }
      );
    }

    const recordViewAsync = async () => {
      if (user && memeID) {
        try {
          await recordMemeView(user.email, memeID);
        } catch (error) {
          console.error('Failed to record meme view:', error);
        }
      }
    };
    recordViewAsync();
  }, [currentMedia, mediaType, user, memeID, fadeAnim, handleMediaError]);

  const { panHandlers, translateY, animatedBlurIntensity } = usePanResponder({
    nextMedia,
    prevMedia,
    goToNextMedia,
    goToPrevMedia,
  });

  const renderMedia = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#1bd40b" />;
    }
  
    if (mediaLoadError) {
      return <Text style={styles.errorText}>Failed to load media.</Text>;
    }
  
    const isVideo = currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';
  
    if (isVideo) {
      return (
        <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
          <Video
            ref={video}
            source={{ uri: currentMedia }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay={!isLoading}
            onPlaybackStatusUpdate={status => {}}
            isLooping
            isMuted={true}
            onError={(error) => {
              console.error('Error loading video:', error);
              handleMediaError();
            }}
          />
        </Animated.View>
      );
    } else {
      return (
        <AnimatedSafeImage
          source={{ uri: currentMedia }}
          style={[styles.memeImage]}
          width={imageSize.width}
          height={imageSize.height}
          resizeMode="cover"
          onError={(error) => {
            console.error('Image load error:', error);
            setMediaLoadError(true);
          }}
        />
      );
    }
  }, [currentMedia, mediaType, isLoading, mediaLoadError, fadeAnim, imageSize, handleMediaError]);
  

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: darkMode ? '#000' : '#2E2E2E',
        },
      ]}
      {...panHandlers}
    >
      
      <View style={styles.contentContainer}>
        <TouchableWithoutFeedback onPress={handleTap}>
          <Animated.View style={[styles.mediaContainer, { opacity: fadeAnim }]}>
            {renderMedia}
          </Animated.View>
        </TouchableWithoutFeedback>
        <IconsAndContent
          memeUser={memeUser}
          caption={caption}
          uploadTimestamp={uploadTimestamp}
          counts={counts}
          debouncedHandleLike={debouncedHandleLike}
          liked={liked}
          doubleLiked={doubleLiked}
          handleDownloadPress={handleDownloadPress}
          isSaved={isSaved}
          toggleCommentFeed={toggleCommentFeed}
          formatDate={formatDate}
          animatedBlurIntensity={animatedBlurIntensity}
        />
        {showToast && (
          <View style={styles.toastContainer}>
            <FontAwesomeIcon icon={faCheckCircle} size={24} color="#4CAF50" />
            <Text style={styles.toastMessage}>{toastMessage}</Text>
          </View>
        )}
        {showLikeAnimation && (
          <LottieView
            ref={lottieRef}
            source={require('./lottie-liked.json')}
            style={{
              position: 'absolute',
              left: likePosition.x,
              top: likePosition.y,
              width: 200,
              height: 200,
            }}
            autoPlay
            loop={false}
          />
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
        {responseModalVisible && <Text>{responseMessage}</Text>}
      </View>
    </Animated.View>
  );
});

export default React.memo(MediaPlayer);
