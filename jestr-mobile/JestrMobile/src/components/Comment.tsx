import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type CommentProps = {
  commentText: string;
  userName: string;
  profilePicUrl: string;
  likesCount: number;
  dislikesCount: number;
  onLike: () => void;
  onDislike: () => void;
};

const Comment: React.FC<CommentProps> = ({ commentText, userName, profilePicUrl, likesCount, dislikesCount, onLike, onDislike }) => {
  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
      <View style={styles.commentDetailsContainer}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.commentText}>{commentText}</Text>
        <View style={styles.reactionsContainer}>
          <TouchableOpacity onPress={onLike} style={styles.reactionButton}>
            <Text style={styles.likesText}>{`👍 ${likesCount}`}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDislike} style={styles.reactionButton}>
            <Text style={styles.dislikesText}>{`👎 ${dislikesCount}`}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#FFF',  // Light background for comments
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  commentDetailsContainer: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  reactionButton: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: '#007AFF',  // iOS blue for like button
    fontWeight: 'bold',
  },
  dislikesText: {
    color: '#FF3B30',  // iOS red for dislike button
    fontWeight: 'bold',
  }
});

export default Comment;
