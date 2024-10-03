// CommentFeed.tsx
import React from 'react';
import { TouchableWithoutFeedback, Text, View, TextInput, Animated, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
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

const CommentFeed: React.FC<CommentFeedProps> = ({
  profilePicUrl,
  user,
  memeID,
  isCommentFeedVisible,
  toggleCommentFeed,
}) => {
  const {
    newComment,
    setNewComment,
    replyingTo,
    replyingToUsername,
    comments,
    isLoading,
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
  });

  const handlePressOutside = () => {
    console.log('Pressed outside');
    closeModal();
  };

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
      animationType="none" // Using "none" as animations are handled manually
      transparent={true}
      onRequestClose={closeModal}
    >
      {/* Backdrop: Captures presses outside the modal content */}
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            {/* Prevent touch events from propagating to the backdrop */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.modalContentWrapper,
                  { transform: [{ translateY: modalY }] },
                ]}
              >
                <BlurView
                  intensity={99}
                  tint="dark"
                  style={styles.modalContent}
                >
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
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

                  <View style={styles.inputContainer}>
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

                  </View>
                  {/* Moved inputWrapper inside modalContent to prevent overlapping */}
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
                </BlurView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentFeed;
