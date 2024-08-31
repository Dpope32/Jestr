import React, {useState, useRef, useCallback} from 'react';
import {View, Text} from 'react-native';
import {Dimensions, Animated} from 'react-native';
import {StyleSheet, Image} from 'react-native';
import {GestureResponderEvent, ActivityIndicator} from 'react-native';
import {Video, AVPlaybackStatus, ResizeMode} from 'expo-av';

import styles from './styles';
import {MediaPlayerProps} from '../../types/types';
import {getMediaSource} from '../../utils/utils';
// import {usePanResponder} from './usePanResponder';
// import {useTheme} from '../../theme/ThemeContext';
// import {useMediaPlayerLogic} from './useMediaPlayerLogic';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const AnimatedSafeImage = Animated.createAnimatedComponent(Image);

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  currentMedia,
  goToPrevMedia,
  goToNextMedia,
  // {...user} props
  mediaType,
}) => {
  const video = useRef<Video>(null);

  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const isLocalFile = currentMedia.startsWith('../assets/');
  const isVideo =
    currentMedia.toLowerCase().endsWith('.mp4') || mediaType === 'video';

  const mediaSource = isLocalFile
    ? getMediaSource(currentMedia)
    : {uri: currentMedia};

  const handleMediaError = () => {
    setMediaLoadError(true);
    // goToNextMedia();
  };

  // === H A N D L E  S I N G L E  T A P ===
  const handleSingleTap = () => {
    if (mediaType === 'video' && video.current) {
      if (status?.isLoaded && status.isPlaying) {
        video.current.pauseAsync();
      } else if (status?.isLoaded) {
        video.current.playAsync();
      }
    } else {
    }
  };

  const handleSwipeUp = () => {
    // console.log(`MediaPlayer ${index} - Swipe up`);
    goToNextMedia();
  };

  const handleSwipeDown = () => {
    //  console.log(`MediaPlayer ${index} - Swipe down`);
    goToPrevMedia();
  };

  const handleLongPress = () => {
    // setIsLongPressModalVisible(true);
    // Animated.timing(blurOpacity, {
    //   toValue: 1,
    //   duration: 100,
    //   useNativeDriver: false,
    // }).start();
  };

  const handleDoubleTap = (event: GestureResponderEvent) => {
    // const {pageX, pageY}: {pageX: number; pageY: number} = event.nativeEvent;
    // const updateLikePosition = (x: number, y: number) => {
    //   // const xOffset = Platform.OS === 'ios' ? -100 : -100;
    //   // const yOffset = Platform.OS === 'ios' ? -250 : -220;
    //   // setLikePosition({
    //   //   x: x + xOffset,
    //   //   y: y + yOffset,
    //   // });
    // };
    // updateLikePosition(pageX, pageY);
    // setShowLikeAnimation(true);
    // debouncedHandleLike();
    // setTimeout(() => {
    //   setShowLikeAnimation(false);
    // }, 1000);
  };

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

  // const {panHandlers} = usePanResponder({
  //   onSwipeUp: handleSwipeUp,
  //   onSwipeDown: handleSwipeDown,
  //   handleTap,
  //   handleDoubleTap,
  //   handleLongPress,
  //   isCommentFeedVisible: false,
  //   isProfilePanelVisible: false,
  // });

  if (!currentMedia) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Media not available</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1bd40b" />
      </View>
    );
  }

  if (mediaLoadError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load media.</Text>
      </View>
    );
  }

  if (isVideo) {
    console.log('Rendering video:', currentMedia);
    return (
      <Video
        ref={video}
        source={mediaSource}
        style={[StyleSheet.absoluteFill, styles.video]}
        resizeMode={ResizeMode.COVER}
        useNativeControls
        // shouldPlay={!isLoading}
        isLooping
        // onPlaybackStatusUpdate={status => setStatus(() => status)}
        isMuted={true}
        onError={handleMediaError}
      />
    );
  } else {
    console.log('Rendering image:', currentMedia);
    return (
      <AnimatedSafeImage
        source={mediaSource}
        style={[styles.imgContainer]}
        width={screenWidth}
        height={screenHeight}
        resizeMode="contain"
        onError={handleMediaError}
      />
    );
  }
};

export default MediaPlayer;

{
  /* <TouchableWithoutFeedback onPress={handleTap}>
              </TouchableWithoutFeedback> */
}
