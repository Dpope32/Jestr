import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';

type BottomPanelProps = {
  onHomeClick: () => void;
  handleLike: (index: number) => void;
  handleDislike: (index: number) => void;
  likedIndices: Set<number>;
  dislikedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>; 
  currentMediaIndex: number;
  toggleCommentFeed: () => void;
};

const BottomPanel: React.FC<BottomPanelProps> = ({ onHomeClick }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={onHomeClick}>
        <FontAwesomeIcon icon={faHome} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}>
        <FontAwesomeIcon icon={faPlus} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}>
        <FontAwesomeIcon icon={faEnvelope} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    paddingVertical: 10,
  },
  iconContainer: {
    padding: 20,
  },
  icon: {
    color: '#1bd40b',
    fontSize: 48,
  },
});

export default BottomPanel;