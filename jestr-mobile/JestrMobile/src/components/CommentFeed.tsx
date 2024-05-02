import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal } from 'react-native';
import Comment from './Comment';

type CommentFeedProps = {
  mediaIndex: number;
};

const CommentFeed: React.FC<CommentFeedProps> = ({ mediaIndex }) => {
  const [comments, setComments] = useState<{ text: string; userName: string; profilePicUrl: string }[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      const comment = {
        text: newComment,
        userName: 'Your Username', // Replace with the actual user's name
        profilePicUrl: 'https://via.placeholder.com/40', // Replace with the actual user's profile picture URL
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  return (
    <Modal animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.commentsContainer}>
            {comments.map((comment, index) => (
              <Comment
                key={index}
                commentText={comment.text}
                userName={comment.userName}
                profilePicUrl={comment.profilePicUrl}
              />
            ))}
          </View>
          <View style={styles.newCommentContainer}>
            <TextInput
              style={styles.newCommentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <Text style={styles.addCommentButton} onPress={handleAddComment}>
              Post
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newCommentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addCommentButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default CommentFeed;