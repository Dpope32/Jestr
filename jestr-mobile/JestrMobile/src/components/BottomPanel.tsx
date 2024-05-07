import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  MemeUpload: { user: any };
  Feed: { user: any }; // Add the Feed route to the navigation params
  // Add other routes here
};

type BottomPanelProps = {
  onHomeClick: () => void;
  handleLike: (index: number) => void;
  handleDislike: (index: number) => void;
  likedIndices: Set<number>;
  dislikedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>;
  currentMediaIndex: number;
  toggleCommentFeed: () => void;
  user: any; // Replace with the appropriate type for the user object
};

const BottomPanel: React.FC<BottomPanelProps> = ({
  onHomeClick,
  handleLike,
  handleDislike,
  likedIndices,
  dislikedIndices,
  likeDislikeCounts,
  currentMediaIndex,
  toggleCommentFeed,
  user,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleHomeClick = () => {
    navigation.navigate('Feed', { user }); // Navigate to the Feed screen with the user object
  };

  const handleUploadClick = () => {
    navigation.navigate('MemeUpload', { user });
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={handleHomeClick}>
        <FontAwesomeIcon icon={faHome} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={handleUploadClick}>
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
