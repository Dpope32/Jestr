import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing , TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faSave, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import CommentFeed from './Modals/CommentFeed';
import { User } from '../screens/Feed/Feed';
import { updateMemeReaction } from './Meme/memeService';
import SaveSuccessModal from './Modals/SaveSuccessModal'; 

const { width, height } = Dimensions.get('window'); // Get device width and height

type MediaPlayerProps = {
  currentMedia: string;
  username: string;
  caption: string;
  uploadTimestamp: string;
  handleLike: () => void;
  handleDownload: () => void;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  likedIndices: Set<number>;
  downloadedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>;
  currentMediaIndex: number;
  user: User | null;
  likeCount: number;
  downloadCount: number;
  commentCount: number;
  profilePicUrl: string;
  memeID: string; // Add this line
  nextMedia: string | null;
};

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  currentMedia,
  nextMedia,
  username,
  caption,
  uploadTimestamp,
  handleLike,
  handleDownload,
  toggleCommentFeed,
  goToPrevMedia,
  goToNextMedia,
  currentMediaIndex,
  likedIndices,
  downloadedIndices,
  likeDislikeCounts,
  user,
  likeCount,
  downloadCount,
  commentCount,
  profilePicUrl,
  memeID
}) => {
  const translateY = useRef(new Animated.Value(0.5)).current;
  const [imageHeight, setImageHeight] = useState(height - 150);
  const [imageSize, setImageSize] = useState({ width: width, height: height - 150 });
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localDownloadCount, setLocalDownloadCount] = useState(downloadCount);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);
  const onSwipe = Animated.event([{ nativeEvent: { translationY: translateY } }], { useNativeDriver: true });

  const SWIPE_THRESHOLD = height / 4; // For example, 1/4 of the screen height

  useEffect(() => {
    setLocalLikeCount(likeCount);
    setLocalDownloadCount(downloadCount);
  }, [memeID, likeCount, downloadCount]);

  const toggleComments = () => {
    setShowComments(!showComments);
    toggleCommentFeed(); // Additional functionality can still be handled
  };

  useEffect(() => {
    Image.getSize(currentMedia, (imgWidth, imgHeight) => {
      const imgAspectRatio = imgWidth / imgHeight;
      const screenAspectRatio = width / (height - 150);
      if (imgAspectRatio > screenAspectRatio) {
        // Image is wider than screen
        setImageSize({ width: width, height: width / imgAspectRatio });
      } else {
        // Image is taller than screen or similar
        setImageSize({ height: height - 150, width: (height - 150) * imgAspectRatio });
      }
    });
  }, [currentMedia]);
  
  const currentMemeOpacity = translateY.interpolate({
    inputRange: [-height, -height / 2, 0],
    outputRange: [0, 0, 1]
  });

  const nextMemeTranslateY = translateY.interpolate({
    inputRange: [-height, 0.5, height],
    outputRange: [height, 0.5, -height] // Smooth transition without bouncing too high
  });
  

  const nextMemeOpacity = translateY.interpolate({
    inputRange: [-height, -height / 2, 0],
    outputRange: [1, 1, 0]
  });

  const handleSwipeRelease = (event: PanGestureHandlerGestureEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      let direction = nativeEvent.translationY > 0 ? 1 : -0.5;
      let isFullSwipe = Math.abs(nativeEvent.translationY) > SWIPE_THRESHOLD;
  
      if (isFullSwipe) {
        Animated.timing(translateY, {
          toValue: direction * height, // Swipe movement
          duration: 100,
          useNativeDriver: true
        }).start(() => {
          translateY.setValue(0.5); // Reset position for the current meme
          direction < 0 ? goToNextMedia() : goToPrevMedia(); // Correctly determine the next media
        });
      } else {
        // Reset to original position if not a full swipe
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    }
  };


  const formatDate = (dateString: string) => {
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
  };

  const handleLikePress = async () => {
    if (user) {
      try {
        await updateMemeReaction(memeID, true, false, user.email); // Use memeID prop
        handleLike();
        setLocalLikeCount(localLikeCount + 1);
        Animated.sequence([
          Animated.timing(likeAnimation, {
            toValue: 1.5,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(likeAnimation, {
            toValue: 1,
            duration: 200,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ]).start();
      } catch (error) {
        console.error('Error updating meme reaction:', error);
      }
    }
  };

  const handleDownloadPress = async () => {
    if (user) {
      try {
        await updateMemeReaction(memeID, false, true, user.email); // Use memeID prop
        handleDownload();
        setLocalDownloadCount(localDownloadCount + 1);
        setShowSaveModal(true);
        setTimeout(() => setShowSaveModal(false), 2000);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
      }
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      handleLikePress();
    } else {
      lastTap.current = now;
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onSwipe} onHandlerStateChange={handleSwipeRelease}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <TouchableWithoutFeedback onPress={handleDoubleTap}>
            <Animated.View>
              <Animated.Image
                source={{ uri: currentMedia }}
                style={[styles.memeImage, { height: imageSize.height, width: imageSize.width, opacity: currentMemeOpacity }]}
                resizeMode="contain"
              />
              {nextMedia && (
                <Animated.Image
                  source={{ uri: nextMedia }}
                  style={[styles.memeImage, { height: imageSize.height, width: imageSize.width, position: 'absolute', bottom: -imageSize.height, opacity: nextMemeOpacity }]}
                  resizeMode="contain"
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
          <View style={styles.textContainer}>
            <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
            <View>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.caption}>{caption}</Text>
              <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
      <View style={styles.iconColumn}>
        <TouchableOpacity onPress={handleLikePress} style={styles.iconWrapper}>
          <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
            <FontAwesomeIcon icon={faThumbsUp} size={28} color="#1bd40b" />
          </Animated.View>
          <Text style={styles.iconText}>{localLikeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownloadPress} style={styles.iconWrapper}>
          <FontAwesomeIcon icon={faSave} size={28} color="#1bd40b" />
          <Text style={styles.iconText}>{localDownloadCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleComments} style={styles.iconWrapper}>
          <FontAwesomeIcon icon={faComment} size={28} color="#1bd40b" />
          <Text style={styles.iconText}>{commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.iconWrapper}>
          <FontAwesomeIcon icon={faShare} size={28} color="#1bd40b" />
          <Text style={styles.iconText}>0</Text>
        </TouchableOpacity>
      </View>
      <SaveSuccessModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Ensures content is centered vertically
    alignItems: 'center', // Ensures content is centered horizontally
    backgroundColor: '#1C1C1C',
  },
  memeImage: {
    width: width,
    maxHeight: height - 250,
    alignSelf: 'center', 
    marginTop: 40
  },
  iconColumn: {
    position: 'absolute',
    right: 20,  // Increase right margin for better spacing
    top: '20%',  // Start lower to avoid the very top edge of the screen
    justifyContent: 'space-between',  // Improved spacing between icons
    height: '60%',  // Decrease height for a more compact look
  },
  textContainer: {
    position: 'relative', // Changed from absolute to relative
    bottom: 20,  // Adjust the bottom position
    left: 0,  // Standard left margin for alignment
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Increase opacity for readability
    padding: 12,  // Increased padding for better text separation
    borderRadius: 8,  // Soften the corners
    flexDirection: 'row',  // Layout direction for elements inside the container
    alignItems: 'center',  // Align items for a cleaner look
    marginTop: 20, // Ensure some space from the image
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,  // Circular shape
    marginRight: 12,  // Right margin for spacing between image and text
  },
  username: {
    fontWeight: 'bold',
    color: '#1bd40b',  // Bright green for visibility and design consistency
    fontSize: 18,  // Slightly larger for better readability
  },
  caption: {
    color: 'white',
    fontSize: 16,  // Standard size for body text
    flexShrink: 1,  // Allow text to shrink to avoid overflowing
  },
  date: {
    color: 'gray',  // Less emphasis on date
    fontSize: 12,  // Smaller font size for less importance
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',  // Clear background to reduce visual clutter
    borderRadius: 20,  // Rounded corners for a more modern look
    padding: 10,  // Consistent padding around icons
    marginBottom: 10,  // Space between icon wrappers if stacked
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4, // Space between icon and text
  },
});

export default MediaPlayer;
