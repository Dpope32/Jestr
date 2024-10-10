import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {SPACING, FONT_SIZES} from '../../theme/theme';
import {
  handleGoogleSignIn,
  handleAppleSignIn,
} from '../../services/authService';
import {AuthNavProp} from '../../navigation/NavTypes/AuthStackTypes';
import {useNavigation} from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SocialLoginBtns: React.FC = () => {
  const navigation = useNavigation<AuthNavProp>();
  return (
    <View style={styles.continueButtonsContainer}>
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleAppleSignIn(navigation)}>
          <Image
            source={require('../../assets/icons/apple.png')}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.socialButton}
        // onPress={() => handleGoogleSignIn(navigation)}
        onPress={() => {}}>
        <Image
          source={require('../../assets/icons/google.png')}
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  continueButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  socialButton: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.12,
    borderRadius: SCREEN_WIDTH * 0.06,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    marginVertical: SPACING.sm,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: SPACING.sm,
    resizeMode: 'contain',
  },
  buttonText: {
    color: '#000000',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default SocialLoginBtns;
