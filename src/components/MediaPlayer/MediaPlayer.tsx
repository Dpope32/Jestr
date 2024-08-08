import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {  Image, TouchableOpacity,GestureResponderEvent, Dimensions, Animated, PanResponder, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faSave, faComment, faShare, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Text } from 'react-native';
import SafeImage from './SafeImage'; // Adjust the import path as needed
import styles from './MP.styles';
import { User, MediaPlayerProps } from '../../types/types';
import { updateMemeReaction } from '../Meme/memeService';
import { handleShareMeme, recordMemeView  } from '../../services/authFunctions';
import { getLikeStatus } from '../Meme/memeService';
import { View, Button } from 'react-native';
import { Video, AVPlaybackStatus,  ResizeMode  } from 'expo-av';
import { BlurView } from 'expo-blur';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import LottieView from 'lottie-react-native';
import { debounce } from 'lodash';

interface IconButtonProps {
  icon: IconDefinition;
  count: number;
  onPress: () => void;
  color?: string;
}

const SaveSuccessModal = React.lazy(() => import('../Modals/SaveSuccessModal'));
const ShareModal = React.lazy(() => import('../Modals/ShareModal'));

const { width, height } = Dimensions.get('window'); // Get device width and height

interface Friend {
  username: string;
  profilePic: string;
}

export type ShareType = 'copy' | 'message' | 'snapchat' | 'facebook' | 'twitter' | 'email' | 'friend' | 'instagram';

