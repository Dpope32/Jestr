// Comment.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Animated,
} from 'react-native';
import DefaultPfp from '../../../assets/images/JestrLogo.jpg';
import {
  faThumbsUp,
  faThumbsDown,
  faReply,
  faTrash,
  faCopy,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import moment from 'moment';
import { CommentType } from '../../../types/types';
import styles from './Comment.styles';
import * as Clipboard from 'expo-clipboard';

type CommentProps = {
  comment: CommentType;
  onReply: (commentID: string, username: string) => void;
  onDelete: (commentID: string) => void;
  onUpdateReaction: (
    commentID: string,
    reaction: 'like' | 'dislike' | null,
  ) => void;
  currentUserEmail: string | undefined;
  depth: number;
};

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onDelete,
  onUpdateReaction,
  currentUserEmail,
  depth,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(
    comment.userReaction,
  );
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [dislikesCount, setDislikesCount] = useState(comment.dislikesCount);
  const [timeAgo, setTimeAgo] = useState(moment(comment.timestamp).fromNow());
  const [isNew, setIsNew] = useState(false);
  const [highlightAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(moment(comment.timestamp).fromNow());
      setIsNew(moment().diff(moment(comment.timestamp), 'minutes') < 5);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [comment.timestamp]);

  useEffect(() => {
    if (isNew) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(highlightAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(highlightAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isNew]);

  const handleLike = () => {
    let newReaction: 'like' | 'dislike' | null = null;
    if (userReaction === 'like') {
      newReaction = null;
      setLikesCount(prev => prev - 1);
    } else {
      if (userReaction === 'dislike') {
        setDislikesCount(prev => prev - 1);
      }
      newReaction = 'like';
      setLikesCount(prev => prev + 1);
    }
    setUserReaction(newReaction);
    onUpdateReaction(comment.commentID, newReaction);
  };

  const handleDislike = () => {
    let newReaction: 'like' | 'dislike' | null = null;
    if (userReaction === 'dislike') {
      newReaction = null;
      setDislikesCount(prev => prev - 1);
    } else {
      if (userReaction === 'like') {
        setLikesCount(prev => prev - 1);
      }
      newReaction = 'dislike';
      setDislikesCount(prev => prev + 1);
    }
    setUserReaction(newReaction);
    onUpdateReaction(comment.commentID, newReaction);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleCopyText = async () => {
    try {
      await Clipboard.setStringAsync(comment.text);
      Alert.alert('Copied', 'Comment text has been copied to clipboard.');
    } catch (error) {
      console.error('Failed to copy text:', error);
      Alert.alert('Error', 'Failed to copy text.');
    }
    setIsModalVisible(false);
  };

  const handleReplyPress = () => {
    onReply(comment.commentID, comment.username);
    setIsModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(comment.commentID),
        },
      ],
      { cancelable: true },
    );
    setIsModalVisible(false);
  };

  const interpolatedColor = highlightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(60, 60, 60, 0.0)', 'rgba(76, 175, 80, 0.1)'],
  });

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={() => setIsModalVisible(true)}>
        <Animated.View
          style={[
            styles.commentContainer,
            depth > 0 && styles.replyContainer,
            { backgroundColor: interpolatedColor },
          ]}>
          <Image
            source={
              comment.profilePicUrl ? { uri: comment.profilePicUrl } : DefaultPfp
            }
            style={styles.profilePic}
          />
          <View style={styles.commentContent}>
            <Text style={styles.userName}>{comment.username}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
            <View style={styles.reactionsContainer}>
              <TouchableOpacity
                onPress={handleLike}
                style={styles.reactionButton}>
                <FontAwesomeIcon
                  icon={faThumbsUp}
                  color={userReaction === 'like' ? '#4CAF50' : '#AAAAAA'}
                  size={16}
                />
              </TouchableOpacity>
              <Text style={styles.likesText}>{likesCount - dislikesCount}</Text>
              <TouchableOpacity
                onPress={handleDislike}
                style={styles.reactionButton}>
                <FontAwesomeIcon
                  icon={faThumbsDown}
                  color={userReaction === 'dislike' ? '#FF0000' : '#AAAAAA'}
                  size={16}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onReply(comment.commentID, comment.username)}
                style={styles.reactionButton}>
                <FontAwesomeIcon icon={faReply} color="#007AFF" size={16} />
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
              <View style={styles.timestampContainer}>
                <FontAwesomeIcon icon={faClock} color="#888" size={12} />
                <Text style={styles.timestamp}>{timeAgo}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {comment.replies && comment.replies.length > 0 && (
        <TouchableOpacity
          onPress={toggleReplies}
          style={styles.viewRepliesButton}>
          <Text style={styles.viewRepliesText}>
            {showReplies ? 'Hide' : 'View'} {comment.replies.length}{' '}
            {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Text>
        </TouchableOpacity>
      )}

      {showReplies &&
        comment.replies.map(reply => (
          <Comment
            key={reply.commentID} // Ensure unique key
            comment={reply}
            onReply={onReply}
            onDelete={onDelete}
            onUpdateReaction={onUpdateReaction}
            currentUserEmail={currentUserEmail}
            depth={depth + 1}
          />
        ))}

      {/* Context Menu Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleCopyText}>
                  <FontAwesomeIcon icon={faCopy} size={20} color="#FFF" />
                  <Text style={styles.modalOptionText}>Copy Text</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleReplyPress}>
                  <FontAwesomeIcon icon={faReply} size={20} color="#FFF" />
                  <Text style={styles.modalOptionText}>Reply</Text>
                </TouchableOpacity>
                {currentUserEmail === comment.email && (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} size={20} color="#FFF" />
                    <Text style={styles.modalOptionText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Comment;
