import React, {useState, useRef, useEffect} from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  PanResponder,
  PanResponderGestureState,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Comment from './Comment';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowUp, faReply, faTimes} from '@fortawesome/free-solid-svg-icons';
import {User, ProfileImage} from '../../types/types';
import {
  fetchComments,
  postComment,
  updateCommentReaction,
} from '../../services/socialService';
import styles from './ModalStyles/CommentFeed.styles';

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
  user: User | null; // Ensure this is present
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
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null,
  );
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

  const organizeCommentsIntoThreads = (
    flatComments: CommentType[],
  ): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const topLevelComments: CommentType[] = [];

    flatComments.forEach(comment => {
      commentMap.set(comment.commentID, {...comment, replies: []});
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

  const handlePanResponderMove = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    if (gestureState.dy > 0) {
      modalY.setValue(gestureState.dy);
    }
  };

  const handlePanResponderRelease = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
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
    }),
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
      return {uri: profilePic};
    } else if (profilePic && 'uri' in profilePic) {
      return {uri: profilePic.uri};
    } else {
      return require('../../assets/images/apple.jpg'); 
    }
  };

  return (
    <Animated.View
      style={[styles.modalContainer, {transform: [{translateY: modalY}]}]}
      {...panResponder.panHandlers}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 0}>
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
                <Text style={styles.replyingToText}>
                  Replying to @{replyingToUsername}
                </Text>
                <TouchableOpacity
                  onPress={cancelReply}
                  style={styles.cancelReplyButton}>
                  <Text style={styles.cancelReplyText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Image
                source={getImageSource(profilePicUrl)}
                style={styles.profilePic}
              />

              <TextInput
                ref={inputRef}
                style={styles.newCommentInput}
                placeholder={
                  replyingTo ? 'Write a reply...' : 'Add a comment...'
                }
                placeholderTextColor="#ccc"
                value={newComment}
                onChangeText={text => setNewComment(text)}
                onSubmitEditing={handleAddComment}
              />

              <TouchableOpacity
                onPress={handleAddComment}
                style={styles.sendButton}>
                <FontAwesomeIcon icon={faArrowUp} color="green" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default CommentFeed;
