/* eslint-disable react/no-deprecated */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';

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
  user = null,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleHomeClick = () => {
    onHomeClick();
    navigation.navigate('Feed', { user });
  };

  const handleUploadClick = () => {
    navigation.navigate('MemeUploadScreen', { user });
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
      <TouchableOpacity style={styles.iconContainer} onPress={handleInboxClick}>
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
    bottom: 10,
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

