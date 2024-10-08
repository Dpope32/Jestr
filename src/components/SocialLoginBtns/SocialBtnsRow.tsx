// SocialBtnsRow.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSnapchatGhost, faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { styles } from '../../screens/AuthNav/Login/componentData';
import { handleTwitterSignIn } from '../../services/authService';

const SocialBtnsRow: React.FC = () => {
  const handleFacebookSignIn = () => {
    console.log('Facebook sign-in initiated');
    // TODO: Implement Facebook authentication
  };

  const handleSnapchatSignIn = () => {
    console.log('Snapchat sign-in initiated');
    // TODO: Implement Snapchat authentication
  };

  const handleInstagramSignIn = () => {
    console.log('Instagram sign-in initiated');
    // TODO: Implement Instagram authentication
  };

  return (
    <View style={styles.socialButtonsRow}>

      <TouchableOpacity
        onPress={handleTwitterSignIn}
        style={styles.socialButton}
        activeOpacity={0.7}
        accessibilityLabel="Sign in with Twitter">
        <FontAwesomeIcon icon={faTwitter} size={24} color="#1DA1F2" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleFacebookSignIn}
        style={styles.socialButton}
        activeOpacity={0.7}
        accessibilityLabel="Sign in with Facebook">
        <FontAwesomeIcon icon={faFacebookF} size={24} color="#3b5998" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSnapchatSignIn}
        style={styles.socialButton}
        activeOpacity={0.7}
        accessibilityLabel="Sign in with Snapchat">
        <FontAwesomeIcon icon={faSnapchatGhost} size={24} color="#FFFC00" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleInstagramSignIn}
        style={styles.socialButton}
        activeOpacity={0.7}
        accessibilityLabel="Sign in with Instagram">
        <FontAwesomeIcon icon={faInstagram} size={24} color="#C13584" />
      </TouchableOpacity>

    </View>
  );
};

export default SocialBtnsRow;
