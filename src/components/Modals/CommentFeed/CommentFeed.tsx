import React, { useRef } from 'react';
import { Platform, TouchableWithoutFeedback, Text, View, TextInput, Animated, TouchableOpacity, Image, FlatList, Modal, PanResponder, KeyboardAvoidingView } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';

import Comment from './Comment';
import { User, ProfileImage, CommentType } from '../../../types/types';
import styles from './CommentFeed.styles';

import useCommentFeed from './useCommentFeed'; 

type CommentFeedProps = {
  memeID: string;
  profilePicUrl: string | ProfileImage | null;
  user: User | null;
  isCommentFeedVisible: boolean;
  toggleCommentFeed: () => void;
};

const CommentFeed: React.FC<CommentFeedProps> = ({ profilePicUrl, user, memeID, isCommentFeedVisible, toggleCommentFeed }) => {
  const { 
    newComment, replyingTo, replyingToUsername, comments, isLoading, modalY, inputRef,
    keyboardHeight, setNewComment, handleAddComment, handleDeleteComment, handleUpdateReaction, 
    handleReply, cancelReply, closeModal
  } = useCommentFeed({ memeID, user, isCommentFeedVisible, toggleCommentFeed });

  const panResponder = useRef(
    Platform.OS === 'ios' ? 
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            modalY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100) {
            closeModal();
          } else {
            Animated.spring(modalY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    : null
  ).current;

  const renderComment = (comment: CommentType) => (
    <Comment
      key={comment.commentID}
      comment={comment}
      onReply={handleReply}
      onDelete={handleDeleteComment}
      onUpdateReaction={handleUpdateReaction}
      currentUserEmail={user?.email}
      depth={0}
    />
  );

  const getImageSource = (profilePic: string | ProfileImage | null) => {
    if (typeof profilePic === 'string') {
      return { uri: profilePic };
    } else if (profilePic && 'uri' in profilePic) {
      return { uri: profilePic.uri };
    } else {
      return require('../../../assets/images/apple.jpg');
    }
  };

  return (
    <Modal
      visible={isCommentFeedVisible}
      animationType="none"
      transparent={true}
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal} testID="modal-backdrop">
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContentWrapper,
                { transform: [{ translateY: modalY }] },
              ]}
              {...(Platform.OS === 'ios' ? panResponder?.panHandlers : {})}
            >
              <BlurView
                intensity={99}
                tint="dark"
                style={styles.modalContent}
              >
                {Platform.OS === 'android' && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
                  </TouchableOpacity>
                )}

                <Text style={styles.commentCount}>
                  Comments ({comments.length})
                </Text>
                {isLoading ? (
                  <Text style={styles.loadingText}>
                    Loading comments...
                  </Text>
                ) : (
                  <FlatList
                    data={comments}
                    renderItem={({ item }) => renderComment(item)}
                    keyExtractor={(item) => item.commentID}
                    contentContainerStyle={styles.commentsContainer}
                    ListEmptyComponent={
                      <Text style={{ color: '#FFF', textAlign: 'center' }}>
                        No comments yet. Be the first to comment!
                      </Text>
                    }
                  />
                )}
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  keyboardVerticalOffset={100}
                >
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      { transform: [{ translateY: Animated.multiply(keyboardHeight, -1) }] }
                    ]}
                    testID="input-container"
                  >
                    {replyingTo && (
                      <View style={styles.replyingToContainer}>
                        <Text style={styles.replyingToText}>
                          Replying to @{replyingToUsername}
                        </Text>
                        <TouchableOpacity
                          onPress={cancelReply}
                          style={styles.cancelReplyButton}
                        >
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
                        placeholderTextColor="#AAA"
                        value={newComment}
                        onChangeText={setNewComment}
                        onSubmitEditing={handleAddComment}
                      />
                      <TouchableOpacity
                        onPress={handleAddComment}
                        style={styles.sendButton}
                      >
                        <FontAwesomeIcon
                          icon={faArrowUp}
                          color="white"
                          size={24}
                        />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </KeyboardAvoidingView>
              </BlurView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentFeed;
