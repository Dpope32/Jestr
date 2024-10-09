import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, FlatList, Animated } from 'react-native';
import { TextInput, Modal, KeyboardAvoidingView, Keyboard, Platform, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faTimes, faSort } from '@fortawesome/free-solid-svg-icons';
import { BlurView } from 'expo-blur';
import { useUserStore } from '../../../stores/userStore';
import Comment from './Comment';
import { CommentType } from '../../../types/types';
import useCommentFeed from './useCommentFeed';
import { ProfileImage } from '../../../types/types';
import styles from './styles';

interface CommentFeedProps {
  isCommentFeedVisible: boolean;
  setIsCommentFeedVisible: React.Dispatch<React.SetStateAction<boolean>>;
  memeID: string;
  userEmail: string;
  toggleCommentFeed: () => void;
  commentsCount: number;
}

type SortOption = 'newest' | 'oldest' | 'mostLiked';

const CommentFeed: React.FC<CommentFeedProps> = ({
  isCommentFeedVisible,
  setIsCommentFeedVisible,
  memeID,
  userEmail,
  commentsCount,
  toggleCommentFeed,
}) => {
  const user = useUserStore(state => state);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);

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

  const sortedComments = React.useMemo(() => {
    switch (sortOption) {
      case 'newest':
        return [...comments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'oldest':
        return [...comments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'mostLiked':
        return [...comments].sort((a, b) => (b.likesCount - b.dislikesCount) - (a.likesCount - a.dislikesCount));
      default:
        return comments;
    }
  }, [comments, sortOption]);

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
      return require('../../../assets/images/apple.jpg');
    }
  };

  const handlePressOutside = () => {
    Keyboard.dismiss();
    setIsCommentFeedVisible(false);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  const handleSortOptionSelect = (option: SortOption) => {
    setSortOption(option);
    setShowSortOptions(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          <View style={styles.modalContainer}>
            <View style={styles.modalOverlay}>
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
                    <View style={styles.headerContainer}>
                      <TouchableOpacity
                        style={styles.sortButton}
                        onPress={toggleSortOptions}>
                        <FontAwesomeIcon
                          icon={faSort}
                          size={20}
                          color="#FFF"
                        />
                      </TouchableOpacity>
                      <Text style={styles.commentCount}>
                        Comments ({commentsCount || 0})
                      </Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeModal}>
                        <FontAwesomeIcon
                          icon={faTimes}
                          size={24}
                          color="#FFF"
                        />
                      </TouchableOpacity>
                    </View>

                    {showSortOptions && (
                      <View style={styles.sortOptionsContainer}>
                        <TouchableOpacity
                          style={styles.sortOption}
                          onPress={() => handleSortOptionSelect('newest')}>
                          <Text style={styles.sortOptionText}>Newest</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.sortOption}
                          onPress={() => handleSortOptionSelect('oldest')}>
                          <Text style={styles.sortOptionText}>Oldest</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.sortOption}
                          onPress={() => handleSortOptionSelect('mostLiked')}>
                          <Text style={styles.sortOptionText}>Most Liked</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {isLoading ? (
                      <ActivityIndicator style={styles.loader} color="#FFF" size="large" />
                    ) : (
                      <FlatList
                        data={sortedComments}
                        renderItem={({item}) => renderComment(item)}
                        keyExtractor={item => item.commentID}
                        contentContainerStyle={styles.commentsContainer}
                        ListEmptyComponent={
                          <Text style={styles.emptyCommentText}>
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
                    </View>
                  </BlurView>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentFeed;