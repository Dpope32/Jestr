
import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing , TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faSave, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import CommentFeed from './CommentFeed';
import { User } from '../screens/Feed/Feed';
import { updateMemeReaction } from './Meme/memeService';
import SaveSuccessModal from './SaveSuccessModal'; 

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
};
const MediaPlayer: React.FC<MediaPlayerProps> = ({
  currentMedia,
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
  const [imageHeight, setImageHeight] = useState(height - 150);
  const [imageSize, setImageSize] = useState({ width: width, height: height - 150 });
  const translateY = new Animated.Value(0);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localDownloadCount, setLocalDownloadCount] = useState(downloadCount);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

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

  const onSwipe = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      let direction = event.nativeEvent.translationY > 0 ? 1 : -1;
      Animated.spring(translateY, {
        toValue: direction * height,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0
      }).start(() => {
        translateY.setValue(0);
        direction > 0 ? goToPrevMedia() : goToNextMedia();
      });
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
      <PanGestureHandler onGestureEvent={onSwipe} onHandlerStateChange={onSwipe}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <TouchableWithoutFeedback onPress={handleDoubleTap}>
            <Image source={{ uri: currentMedia }} style={[styles.memeImage, { height: imageHeight }]} resizeMode="contain" />
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
    backgroundColor: '#1C1C1C',
    marginTop: 70,
  },
  memeImage: {
    width: width,
    height: height - 150,
  },
  iconColumn: {
    position: 'absolute',
    right: 10,
    top: '15%',
    justifyContent: 'space-around',
    height: '70%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 27,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background for readability
    padding: 8,
    minWidth: '60%',
    flexDirection: 'row', // Added for row layout
    borderRadius: 10, // Rounded corners for a better look
    alignItems: 'center', // Center items vertically
    marginLeft: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14, // Added margin for spacing
  },
  username: {
    fontWeight: 'bold',
    color: '#1bd40b',
    fontSize: 16,
  },
  caption: {
    color: 'white',
    fontSize: 16,
  },
  date: {
    color: 'white',
    fontSize: 10,
    paddingBottom: 10,
  },
  iconWrapper: {
    alignItems: 'center', // Center text below icons
    backgroundColor: 'rgba(0, 0, 0, 0.0)', // Semi-transparent background for better visibility
    borderRadius: 15, // Rounded corners for a better look
    
    padding: 8, // Add padding for more spacing
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4, // Space between icon and text
  },
});

export default MediaPlayer;
