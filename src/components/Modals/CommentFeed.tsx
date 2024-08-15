import React, { useState, useRef, useEffect } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';
import { View, Text, TextInput, Animated, TouchableOpacity, Image, Dimensions, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import Comment from './Comment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faReply, faTimes } from '@fortawesome/free-solid-svg-icons';
import { User, ProfileImage } from '../../types/types';
import { fetchComments, postComment, updateCommentReaction } from '../Meme/memeService';
import DefaultPfp from '../assets/images/db/JestrLogo.jpg';

const screenHeight = Dimensions.get('window').height;

export type CommentType = {
  commentID: string;
  text: string;
  username: string;
  profilePicUrl: string | ProfileImage | null;
  likesCount: number;
  dislikesCount: number;
  timestamp: string;
  parentCommentID: string | null;
  replies: CommentType[];
};

type CommentFeedProps = {
  mediaIndex: number;
  memeID: string;
  profilePicUrl: string | ProfileImage | null;
  user: User | null;  // Ensure this is present
  isCommentFeedVisible: boolean;
  toggleCommentFeed: () => void;
  updateCommentCount: (memeID: string, newCount: number) => void;
};

const CommentFeed: React.FC<CommentFeedProps> = ({
  mediaIndex,
  profilePicUrl,
  user,
  memeID,
  isCommentFeedVisible,
  toggleCommentFeed,
  updateCommentCount, // Add this prop
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const modalY = useRef(new Animated.Value(screenHeight)).current;
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadComments = async () => {
      if (user && memeID) {
        try {
       //   console.log(`Fetching comments for memeID: ${memeID}`);
          const fetchedComments = await fetchComments(memeID);
        //  console.log(`Fetched comments for memeID ${memeID}:`, fetchedComments);
          setComments(organizeCommentsIntoThreads(fetchedComments));
          updateCommentCount(memeID, fetchedComments.length); // Pass memeID and new count
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      } else {
        console.log('User or memeID not available, skipping comment fetch');
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

  const organizeCommentsIntoThreads = (flatComments: CommentType[]): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const topLevelComments: CommentType[] = [];
  
    flatComments.forEach(comment => {
      commentMap.set(comment.commentID, { ...comment, replies: [] });
    });
  
    flatComments.forEach(comment => {
      if (comment.parentCommentID) {
        const parentComment = commentMap.get(comment.parentCommentID);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.commentID)!);
        }
      } else {
        topLevelComments.push(commentMap.get(comment.commentID)!);
      }
    });
  
    return topLevelComments;
  };

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
        await postComment(memeID, newComment, user, replyingTo || undefined);
        const updatedComments = await fetchComments(memeID);
        const threadedComments = organizeCommentsIntoThreads(updatedComments);
        setComments(threadedComments);
        setNewComment('');
        setReplyingTo(null);
        updateCommentCount(memeID, updatedComments.length);
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    } else if (!user) {
      console.error('User is null, cannot post comment.');
      // You might want to show an alert or message to the user here
    }
  };

  const handleLike = async (commentID: string) => {
    try {
      await updateCommentReaction(commentID, memeID, true, false);
      const updatedComments = await fetchComments(memeID);
      const threadedComments = organizeCommentsIntoThreads(updatedComments);
      setComments(threadedComments);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDislike = async (commentID: string) => {
    try {
      await updateCommentReaction(commentID, memeID, false, true);
      const updatedComments = await fetchComments(memeID);
      const threadedComments = organizeCommentsIntoThreads(updatedComments);
      setComments(threadedComments);
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
  };

  const handleReply = (commentID: string, username: string) => {
    setReplyingTo(commentID);
    setReplyingToUsername(username);
    setNewComment(`@${username} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyingToUsername(null);
    setNewComment('');
  };

  const renderComment = (comment: CommentType) => (
    <Comment
      key={comment.commentID}
      comment={comment}
      onLike={handleLike}
      onDislike={handleDislike}
      onReply={handleReply}
      depth={0}
    />
  );

  const getImageSource = (profilePic: string | ProfileImage | null) => {
    if (typeof profilePic === 'string') {
      return { uri: profilePic };
    } else if (profilePic && 'uri' in profilePic) {
      return { uri: profilePic.uri };
    } else {
      // Return a default image source or null
      return require('../../assets/images/apple.jpg'); // Adjust the path as needed
    }
  };

  return (
    <Animated.View
      style={[styles.modalContainer, { transform: [{ translateY: modalY }] }]}
      {...panResponder.panHandlers}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContent}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.commentCount}>Comments ({comments.length})</Text>
        <View style={styles.commentsContainer}>
          {comments.map(renderComment)}
        </View>
        <View style={styles.inputContainer}>          
        {replyingTo && (
            <View style={styles.replyingToContainer}>
              <FontAwesomeIcon icon={faReply} color="#007AFF" size={16} />
              <Text style={styles.replyingToText}>Replying to @{replyingToUsername}</Text>
              <TouchableOpacity onPress={cancelReply} style={styles.cancelReplyButton}>
                <Text style={styles.cancelReplyText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
          <Image source={getImageSource(profilePicUrl)} style={styles.profilePic} />
            <TextInput
              ref={inputRef}
              style={styles.newCommentInput}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              placeholderTextColor="#ccc"
              value={newComment}
              onChangeText={text => setNewComment(text)}
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
              <FontAwesomeIcon icon={faArrowUp} color="green" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    height: '80%',
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 10,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#444',
    borderRadius: 16,
  },
  replyingToText: {
    color: '#FFF',
    marginLeft: 8,
    flex: 1,
  },
  cancelReplyButton: {
    marginLeft: 8,
  },
  cancelReplyText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 6,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(50, 50, 50, 0.90)',
    padding: 20,
    paddingTop: 10,
  },
  commentCount: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  commentsContainer: {
    flex: 1,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#444',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  newCommentInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    color: '#FFF',
    marginBottom: 14,
  },
  sendButton: {
    marginLeft: 10,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
});

export default CommentFeed;
