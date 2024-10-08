import React from 'react';
import {View, Text, TouchableWithoutFeedback, FlatList} from 'react-native';
import {TextInput, Modal} from 'react-native';
import {KeyboardAvoidingView, Keyboard, Platform} from 'react-native';
import {TouchableOpacity, Animated} from 'react-native';
import {Image, ActivityIndicator} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowUp, faTimes} from '@fortawesome/free-solid-svg-icons';
import {BlurView} from 'expo-blur';

import {useUserStore} from '../../../stores/userStore';
import Comment from './Comment';
import {CommentType} from '../../../types/types';
import useCommentFeed from './useCommentFeed';

import {ProfileImage} from '../../../types/types';
import styles from './styles';

interface CommentFeedProps {
  isCommentFeedVisible: boolean;
  setIsCommentFeedVisible: React.Dispatch<React.SetStateAction<boolean>>;
  memeID: string;
  userEmail: string;
  toggleCommentFeed: () => void;
}

const CommentFeed: React.FC<CommentFeedProps> = ({
  isCommentFeedVisible,
  setIsCommentFeedVisible,
  memeID,
  userEmail,
  toggleCommentFeed,
}) => {
  const user = useUserStore(state => state);
  // console.log('CommentFeed user:', user);
  console.log('memeID CommentFeed:', memeID);

  const {
    newComment,
    setNewComment,
    replyingTo,
    replyingToUsername,
    comments,
    isLoading,
    isError,
    handleAddComment,
    handleDeleteComment,
    handleUpdateReaction,
    handleReply,
    cancelReply,
    closeModal,
    modalY,
    inputRef,
  } = useCommentFeed({
    memeID,
    user,
    isCommentFeedVisible,
    toggleCommentFeed,
    userEmail,
  });

  // console.log('comments:', comments);

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
      return {uri: profilePic};
    } else if (profilePic && 'uri' in profilePic) {
      return {uri: profilePic.uri};
    } else {
      // Return a default image source or null
      return require('../../../assets/images/apple.jpg');
    }
  };

  const handlePressOutside = () => {
    Keyboard.dismiss();
    setIsCommentFeedVisible(false);
  };

  if (isError) {
    return <Text style={styles.errorText}>Error loading comments.</Text>;
  }

  return (
    <Modal
      visible={isCommentFeedVisible}
      animationType="none"
      transparent={true}
      onRequestClose={() => setIsCommentFeedVisible(false)}>
      {/* Backdrop: Captures presses outside the modal content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          {isLoading ? (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator style={styles.loader} />
            </View>
          ) : (
            <View style={styles.modalContainer}>
              <View style={styles.modalOverlay}>
                {/* Prevent touch events from propagating to the backdrop */}
                <TouchableWithoutFeedback onPress={() => {}}>
                  <Animated.View
                    style={[
                      styles.modalContentWrapper,
                      {transform: [{translateY: modalY}]},
                    ]}>
                    <BlurView
                      intensity={99}
                      tint="dark"
                      style={styles.modalContent}>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeModal}>
                        <FontAwesomeIcon
                          icon={faTimes}
                          size={24}
                          color="#FFF"
                        />
                      </TouchableOpacity>

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
                          renderItem={({item}) => renderComment(item)}
                          keyExtractor={item => item.commentID}
                          contentContainerStyle={styles.commentsContainer}
                          ListEmptyComponent={
                            <Text style={{color: '#FFF', textAlign: 'center'}}>
                              No comments yet. Be the first to comment!
                            </Text>
                          }
                        />
                      )}

                      <View style={styles.inputContainer}>
                        {replyingTo && (
                          <View style={styles.replyingToContainer}>
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
                      </View>

                      {/* Moved inputWrapper inside modalContent to prevent overlapping */}
                      <View style={styles.inputWrapper}>
                        <Image
                          source={getImageSource(user?.profilePic || '')}
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
                          // onSubmitEditing={handleAddComment}
                        />
                        <TouchableOpacity
                          onPress={handleAddComment}
                          style={styles.sendButton}>
                          <FontAwesomeIcon
                            icon={faArrowUp}
                            color="white"
                            size={24}
                          />
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentFeed;
