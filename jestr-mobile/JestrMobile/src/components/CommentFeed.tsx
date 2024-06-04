import React, { useState, useRef, useEffect } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';
import { View, Text, TextInput, Modal, StyleSheet, Animated, TouchableOpacity, Image, Dimensions } from 'react-native';
import Comment from './Comment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { User } from '../screens/Feed/Feed';
import { fetchComments, postComment } from './Meme/memeService';
import  comment  from './Comment'
import DefaultPfp from '../assets/images/db/JestrLogo.jpg';

const screenHeight = Dimensions.get('window').height;

export type CommentType = {
  commentID: string;
  text: string;
  username: string;
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

const CommentFeed: React.FC<CommentFeedProps> = ({ mediaIndex, profilePicUrl, user, memeID }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const modalY = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    Animated.timing(modalY, {
      toValue: screenHeight * 0.00000001, // Adjusted to show modal correctly
      duration: 500,
      useNativeDriver: true
    }).start();

    const loadComments = async () => {
      try {
        const fetchedComments = await fetchComments(memeID);
        console.log("Fetched comments for verification:", fetchedComments);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
  
    loadComments();
  }, [memeID]);
  

  const closeModal = () => {
    Animated.timing(modalY, {
      toValue: screenHeight,
      duration: 500,
      useNativeDriver: true
    }).start();
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
        commentID: Math.random().toString(36).substring(7), // Generate a pseudo-random ID for the comment
        text: newComment,
        username: user ? user.username : 'Unknown user',
        profilePicUrl: user && user.profilePic ? user.profilePic : DefaultPfp,
        likesCount: 0,
        dislikesCount: 0
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
          <Comment
            key={index}
            commentText={comment.text}
            userName={comment.username}
            profilePicUrl={comment.profilePicUrl}
            likesCount={comment.likesCount}
            dislikesCount={comment.dislikesCount}
            onLike={() => console.log('Like clicked')}
            onDislike={() => console.log('Dislike clicked')}
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
    color: 'white'
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
