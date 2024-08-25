import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  GestureResponderEvent,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';
import {BlurView} from 'expo-blur';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

import SafeImage from '../shared/SafeImage';
import styles from './MP.styles';
import {MediaPlayerProps} from '../../types/types';
import {addFollow , fetchBatchStatus} from '../../services/authFunctions';
import {usePanResponder} from './usePanResponder';
import {IconsAndContent} from './MediaPlayerContent';
import {useMediaPlayerLogic} from './useMediaPlayerLogic';
import {useUserStore} from '../../utils/userStore';
import {LongPressModal} from './LongPressModal';
import {checkFollowStatus} from '../../services/authFunctions';
import {useTheme} from '../../theme/ThemeContext';
import { debounce } from 'lodash';

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
    memes,
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
    setCurrentIndex,
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
    // const [retryCount, setRetryCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [canFollow, setCanFollow] = useState(true);
    const [lastTap, setLastTap] = useState(0);
    const [isLongPressModalVisible, setIsLongPressModalVisible] = useState(false);
    const [followStatuses, setFollowStatuses] = useState({});
    const [likePosition, setLikePosition] = useState({x: 0, y: 0});
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    // const isActive = index === currentIndex;
    const [viewedMemes, setViewedMemes] = useState<Set<string>>(new Set());
    const lastBatchCheckTimeRef = useRef(0);
    const lastRecordTimeRef = useRef(0);

    const updateFollowStatus = useCallback((email: string, status: boolean) => {
      setFollowStatuses(prev => ({...prev, [email]: status}));
    }, []);

    
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
              // Image is wider than the screen
              calculatedWidth = screenWidth;
              calculatedHeight = screenWidth / aspectRatio;
            } else {
              // Image is taller than or equal to the screen
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
    
  //  const checkBatchStatus = useCallback(async () => {
  //    if (currentUserId && memes.length > 0 && user?.email) {
  //      const memeIDs = memes.map(meme => meme.memeID);
  //      const uniqueUserEmails = Array.from(new Set(
  //        memes.map(meme => meme.memeUser?.email).filter((email): email is string => Boolean(email))
  //      ));
        
  //      try {
  //        const batchStatus = await fetchBatchStatus(memeIDs, user.email, uniqueUserEmails);
          
  //        if (batchStatus && batchStatus.followStatuses) {
  //          uniqueUserEmails.forEach(email => {
  //            if (batchStatus.followStatuses[email] !== undefined) {
  //              updateFollowStatus(email, batchStatus.followStatuses[email]);
  //            }
  //          });
  //        }
  //      } catch (error) {
  //        console.error('Error checking batch status:', error);
   //     }
   //   }
  //  }, [currentUserId, memes, user, updateFollowStatus]);
    
    // Debouncing the function to avoid frequent calls during rapid state updates
    
    

 //   const debouncedCheckBatchStatus = useMemo(
 //     () => debounce(checkBatchStatus, 1000),
 //     [checkBatchStatus]
 //   );

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
    }, [
      loadMedia,
      nextMedia,
      prevMedia,
      memeID,
      index,
      currentIndex,
//      debouncedCheckBatchStatus,
    ]);
    
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
      isSaved,
      showSaveModal,
      showShareModal,
      showToast,
      toastMessage,
      counts,
      friends,
      debouncedHandleLike,
      handleDownloadPress,
      onShare,
      formatDate,
      setShowSaveModal,
      setShowShareModal,
      setIsSaved,
      setCounts,
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

        // Adjust these values as needed
        const updateLikePosition = (x: number, y: number) => {
          const xOffset = Platform.OS === 'ios' ? -100 : -100;
          const yOffset = Platform.OS === 'ios' ? -250 : -220;

          setLikePosition({
            x: x + xOffset,
            y: y + yOffset,
          });
        };

        updateLikePosition(pageX, pageY); // Ensure both pageX and pageY are passed
        setShowLikeAnimation(true);
        debouncedHandleLike();

        setTimeout(() => {
          setShowLikeAnimation(false);
        }, 1000); // Hide the animation after 1 second
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
          </View>
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