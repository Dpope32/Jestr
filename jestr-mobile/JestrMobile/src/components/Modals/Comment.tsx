import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import DefaultPfp from '../../assets/images/JestrLogo.jpg';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import moment from 'moment';

type CommentProps = {
  commentText: string;
  userName: string;
  profilePicUrl: string;
  likesCount: number;
  dislikesCount: number;
  timestamp: string;
  onLike: () => void;
  onDislike: () => void;
  onReply: () => void;
  onViewReplies: () => void;
  repliesCount: number;
};

const Comment: React.FC<CommentProps> = ({
  commentText,
  userName,
  profilePicUrl,
  likesCount,
  dislikesCount,
  timestamp,
  onLike,
  onDislike,
  onReply,
  onViewReplies,
  repliesCount,
}) => {
  const totalLikes = likesCount - dislikesCount;
  const timeAgo = moment(timestamp).fromNow();

  return (
    <View style={styles.commentContainer}>
      <Image
        source={profilePicUrl ? { uri: profilePicUrl } : DefaultPfp}
        style={styles.profilePic}
      />
      <View style={styles.commentDetailsContainer}>
        <Text style={styles.userName}>{userName}</Text>
        <View style={styles.commentTextContainer}>
          <Text style={styles.commentText}>{commentText}</Text>
          <View style={styles.reactionsContainer}>
            <TouchableOpacity onPress={onLike} style={styles.reactionButton}>
              <FontAwesomeIcon icon={faThumbsUp} color="lightgreen" size={16} />
            </TouchableOpacity>
            <Text style={styles.likesText}>{totalLikes}</Text>
          </View>
        </View>
        <View style={styles.footerContainer}>
          <Text style={styles.timestamp}>{timeAgo}</Text>
          <View style={styles.divider} />
          <TouchableOpacity onPress={onReply}>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
          {repliesCount > 0 && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity onPress={onViewReplies}>
                <Text style={styles.viewRepliesText}>View {repliesCount} more replies</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(40, 40, 40, 1.0)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  commentDetailsContainer: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: 'green',
  },
  commentTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  commentText: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  reactionButton: {
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  replyText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginHorizontal: 10,
  },
  viewRepliesText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginHorizontal: 10,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
});

export default Comment;
