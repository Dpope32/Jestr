import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome, faPlus, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {useNavigation, NavigationProp} from '@react-navigation/native';

import {RootStackParamList} from '../../types/types';
import {useUserStore} from '../../utils/userStore';
import * as Haptics from 'expo-haptics';

type BottomPanelProps = {
  onHomeClick: () => void;
};

const BottomPanel: React.FC<BottomPanelProps> = ({onHomeClick}) => {
  const user = useUserStore(state => state);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const customIcons = {home: faHome, upload: faPlus, inbox: faEnvelope};
  const iconSize = () => Math.floor(Dimensions.get('window').width * 0.07);

  const handleHomeClick = () => {
    Haptics.selectionAsync();
    onHomeClick();
    navigation.navigate('Feed', {user});
  };

  const handleUploadClick = () => {
    navigation.navigate('MemeUploadScreen', {user});
  };

  const handleInboxClick = () => {
    navigation.navigate('Inbox', {user});
  };

  return (
    <View style={[styles.container, {backgroundColor: 'transparent'}]}>
      {/* = H O M E == */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleHomeClick}
        accessibilityLabel="Home"
        activeOpacity={0.7}>
        <FontAwesomeIcon
          icon={customIcons.home}
          size={iconSize()}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* == U P L O A D == */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleUploadClick}
        accessibilityLabel="Upload"
        activeOpacity={0.7}>
        <FontAwesomeIcon
          icon={customIcons.upload}
          size={iconSize()}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* == I N B O X == */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleInboxClick}
        accessibilityLabel="Inbox"
        activeOpacity={0.7}>
        <FontAwesomeIcon
          icon={customIcons.inbox}
          size={iconSize()}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // alignItems: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 15 : 0,
    left: 0,
    right: 0,
    zIndex: 3,
    elevation: 10,
    paddingVertical: 10,
    borderTopColor: '#1bd40b',

    // borderWidth: 1,
    // borderColor: 'red',
  },
  iconContainer: {
    padding: 4,
    zIndex: 2,

    // borderWidth: 1,
    // borderColor: 'red',
  },
  icon: {
    color: '#1bd40b',
  },
});

export default BottomPanel;
