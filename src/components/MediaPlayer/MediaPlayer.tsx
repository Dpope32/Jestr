import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, GestureResponderEvent, Platform, Dimensions, Animated, PanResponder, ActivityIndicator, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import SafeImage from '../shared/SafeImage';
import styles from './MP.styles';
import { MediaPlayerProps } from '../../types/types';
import { updateMemeReaction, getLikeStatus } from '../Meme/memeService';
import { addFollow, handleShareMeme, recordMemeView } from '../../services/authFunctions';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import LottieView from 'lottie-react-native';
import { usePanResponder } from './usePanResponder';
import { IconsAndContent } from './MediaPlayerContent';
import { useMediaPlayerLogic } from './useMediaPlayerLogic';
import { useUserStore } from '../../utils/userStore';
import { LongPressModal } from './LongPressModal';
import { BlurView } from 'expo-blur';
import { checkFollowStatus } from '../../services/authFunctions';
import { useTheme } from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';

const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

type FollowStatus = {
  isFollowing: boolean;
  canFollow: boolean;
};

const { width, height } = Dimensions.get('window');

const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);

const MediaPlayer: React.FC<MediaPlayerProps> = React.memo(({
  memeUser = {}, currentMedia,mediaType,
  prevMedia, nextMedia, caption, uploadTimestamp, handleDownload,toggleCommentFeed, goToPrevMedia,goToNextMedia,
  user,memeID,liked: initialLiked,doubleLiked: initialDoubleLiked,likeCount: initialLikeCount, currentUserId,
  downloadCount: initialDownloadCount,shareCount: initialShareCount,commentCount: initialCommentCount,onLikeStatusChange,
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

  const {liked,doubleLiked,isSaved,showSaveModal,showShareModal,showToast,toastMessage,showLikeAnimation,likePosition,counts,friends, handleDoubleTap,debouncedHandleLike,handleDownloadPress,onShare,formatDate,setShowSaveModal,setShowShareModal,setIsSaved, setCounts, 
  } = useMediaPlayerLogic({initialLiked,initialDoubleLiked,initialLikeCount,initialDownloadCount,initialShareCount,initialCommentCount,user,memeID,handleDownload,onLikeStatusChange,mediaType,video,status,handleSingleTap,
  });
  const [videoSource, setVideoSource] = useState({ uri: currentMedia });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const blurOpacity = useRef(new Animated.Value(0)).current;
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const lottieRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<Video>(null);
  const iconAreaRef = useRef<View>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [canFollow, setCanFollow] = useState(true);
  const adjustedTop = Platform.OS === 'android' ? likePosition.y - 20 : likePosition.y;

  const closeLongPressModal = useCallback(() => {
    setIsLongPressModalVisible(false);
    Animated.timing(blurOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [blurOpacity]);

  const handleMediaError = useCallback(() => {
    setMediaLoadError(true);
    goToNextMedia();
  }, [goToNextMedia]);

  const isSupportedImageFormat = (url: string) => {
    const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = url.split('.').pop()?.toLowerCase(); // Use optional chaining
    return extension ? supportedFormats.includes(extension) : false;
};

const handleFollow = async () => {
  console.log('handleFollow called with currentUserId:', currentUserId, 'memeUser:', memeUser);
  if (!currentUserId || !memeUser.email) {
    console.error('Missing currentUserId or memeUser.email', { currentUserId, memeUser });
    return;
  }
  try {
    await addFollow(currentUserId, memeUser.email);
    setIsFollowing(true);
    const prevCount = useUserStore.getState().followingCount;
    useUserStore.getState().incrementFollowingCount();
    const newCount = useUserStore.getState().followingCount;
    console.log('Following count updated:', prevCount, '->', newCount);
    Toast.show({
      type: 'success',
      text1: 'Successfully followed user',
      position: 'bottom',
      visibilityTime: 2000,
    });
    console.log('Successfully followed user');
  } catch (error) {
    console.error('Error following user:', error);
  }
};



const FollowButton = () => {
  console.log('FollowButton rendering, canFollow:', canFollow, 'isFollowing:', isFollowing);
  
  if (!canFollow || isFollowing) {
    console.log('FollowButton not shown');
    return null;
  }
  console.log('FollowButton shown');
  return (
    <TouchableOpacity onPress={handleFollow} style={styles.followButton}>
      <Text style={styles.followButtonText}>Follow</Text>
    </TouchableOpacity>
  );
};


  useEffect(() => {
    //console.log('MediaPlayer useEffect triggered');
   // console.log('currentMedia:', currentMedia);
   // console.log('mediaType:', mediaType);
    
    setMediaLoadError(false);
    setIsLoading(true);
    
    fadeAnim.setValue(0);
    translateY.setValue(0);
    animatedBlurIntensity.setValue(0);
   // console.log('Animations reset');

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    const isVideo = currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';
    const screenWidth = Dimensions.get('window').width;
    const screenHeight= Dimensions.get('window').height;    
   // console.log('Is video:', isVideo);
 //   console.log('Screen width:', screenWidth);
 //   console.log('Screen width:', height);

    if (isVideo) {
      const videoSize = { width: screenWidth, height: screenHeight };
      setImageSize(videoSize);
      console.log('Video size set:', videoSize);
      setIsLoading(false);
  } else {
   //   console.log('Attempting to load image:', currentMedia);
  
      if (!isSupportedImageFormat(currentMedia)) {
          console.error('Unsupported image format:', currentMedia);
          setMediaLoadError(true);
          return;
      }
  
      Image.getSize(
          currentMedia,
          (width, height) => {
          //    console.log('Image dimensions fetched:', { width, height });
              const aspectRatio = width / height;
  
              let calculatedWidth, calculatedHeight;
  
              if (aspectRatio > 1) {
                  // Landscape image
                  calculatedWidth = screenWidth;
                  calculatedHeight = screenWidth / aspectRatio;
              } else {
                  // Portrait or square image
                  calculatedWidth = screenHeight * aspectRatio;
                  calculatedHeight = screenHeight;
              }
  
              // Ensure the image covers as much of the screen as possible
              if (calculatedHeight > screenHeight) {
                  calculatedHeight = screenHeight;
                  calculatedWidth = screenHeight * aspectRatio;
              }
  
              const imageSize = { width: calculatedWidth, height: calculatedHeight };
           //   console.log('Calculated image size:', imageSize);
              setImageSize(imageSize);
              setIsLoading(false);
           //   console.log('Image loaded successfully');
          },
          (error) => {
              console.error('Failed to load image:', {
                  url: currentMedia,
                  error: error.message,
                  errorCode: error.code,
              });
              setMediaLoadError(true);
              handleMediaError();
          }
      );
  }

    return () => {
     // console.log(`MediaPlayer unmounted for memeID: ${memeID}`);
    };
}, [currentMedia, mediaType, user, memeID, fadeAnim, handleMediaError]);

useEffect(() => {
  if (mediaType === 'video') {
    const loadVideo = async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.loadAsync(
            { uri: currentMedia },
            { shouldPlay: false, isLooping: true }
          );
        }
      } catch (error) {
        console.error('Error loading video:', error);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(loadVideo, 1000); // Retry after 1 second
        } else {
          handleMediaError();
        }
      }
    };
    loadVideo();
  }
}, [currentMedia, mediaType, retryCount]);


const handleLongPress = useCallback(() => {
  setIsLongPressModalVisible(true);
  Animated.timing(blurOpacity, {
    toValue: 1,
    duration: 100,
    useNativeDriver: false,
  }).start();
}, [blurOpacity]);

const handleTap = useCallback((event: GestureResponderEvent) => {
  console.log('Tap detected');
  const now = Date.now();
  const DOUBLE_PRESS_DELAY = 300; // Reduced from 500

  if (now - lastTap < DOUBLE_PRESS_DELAY) {
    handleDoubleTap(event);
  } else {
    // Add a small delay to differentiate from long press
    setTimeout(() => {
      if (!isLongPressModalVisible) {
        handleSingleTap();
      }
    }, 50);
  }
  setLastTap(now);
}, [lastTap, handleDoubleTap, handleSingleTap, isLongPressModalVisible]);


const preloadNextMeme = useCallback(() => {
  if (nextMedia) {
    Image.prefetch(nextMedia);
  }
}, [nextMedia]);

const preloadPrevMeme = useCallback(() => {
  if (prevMedia) {
    Image.prefetch(prevMedia);
  }
}, [prevMedia]);

const handleSwipeUp = useCallback(() => {
  goToNextMedia();
}, [goToNextMedia]);

const handleSwipeDown = useCallback(() => {
  goToPrevMedia();
}, [goToPrevMedia]);

const { panHandlers, translateY, animatedBlurIntensity } = usePanResponder({
  onSwipeUp: handleSwipeUp,
  onSwipeDown: handleSwipeDown,
  handleTap,
  handleLongPress,
  iconAreaRef,
});
useEffect(() => {
  if (nextMedia) {
    Image.prefetch(nextMedia);
  }
  if (prevMedia) {
    Image.prefetch(prevMedia);
  }
}, [nextMedia, prevMedia]);


  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    Animated.timing(blurOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
    //  console.log('checkStatus called with currentUserId:', currentUserId, 'memeUser:', memeUser);
      if (!currentUserId || !memeUser.email) {
        console.error('Missing currentUserId or memeUser.email in checkStatus', { currentUserId, memeUser });
        return;
      }
      try {
        const status = await checkFollowStatus(currentUserId, memeUser.email);
     //   console.log('Follow status:', status);
        setIsFollowing(status.isFollowing);
        setCanFollow(status.canFollow);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
  
    checkStatus();
  }, [currentUserId, memeUser.email]);

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
            ref={videoRef}
            source={{ uri: currentMedia }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            shouldPlay={!isLoading}
            isLooping
            onPlaybackStatusUpdate={setStatus}
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
          backgroundColor: isDarkMode ? '#000' : '#1C1C1C'
        }
      ]}
      {...panHandlers}
    >
        <TouchableWithoutFeedback onPress={handleTap}>
          <Animated.View style={[styles.mediaContainer, { opacity: fadeAnim }]}>
            {renderMedia}
          </Animated.View>
        </TouchableWithoutFeedback>
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
            handleDownloadPress={handleDownloadPress}
            isSaved={isSaved}
            toggleCommentFeed={toggleCommentFeed}
            formatDate={formatDate}
            animatedBlurIntensity={animatedBlurIntensity}
            iconAreaRef={iconAreaRef}
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
              top: adjustedTop,
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
      <Animated.View 
  style={[
    StyleSheet.absoluteFill, 
    { 
      opacity: blurOpacity,
      backgroundColor: 'rgba(0,0,0,0.5)' // Add a semi-transparent background
    }
  ]}
>
  <BlurView intensity={20} style={StyleSheet.absoluteFill} />
</Animated.View>      
<LongPressModal
        isVisible={isLongPressModalVisible}
        onClose={closeLongPressModal}
        meme={{
          id: memeID,
          url: currentMedia,
          caption: caption,
        }}
        onSaveToProfile={handleDownloadPress}
        onShare={() => setShowShareModal(true)}
        onReport={() => {/* Implement report functionality */}}
        user={user}
        memeID={memeID}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
        setCounts={setCounts}
      />

    </Animated.View>
    
  );
});

export default React.memo(MediaPlayer);