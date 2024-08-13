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
import { debounce } from 'lodash';
import { usePanResponder } from './usePanResponder';
import { IconsAndContent } from './MediaPlayerContent';
import { useMediaPlayerLogic } from './useMediaPlayerLogic';
import { useTheme } from '../../ThemeContext';
const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const { width, height } = Dimensions.get('window');

const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);
interface Friend {
  username: string;
  profilePic: string;
}

export type ShareType = 'copy' | 'message' | 'snapchat' | 'facebook' | 'twitter' | 'email' | 'friend' | 'instagram';

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
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const lottieRef = useRef(null);
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevOpacity = useRef(new Animated.Value(0)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = height * 0.1; // Reduced from 0.25 to 0.15
  
    const handleMediaError = useCallback(() => {
      //console.error('Failed to load media:', currentMedia);
      setMediaLoadError(true);
      goToNextMedia();
    }, [currentMedia, goToNextMedia]);
  
    useEffect(() => {
      setMediaLoadError(false);
      setIsLoading(true);
      fadeAnim.setValue(0);
      translateY.setValue(0);
      animatedBlurIntensity.setValue(0);
  
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
  
      const isVideo = currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';
      const screenWidth = Dimensions.get('window').width;
  
      if (isVideo) {
        setImageSize({ width: screenWidth, height: screenWidth * (9/16) });
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
            height={imageSize.height + 20}
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error:', error);
              setMediaLoadError(true);
            }}
          />
        );
      }
    }, [isLoading, mediaLoadError, currentMedia, mediaType, fadeAnim, imageSize, handleMediaError]);
  
  
      return (
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY }],
              backgroundColor: isDarkMode ? '#1C1C1C' : '#696969'  
            }
          ]} 
          {...panHandlers}
        >
          <View style={styles.contentContainer}>
        <TouchableWithoutFeedback onPress={handleDoubleTap}>
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
              width: 100,
              height: 100,
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
        {responseModalVisible && (
          <Text>{responseMessage}</Text>
        )}
        </View>
      </Animated.View>
    );
  });
  
  export default React.memo(MediaPlayer);