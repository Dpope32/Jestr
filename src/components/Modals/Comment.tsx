import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import DefaultPfp from '../../assets/images/JestrLogo.jpg';
import { faThumbsUp, faReply } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import moment from 'moment';
import { CommentType } from './CommentFeed';

type CommentProps = {
  comment: CommentType;
  onLike: (commentID: string) => void;
  onDislike: (commentID: string) => void;
  onReply: (commentID: string, username: string) => void;
  depth: number;
};

const Comment: React.FC<CommentProps> = ({
  comment,
  onLike,
  onDislike,
  onReply,
  depth,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const totalLikes = comment.likesCount - comment.dislikesCount;
  const timeAgo = moment(comment.timestamp).fromNow();

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <View>
      <View style={[styles.commentContainer, depth > 0 && styles.replyContainer]}>
        {depth > 0 && <View style={styles.replyLine} />}
        <Image
          source={comment.profilePicUrl ? { uri: comment.profilePicUrl } : DefaultPfp}
          style={styles.profilePic}
        />
        <View style={styles.commentContent}>
          <Text style={styles.userName}>{comment.username}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.reactionsContainer}>
            <TouchableOpacity onPress={() => onLike(comment.commentID)} style={styles.reactionButton}>
              <FontAwesomeIcon icon={faThumbsUp} color="#4CAF50" size={16} />
              <Text style={styles.likesText}>{totalLikes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReply(comment.commentID, comment.username)} style={styles.reactionButton}>
              <FontAwesomeIcon icon={faReply} color="#007AFF" size={16} />
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>{timeAgo}</Text>
          </View>
        </View>
      </View>
      {comment.replies.length > 0 && (
        <TouchableOpacity onPress={toggleReplies} style={styles.viewRepliesButton}>
          <Text style={styles.viewRepliesText}>
            {showReplies ? 'Hide' : 'View'} {comment.replies.length} replies
          </Text>
        </TouchableOpacity>
      )}
      {showReplies && comment.replies.map((reply) => (
        <Comment
          key={reply.commentID}
          comment={reply}
          onLike={onLike}
          onDislike={onDislike}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replyContainer: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
  },
  replyLine: {
    position: 'absolute',
    left: -2,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#4CAF50',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likesText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontSize: 12,
  },
  replyText: {
    color: '#007AFF',
    marginLeft: 4,
    fontSize: 12,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  viewRepliesButton: {
    marginLeft: 52,
    marginTop: 4,
    marginBottom: 8,
  },
  viewRepliesText: {
    color: '#007AFF',
    fontSize: 12,
  },
});

export default Comment;