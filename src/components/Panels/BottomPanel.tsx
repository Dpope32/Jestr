/* eslint-disable react/no-deprecated */
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, User } from '../../types/types';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

type BottomPanelProps = {
  onHomeClick?: () => void;
  handleLike?: (index: number) => void;
  handleDislike?: (index: number) => void;
  likedIndices?: Set<number>;
  dislikedIndices?: Set<number>;
  likeDislikeCounts?: Record<number, number>;
  currentMediaIndex?: number;
  toggleCommentFeed?: () => void;
  user?: User | null;
  backgroundColor?: string;
  visible?: boolean;
  customIcons?: {home?: any; upload?: any; inbox?: any};
  additionalButtons?: Array<{
    icon: any;
    onPress: () => void;
    accessibilityLabel?: string;
  }>;
};

const BottomPanel: React.FC<BottomPanelProps> = ({
  onHomeClick = () => {},
  backgroundColor = 'transparent',
  visible = true,
  customIcons = {home: faHome, upload: faPlus, inbox: faEnvelope},
  additionalButtons = [],
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const iconSize = useMemo(
    () => Math.floor(Dimensions.get('window').width * 0.07),
    [],
  );

  const handleHomeClick = useMemo(
    () => () => {
      Haptics.selectionAsync();
      onHomeClick();
      navigation.navigate('Feed' as never);
    },
    [onHomeClick, navigation],
  );

  const handleUploadClick = useMemo(
    () => () => {
      Haptics.selectionAsync(); 
      navigation.navigate('MemeUploadScreen' as never);
    },
    [navigation],
  );

  const handleInboxClick = useMemo(
    () => () => {
      Haptics.selectionAsync(); 
      navigation.navigate('Inbox' as never);
    },
    [navigation],
  );



  if (!visible) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['bottom']}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleHomeClick}
          accessibilityLabel="Home"
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={customIcons.home} size={iconSize} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleUploadClick}
          accessibilityLabel="Upload"
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={customIcons.upload} size={iconSize} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={handleInboxClick}
          accessibilityLabel="Inbox"
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={customIcons.inbox} size={iconSize} style={styles.icon} />
        </TouchableOpacity>
        {additionalButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.iconContainer}
            onPress={button.onPress}
            accessibilityLabel={button.accessibilityLabel}
            activeOpacity={0.7}
          >
            <FontAwesomeIcon icon={button.icon} size={iconSize} style={styles.icon} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1bd40b',
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    color: '#1bd40b',
  },
});

export default BottomPanel;