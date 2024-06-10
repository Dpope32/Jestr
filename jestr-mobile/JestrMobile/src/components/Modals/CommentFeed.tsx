import React, { useState, useRef, useEffect } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';
import { View, Text, TextInput, Animated, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import Comment from './Comment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../screens/Feed/Feed';
import { fetchComments, postComment, updateCommentReaction } from '../Meme/memeService';
import DefaultPfp from '../assets/images/db/JestrLogo.jpg';

const screenHeight = Dimensions.get('window').height;

export type CommentType = {
  commentID: string;
  text: string;
  username: string;
  profilePicUrl: string;
  likesCount: number;
  dislikesCount: number;
  timestamp: string;
  repliesCount: number;
};

type CommentFeedProps = {
  mediaIndex: number;
  memeID: string;
  profilePicUrl: string;
  user: User | null;
  isCommentFeedVisible: boolean;
  toggleCommentFeed: () => void;
};

const CommentFeed: React.FC<CommentFeedProps> = ({
  mediaIndex,
  profilePicUrl,
  user,
  memeID,
  isCommentFeedVisible,
  toggleCommentFeed,
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const modalY = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    const loadComments = async () => {
      try {
        console.log(`Fetching comments for memeID: ${memeID}`);
        const fetchedComments = await fetchComments(memeID);
        console.log(`Fetched comments for memeID ${memeID}:`, fetchedComments);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (isCommentFeedVisible) {
      loadComments();
      Animated.timing(modalY, {
        toValue: screenHeight * 0.00001,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [memeID, isCommentFeedVisible]);

  const closeModal = () => {
    Animated.timing(modalY, {
      toValue: screenHeight,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      toggleCommentFeed();
    });
  };

  const handlePanResponderMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.dy > 0) {
      modalY.setValue(gestureState.dy);
    }
  };

  const handlePanResponderRelease = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.dy > 100) {
      closeModal();
    } else {
      Animated.spring(modalY, {
        toValue: screenHeight * 0.33,
        useNativeDriver: true,
      }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  const handleAddComment = async () => {
    if (newComment.trim() !== '' && user) {
      try {
        await postComment(memeID, newComment, user);
        const updatedComments = await fetchComments(memeID);
        setComments(updatedComments);
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    } else {
      console.error('User is null, cannot post comment.');
    }
  };

  const handleLike = async (commentID: string) => {
    try {
      await updateCommentReaction(commentID, memeID, true, false);
      const updatedComments = await fetchComments(memeID);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDislike = async (commentID: string) => {
    try {
      console.log('DislikeClicked');
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
  };

  return (
    <Animated.View
      style={[styles.modalContainer, { transform: [{ translateY: modalY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <FontAwesomeIcon icon={faTimes} size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.commentCount}>Comments ({comments.length})</Text>
        <View style={styles.commentsContainer}>
          {comments.map((comment, index) => (
            <Comment
              key={index}
              commentText={comment.text}
              userName={comment.username}
              profilePicUrl={comment.profilePicUrl}
              likesCount={comment.likesCount}
              dislikesCount={comment.dislikesCount}
              timestamp={comment.timestamp}
              onLike={() => handleLike(comment.commentID)}
              onDislike={() => handleDislike(comment.commentID)}
              onReply={() => console.log('Reply clicked')}
              onViewReplies={() => console.log('View replies clicked')}
              repliesCount={comment.repliesCount || 0}
            />
          ))}
        </View>
        <View style={styles.newCommentContainer}>
          <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
          <TextInput
            style={styles.newCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#ccc"
            value={newComment}
            onChangeText={text => setNewComment(text)}
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <FontAwesomeIcon icon={faArrowUp} color="green" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -20,
    zIndex: 5,
    height: '80%',
    backgroundColor: 'rgba(85, 85, 85, 0.90)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 6,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(85, 85, 85, 0.80)',
    zIndex: 5,
    color: 'white',
    padding: 20,
    marginBottom: 10,
  },
  commentCount: {
    alignSelf: 'center',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 10,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    zIndex: 5,
    paddingTop: 10,
  },
  newCommentInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: 'white',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 5,
    marginRight: 10,
  },
});

export default CommentFeed;