const AnimatedSafeImage = Animated.createAnimatedComponent(SafeImage);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const MediaPlayer: React.FC<MediaPlayerProps> = React.memo(({
  memeUser = {},
  currentMedia,
  mediaType,
  prevMedia,
  nextMedia,
  username,
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
  isDarkMode,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(initialLiked);
  const [doubleLiked, setDoubleLiked] = useState(initialDoubleLiked);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [counts, setCounts] = useState({
    likes: initialLikeCount,
    downloads: initialDownloadCount,
    shares: initialShareCount,
    comments: initialCommentCount
  });
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likePosition, setLikePosition] = useState({ x: 0, y: 0 });
  const lottieRef = useRef(null);
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevOpacity = useRef(new Animated.Value(0)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedBlurIntensity = useRef(new Animated.Value(0)).current;
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
  
// In MediaPlayer
useEffect(() => {
  const checkLikeStatus = async () => {
    if (user && user.email) {
      try {
        const result = await getLikeStatus(memeID, user.email);
        if (result) {
          setLiked(result.liked);
          setDoubleLiked(result.doubleLiked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    } else {
      console.log('User email not available yet');
    }
  };
  checkLikeStatus();
}, [memeID, user]);

  
    const handleLikePress = useCallback(async () => {
      if (user) {
        const newLikedState = !liked;
        let newDoubleLikedState = doubleLiked;
        let newLikeCount = counts.likes;
  
        if (newLikedState) {
          if (doubleLiked) {
            newDoubleLikedState = false;
            newLikeCount -= 1;
          } else {
            newLikeCount += 1;
          }
        } else {
          newLikeCount -= 1;
        }
  
        setLiked(newLikedState);
        setDoubleLiked(newDoubleLikedState);
        setCounts(prevCounts => ({ ...prevCounts, likes: newLikeCount }));
  
        try {
          await updateMemeReaction(memeID, newLikedState, newDoubleLikedState, false, user.email);
          onLikeStatusChange(memeID, { liked: newLikedState, doubleLiked: newDoubleLikedState }, newLikeCount);
        } catch (error) {
          console.error('Error updating meme reaction:', error);
          setLiked(initialLiked);
          setDoubleLiked(initialDoubleLiked);
          setCounts(prevCounts => ({ ...prevCounts, likes: initialLikeCount }));
        }
      }
    }, [user, liked, doubleLiked, counts.likes, memeID, onLikeStatusChange, initialLiked, initialDoubleLiked, initialLikeCount]);
  
    const debouncedHandleLike = useCallback(
      debounce(() => {
        handleLikePress();
      }, 300),
      [handleLikePress]
    );
  
    const handleDoubleTap = useCallback((event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      setLikePosition({ 
        x: locationX -50,
        y: locationY +50
      });
      setShowLikeAnimation(true);
      debouncedHandleLike();
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000);
    }, [debouncedHandleLike]);
  
    const handleDownloadPress = useCallback(async () => {
      if (user) {
        try {
          const newSavedState = !isSaved;
          await updateMemeReaction(memeID, false, false, newSavedState, user.email);
          handleDownload();
          setIsSaved(newSavedState);
          setCounts(prev => ({ ...prev, downloads: prev.downloads + (newSavedState ? 1 : -1) }));
          setToastMessage(newSavedState ? 'Meme added to your gallery!' : 'Meme has been removed from your gallery');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } catch (error) {
          console.error('Error updating meme reaction:', error);
        }
      }
    }, [user, memeID, handleDownload, isSaved]);
  
    const panResponder = useMemo(() => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dx) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
        const newBlurIntensity = Math.min(100, Math.abs(gestureState.dy) / 1.5);
        animatedBlurIntensity.setValue(newBlurIntensity);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
          if (gestureState.dy < 0 && nextMedia) {
            goToNextMedia();
          } else if (gestureState.dy > 0 && prevMedia) {
            goToPrevMedia();
          }
        }
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(animatedBlurIntensity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      }
    }), [nextMedia, prevMedia, goToNextMedia, goToPrevMedia]);

    const onShare = useCallback(async (type: ShareType, username: string, message: string) => {
      if (user && type === 'friend' && username) {
        try {
          await handleShareMeme(memeID, user.email, user.username, username, message, setShowShareModal, setToastMessage);
          setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
        } catch (error) {
          console.error('Sharing failed:', error);
          setToastMessage('Failed to share meme.');
        }
      }
    }, [user, memeID]);
  
    const formatDate = useCallback((dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diff / (1000 * 60));
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  
      if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return `Yesterday`;
      } else {
        return `${diffDays} days ago`;
      }
    }, []);
  
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
  
    const IconsAndContent = useCallback(() => (
      <AnimatedBlurView 
        intensity={animatedBlurIntensity} 
        tint="dark" 
        style={[
          styles.blurContainer,
          { opacity: Animated.subtract(1, Animated.divide(animatedBlurIntensity, 100)) }
        ]}
      >
        <View style={styles.textContainer}>
          <Image source={{ uri: memeUser?.profilePic }} style={styles.profilePic} />
          <View style={styles.textContent}>
            <Text style={styles.username}>{memeUser?.username}</Text>
            {caption && <Text style={styles.caption}>{caption}</Text>}
            <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
          </View>
        </View>
        <View style={styles.iconColumn}>
          <IconButton icon={faThumbsUp} count={counts.likes} onPress={debouncedHandleLike} color={liked || doubleLiked ? '#006400' : "#1bd40b"} />
          <IconButton icon={faSave} count={counts.downloads} onPress={handleDownloadPress} color={isSaved ? "#006400" : "#1bd40b"} />
          <IconButton icon={faComment} count={counts.comments} onPress={toggleCommentFeed} />
          <IconButton icon={faShare} count={counts.shares} onPress={() => {}} />
        </View>
      </AnimatedBlurView>
    ), [animatedBlurIntensity, memeUser, caption, uploadTimestamp, counts, debouncedHandleLike, liked, doubleLiked, handleDownloadPress, isSaved, toggleCommentFeed, formatDate]);
  
    const IconButton: React.FC<IconButtonProps> = useCallback(({ icon, count, onPress, color = "#1bd40b" }) => (
      <TouchableOpacity onPress={onPress} style={styles.iconWrapper}>
        <FontAwesomeIcon icon={icon} size={28} color={color} />
        <Text style={[styles.iconText, { color: isDarkMode ? '#FFFFFF' : '#CCCCCC' }]}>{count}</Text>
      </TouchableOpacity>
    ), [isDarkMode]);
  
    return (
      <Animated.View style={[styles.container, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
        <TouchableWithoutFeedback onPress={handleDoubleTap}>
          <Animated.View style={[styles.mediaContainer, { opacity: fadeAnim }]}>
            {renderMedia}
          </Animated.View>
        </TouchableWithoutFeedback>
        <IconsAndContent />
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
            currentMedia= {currentMedia}
          />

            {responseModalVisible && (
                <Text>{responseMessage}</Text>
            )}
         </Animated.View>
    );
}
);



export default React.memo(MediaPlayer);
