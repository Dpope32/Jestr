import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

type MediaPlayerProps = {
  currentMedia: string;
  handleLike: () => void;
  handleDislike: () => void;
  likedIndices: Set<number>;
  dislikedIndices: Set<number>;
  likeDislikeCounts: { [key: number]: number };
  currentMediaIndex: number;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
};

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  currentMedia,
  handleLike,
  handleDislike,
  likedIndices,
  dislikedIndices,
  likeDislikeCounts,
  currentMediaIndex,
  toggleCommentFeed,
  goToPrevMedia,
  goToNextMedia,
}) => {
  console.log('Rendering media with URL:', currentMedia);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentMedia }}
        style={styles.memeImage}
        onError={(error) => console.error('Image loading error:', error)}
      />
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={handleLike}>
          <FontAwesomeIcon icon={faThumbsUp} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDislike}>
          <FontAwesomeIcon icon={faThumbsDown} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCommentFeed}>
          <FontAwesomeIcon icon={faComment} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <FontAwesomeIcon icon={faShare} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={goToPrevMedia}>
        <Text>Swipe Down</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToNextMedia}>
        <Text>Swipe Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  memeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
});

export default MediaPlayer;
