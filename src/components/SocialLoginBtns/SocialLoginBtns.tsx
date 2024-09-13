import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {styles} from '../../screens/AuthNav/Login/componentData';
import {
  handleGoogleSignIn,
  handleAppleSignIn,
} from '../../services/authService';

const SocialLoginBtns: React.FC = () => {
  return (
    <View style={styles.continueButtonsContainer}>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}>
        <FontAwesome
          name="google"
          size={20}
          color="#000000"
          style={styles.buttonIcon}
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
        <FontAwesome
          name="apple"
          size={20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.appleButtonText}>Sign in with Apple</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SocialLoginBtns;
