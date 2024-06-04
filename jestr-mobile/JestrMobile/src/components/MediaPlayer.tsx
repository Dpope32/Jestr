import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { GestureHandlerStateChangeEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import  CommentFeed  from './CommentFeed'
import { User } from '../screens/Feed/Feed';


const { width, height } = Dimensions.get('window'); // Get device width and height

type MediaPlayerProps = {
  currentMedia: string;
  username: string;
  caption: string;
  uploadTimestamp: string;
  handleLike: () => void;
  handleDislike: () => void;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  likedIndices: Set<number>;
  dislikedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>;
  currentMediaIndex: number;
  user: User | null; 
};


const MediaPlayer: React.FC<MediaPlayerProps> = ({
  currentMedia,
  username,
  caption,
  uploadTimestamp,
  handleLike,
  handleDislike,
  toggleCommentFeed,
  goToPrevMedia,
  goToNextMedia,
  currentMediaIndex,
  likedIndices,
  dislikedIndices,
  likeDislikeCounts,
  user
}) => {
  const [imageHeight, setImageHeight] = useState(height - 170);
  const [imageSize, setImageSize] = useState({ width: width, height: height - 170 });
  const translateY = new Animated.Value(0);

    // State to manage the visibility of comments
    const [showComments, setShowComments] = useState(false);

    const toggleComments = () => {
      setShowComments(!showComments);
      toggleCommentFeed();  // Additional functionality can still be handled
    };

  useEffect(() => {
    Image.getSize(currentMedia, (imgWidth, imgHeight) => {
      const imgAspectRatio = imgWidth / imgHeight;
      const screenAspectRatio = width / (height - 170);
      if (imgAspectRatio > screenAspectRatio) {
        // Image is wider than screen
        setImageSize({ width: width, height: width / imgAspectRatio });
      } else {
        // Image is taller than screen or similar
        setImageSize({ height: height - 170, width: (height - 170) * imgAspectRatio });
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
    return date.toLocaleDateString("en-US");
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onSwipe} onHandlerStateChange={onSwipe}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Image source={{ uri: currentMedia }} style={[styles.memeImage, { height: imageHeight }]} resizeMode="contain" />
          <View style={styles.textContainer}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.caption}>{caption}</Text>
            <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
      <View style={styles.iconColumn}>
        <TouchableOpacity onPress={handleLike}><FontAwesomeIcon icon={faThumbsUp} size={24} color="#1bd40b" /></TouchableOpacity>
        <TouchableOpacity onPress={handleDislike}><FontAwesomeIcon icon={faThumbsDown} size={24} color="#1bd40b" /></TouchableOpacity>
        <TouchableOpacity onPress={toggleCommentFeed}>
          <FontAwesomeIcon icon={faComment} size={24} color="#1bd40b" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}><FontAwesomeIcon icon={faShare} size={24} color="#1bd40b" /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    marginTop: 70,
  },
  memeImage: {
    width: width,
    height: height,
  },
  iconColumn: {
    position: 'absolute',
    right: 20,
    top: 280,
    justifyContent: 'space-between',
    height: 350,
  },
  textContainer: {
    position: 'absolute',
    bottom: 10,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background for readability
    padding: 10,
  },
  username: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  caption: {
    color: 'white',
    fontSize: 14,
  },
  date: {
    color: 'white',
    fontSize: 12,
  },
});

export default MediaPlayer;