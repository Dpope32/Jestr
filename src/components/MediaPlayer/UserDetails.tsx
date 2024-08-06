import React from 'react';
import { View, Image, Text } from 'react-native';
import styles from './MP.styles';

type UserDetailsProps = {
  memeUser: { username?: string, profilePic?: string };
  caption: string;
  uploadTimestamp: string;
};



const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return `Yesterday`;
  } else {
    return `${diffDays} days ago`;
  }
};

const UserDetails: React.FC<UserDetailsProps> = ({ memeUser, caption, uploadTimestamp }) => (
  <View style={styles.textContainer}>
    <Image source={{ uri: memeUser?.profilePic || undefined }} style={styles.profilePic} />
    <View style={styles.textContent}>
      <Text style={styles.username}>{memeUser?.username || 'Unknown User'}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
      <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
    </View>
  </View>
);



export default UserDetails;
