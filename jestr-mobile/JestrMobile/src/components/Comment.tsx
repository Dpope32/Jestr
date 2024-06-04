import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type CommentProps = {
  commentText: string;
  userName: string;
  profilePicUrl: string;
};

const Comment: React.FC<CommentProps> = ({ commentText, userName, profilePicUrl }) => {
  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
      <View style={styles.commentTextContainer}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.commentText}>{commentText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    color: 'white',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 10,
    color: 'white',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  commentText: {
    fontSize: 16,
    color: 'white',
  },
});

export default Comment;