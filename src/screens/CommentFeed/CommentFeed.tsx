import React, {useState, useRef} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {TextInput} from 'react-native';
import {KeyboardAvoidingView, Keyboard} from 'react-native';
import {Platform, TouchableOpacity} from 'react-native';
import {Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowUp, faReply} from '@fortawesome/free-solid-svg-icons';

import {useUserStore} from '../../store/userStore';
import Comment from './Comment';

import {User, ProfileImage} from '../../types/types';
import styles from './CommentFeed.styles';

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

const CommentFeed = () => {
  const user = useUserStore(state => state);

  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null,
  );
  const inputRef = useRef<TextInput>(null);

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

  const handleAddComment = async () => {
    //   if (newComment.trim() !== '' && user) {
    //     try {
    //       await postComment(memeID, newComment, user, replyingTo || undefined);
    //       const updatedComments = await fetchComments(memeID);
    //       const threadedComments = organizeCommentsIntoThreads(updatedComments);
    //       setComments(threadedComments);
    //       setNewComment('');
    //       setReplyingTo(null);
    //       updateCommentCount(memeID, updatedComments.length);
    //     } catch (error) {
    //       console.error('Failed to add comment:', error);
    //     }
    //   } else if (!user) {
    //     console.error('User is null, cannot post comment.');
    //     // You might want to show an alert or message to the user here
    //   }
  };

  const handleLike = async (commentID: string) => {
    try {
      // await updateCommentReaction(commentID, memeID, true, false);
      // const updatedComments = await fetchComments(memeID);
      // const threadedComments = organizeCommentsIntoThreads(updatedComments);
      // setComments(threadedComments);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDislike = async (commentID: string) => {
    try {
      // await updateCommentReaction(commentID, memeID, false, true);
      // const updatedComments = await fetchComments(memeID);
      // const threadedComments = organizeCommentsIntoThreads(updatedComments);
      // setComments(threadedComments);
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
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
      // Return a default image source or null
      return require('../../assets/images/apple.jpg'); // Adjust the path as needed
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContent}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 0}>
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
              source={getImageSource(user.profilePic)}
              style={styles.profilePic}
            />

            <TextInput
              ref={inputRef}
              style={styles.newCommentInput}
              placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
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
  );
};

export default CommentFeed;
