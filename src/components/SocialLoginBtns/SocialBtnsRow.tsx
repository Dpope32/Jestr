import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {styles} from '../../screens/AuthNav/Login/componentData';
import {handleTwitterSignIn} from '../../services/authService';

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
        style={styles.socialButton}>
        <FontAwesome name="twitter" size={24} color="#1DA1F2" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleFacebookSignIn}
        style={styles.socialButton}>
        <FontAwesome name="facebook" size={24} color="#4267B2" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSnapchatSignIn}
        style={styles.socialButton}>
        <FontAwesome name="snapchat-ghost" size={24} color="#FFFC00" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleInstagramSignIn}
        style={styles.socialButton}>
        <FontAwesome name="instagram" size={24} color="#E1306C" />
      </TouchableOpacity>
    </View>
  );
};

export default SocialBtnsRow;
