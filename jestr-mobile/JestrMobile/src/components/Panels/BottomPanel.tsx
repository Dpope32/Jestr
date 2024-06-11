/* eslint-disable react/no-deprecated */
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';


type RootStackParamList = {
  Home: undefined;
  MemeUpload: { user: any };
  Feed: { user: any };
  Inbox: { user: any };
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
  user: any;
};

const BottomPanel: React.FC<BottomPanelProps> = ({
  onHomeClick = () => {},
  handleLike = () => {},
  handleDislike = () => {},
  likedIndices = new Set(),
  dislikedIndices = new Set(),
  likeDislikeCounts = {},
  currentMediaIndex = 0,
  toggleCommentFeed = () => {},
  user = null,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);

  const handleHomeClick = () => {
    navigation.navigate('Feed', { user });
  };

  const handleUploadClick = () => {
    navigation.navigate('MemeUpload', { user });
  };

  const handleInboxClick = () => {
    navigation.navigate('Inbox', { user });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={handleHomeClick}>
        <FontAwesomeIcon icon={faHome} size={28} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={handleUploadClick}>
        <FontAwesomeIcon icon={faPlus} size={28} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={handleInboxClick} >
    <FontAwesomeIcon icon={faEnvelope} size={28} style={styles.icon} />
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
    borderTopColor: '#1bd40b',
  },
  iconContainer: {
    padding: 10,
    zIndex: 2,
  },
  icon: {
    color: '#1bd40b',
  },
});

export default BottomPanel;