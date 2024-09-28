import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {View,Text,Image,Dimensions,Animated,GestureResponderEvent,ActivityIndicator,TouchableWithoutFeedback,StyleSheet,Platform} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';
import {BlurView} from 'expo-blur';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import SafeImage from '../shared/SafeImage';
import styles from './MP.styles';
import {MediaPlayerProps} from '../../types/types';
import {addFollow} from '../../services/socialService';
import {usePanResponder} from './Logic/usePanResponder';
import {IconsAndContent} from './MediaPlayerContent';
import {useMediaPlayerLogic} from './Logic/useMediaPlayerLogic';
import {useUserStore} from '../../stores/userStore';
import {LongPressModal} from './LongPress/LongPressModal';
import {useTheme} from '../../theme/ThemeContext';
import  SplashScreen  from '../../screens/AppNav/Loading/SplashScreen';
const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);

const MediaPlayer: React.FC<MediaPlayerProps> = React.memo(
  ({
    memeUser = {email: '', isFollowed: false},
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
    const username = useUserStore(state => state.username);
    const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus,);
    const [imageSize, setImageSize] = useState({width: 0, height: 0});
    const [isLoading, setIsLoading] = useState(true);
    const [mediaLoadError, setMediaLoadError] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
    const [likePosition, setLikePosition] = useState({x: 0, y: 0});
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [viewedMemes, setViewedMemes] = useState<Set<string>>(new Set());

    const handleMediaError = useCallback(() => {
      setMediaLoadError(true);
      goToNextMedia();
    }, [goToNextMedia]);

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
        Image.getSize(
          currentMedia,
          (width, height) => {
            const aspectRatio = width / height;
            let calculatedWidth, calculatedHeight;

            if (aspectRatio > screenWidth / screenHeight) {
              calculatedWidth = screenWidth;
              calculatedHeight = screenWidth / aspectRatio;
            } else {
              calculatedHeight = screenHeight;
              calculatedWidth = screenHeight * aspectRatio;
            }

            setImageSize({width: calculatedWidth, height: calculatedHeight});
            setIsLoading(false);
          },
          error => {
            console.error('Failed to load image:', error);
            setMediaLoadError(true);
            handleMediaError();
          },
        );
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }, [currentMedia, mediaType, handleMediaError, fadeAnim]);
  

    useEffect(() => {
      loadMedia();
    
      if (nextMedia) {
        Image.prefetch(nextMedia);
      }
      if (prevMedia) {
        Image.prefetch(prevMedia);
      }

      if (memeID && index === currentIndex && !viewedMemes.has(memeID)) {
        setViewedMemes(prev => new Set(prev).add(memeID));
      }
      setIsFollowed(memeUser.isFollowed ?? false);
    }, [loadMedia,nextMedia,prevMedia,memeID,index,currentIndex]);
    
    const handleSingleTap = useCallback(() => {
      if (mediaType === 'video' && video.current) {
        if (status.isLoaded && status.isPlaying) {
          video.current.pauseAsync();
        } else if (status.isLoaded) {
          video.current.playAsync();
        }
      }
    }, [mediaType, status]);

    const {liked,doubleLiked,isSaved,showSaveModal,showShareModal,
      showToast,toastMessage,counts,friends,debouncedHandleLike,handleDownloadPress,
      onShare,formatDate,setShowSaveModal,setShowShareModal,setIsSaved,setCounts,
    } = useMediaPlayerLogic({
      handleDownload,onLikeStatusChange,handleSingleTap,
      initialLiked,initialDoubleLiked,initialLikeCount,initialDownloadCount,initialShareCount,initialCommentCount,
      user,memeID,mediaType,video,status,
    });

    const handleSwipeUp = useCallback(() => {
      goToNextMedia();
    }, [index, goToNextMedia]);

    const handleSwipeDown = useCallback(() => {
      goToPrevMedia();
    }, [index, goToPrevMedia]);

    const handleFollow = useCallback(async () => {
      if (!currentUserId || !memeUser.email) return;
      try {
        await addFollow(currentUserId, memeUser.email);
        setIsFollowed(true);
        useUserStore.getState().incrementFollowingCount();
        Toast.show({
          type: 'success',
          text1: 'Successfully followed user',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error('Error following user:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to follow user',
          position: 'bottom',
          visibilityTime: 2000,
        });
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
          const xOffset = Platform.OS === 'ios' ? -150 : -150; 
          const yOffset = Platform.OS === 'ios' ? -160 : -160;

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

    const {panHandlers, translateY, animatedBlurIntensity} = usePanResponder({
      onSwipeUp: handleSwipeUp,
      onSwipeDown: handleSwipeDown,
      handleTap,
      handleDoubleTap,
      handleLongPress,
      iconAreaRef,
      isSwiping,
      isCommentFeedVisible: false,
    });

    const renderMedia = useMemo(() => {
      if (!currentMedia) {
        return <Text style={styles.errorText}>Media not available</Text>;
      }

      if (isLoading) {
        return (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
            ]}
          >
            <SplashScreen username={username} />
          </View>
        );
      }

      if (mediaLoadError) {
        return <Text style={styles.errorText}>Failed to load media.</Text>;
      }

      if (!currentMedia) {
        return <Text style={styles.errorText}>Media not available.</Text>;
      }

      const isVideo =
        currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';

      if (isVideo) {
        return (
          <Animated.View style={[styles.videoContainer, {opacity: fadeAnim}]}>
            <Video
              ref={video}
              source={{uri: currentMedia}}
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
            source={{uri: currentMedia}}
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
            backgroundColor: isDarkMode ? '#000' : '#1C1C1C',
          },
        ]}
        {...panHandlers}>
        <TouchableWithoutFeedback onPress={handleTap}>
          <View
            style={[
              styles.mediaContainer,
              {
                backgroundColor: isDarkMode ? '#000' : '#1C1C1C',
              },
            ]}>
            {renderMedia}
            {showLikeAnimation && (
              <LottieView
                ref={lottieRef}
                source={require('../../assets/animations/lottie-liked.json')}
                style={{
                  position: 'absolute',
                  left: likePosition.x,
                  top: likePosition.y,
                  width: 300,
                  height: 300,
                }}
                autoPlay
                loop={false}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <IconsAndContent
          isFollowed={isFollowed}
          memeUser={memeUser}
          caption={caption}
          uploadTimestamp={uploadTimestamp}
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
          index={index}
          currentIndex={currentIndex}
          onShare={() => setShowShareModal(true)}
          user={user}
          memeID={memeID}
          numOfComments={numOfComments!}
        />
        {showToast && (
          <View
            style={[
              styles.toastContainer,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(0, 0, 0, 0.8)'
                  : 'rgba(28, 28, 28, 0.8)',
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
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: blurOpacity,
              backgroundColor: isDarkMode
                ? 'rgba(0, 0, 0, 0.5)'
                : 'rgba(28, 28, 28, 0.5)',
            },
          ]}>
          <BlurView intensity={10} style={StyleSheet.absoluteFill} />
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
          onReport={() => {}}
          user={user}
          memeID={memeID}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
          setCounts={setCounts}
        />
      </Animated.View>
    );
  },
);

export default MediaPlayer;