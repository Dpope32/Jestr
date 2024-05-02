import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

type TopPanelProps = {
  onProfileClick: () => void;
  profilePicUrl: string;
  username: string;
};

const TopPanel: React.FC<TopPanelProps> = ({ onProfileClick, profilePicUrl, username }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onProfileClick} style={styles.profilePicContainer}>
        <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
      </TouchableOpacity>
      <Text style={styles.username}>{username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    left: 0, // Panel slides out from the left
  top: 0,
  zIndex: 10, // Ensure it's above the background
  },
  profilePicContainer: {
    marginRight: 0,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TopPanel;