import React, { useState, useRef, useEffect } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';
import { View, Text, TextInput, Modal, StyleSheet, Animated, TouchableOpacity, Image, Dimensions } from 'react-native';
import Comment from './Comment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { User } from '../screens/Feed/Feed';
import { fetchComments } from './Meme/memeService';

const screenHeight = Dimensions.get('window').height;

export type CommentType = {
  commentID: string;
  text: string;
  userName: string;
  profilePicUrl: string;
  likesCount: number;
  dislikesCount: number;
};

type CommentFeedProps = {
  mediaIndex: number;
  memeID: string;
  profilePicUrl: string;
  user: User | null; // Add the user prop
};

const CommentFeed: React.FC<CommentFeedProps> = ({ mediaIndex, profilePicUrl, user, memeID}) => {
  const [comments, setComments] = useState<{ text: string; userName: string; profilePicUrl: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const modalY = useRef(new Animated.Value(screenHeight)).current;  // Start fully off-screen


  useEffect(() => {
    // Animate modal to slide up to cover approximately 2/3 of the screen
    Animated.timing(modalY, {
      toValue: screenHeight * 0.0000000001,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    fetchComments(memeID).then(comments => {
      if (comments) {
        setComments(comments);
      } else {
        console.error('No comments fetched or data is undefined');
      }
    }).catch(error => console.error('Error fetching comments:', error));
  }, []);

  const closeModal = () => {
    // Animate the modal back off the screen
    Animated.timing(modalY, {
      toValue: screenHeight,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      setComments([]); // Optionally reset the comment state
    });
  };

  const handlePanResponderMove = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.dy > 0) {  // Allow dragging only downwards
      modalY.setValue(gestureState.dy);
    }
  };

  const handlePanResponderRelease = (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.dy > 100) {  // Threshold to close modal
      closeModal();
    } else {
      // Snap back to open position
      Animated.spring(modalY, {
        toValue: screenHeight * 0.33,
        useNativeDriver: true
      }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease
    })
  ).current;

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      const newComments = [...comments, {
        text: newComment,
        userName: 'Your Username',  // Assume you will replace with actual username
        profilePicUrl: 'https://via.placeholder.com/40'
      }];
      setComments(newComments);
      setNewComment('');
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
            <View key={index} style={styles.comment}>
            <Image source={{ uri: comment.profilePicUrl }} style={styles.commentProfilePic} />
            <Text style={styles.commentText}>{comment.userName}: {comment.text}</Text>
          </View>
          ))}
        </View>
        <View style={styles.newCommentContainer}>
        <Image source={{ uri: profilePicUrl }} style={styles.profilePic} /> 
        <TextInput
            style={styles.newCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor="white" // Set placeholder text color to white
            value={newComment}
            onChangeText={setNewComment}
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
    backgroundColor: '#1C1C1C',  // Dark gray background
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
    backgroundColor: '#1C1C1C',  // Dark gray background
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
    color: 'white'
  },
  commentsContainer: {
    flex: 1,
    color: 'white',
    zIndex: 5,
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
    color: 'white', // Set text color to white
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 5,
    marginRight: 10,
  },
  commentProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    color: 'white', // Set text color to white
    borderBottomColor: '#eee',
  },
  commentText: {
    color: 'white', // Set comment text color to white
  },
  commentUserName: {
    color: 'green', // Set comment text color to white
  },
});

export default CommentFeed;
