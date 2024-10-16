import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

import MemeUpload from '../../../components/Meme/MemeUpload';
import { FONTS, COLORS } from '../../../theme/theme';
import { useTheme } from '../../../theme/ThemeContext';
import { useUserStore } from '../../../stores/userStore';
import { BottomNavProp } from '../../../navigation/NavTypes/BottomTabsTypes';

type MemeUploadScreenProps = { navigation: any; route: any };

const MemeUploadScreen: React.FC<MemeUploadScreenProps> = () => {
  const navigation = useNavigation<BottomNavProp>();
  const { isDarkMode } = useTheme();
  const user = useUserStore((state) => state);

  const [isUploading, setIsUploading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!user || !user.email) {
    Alert.alert('Error', 'User data is missing');
    navigation.goBack();
    return null;
  }

  const handleUploadSuccess = (url: string) => {
    console.log('Meme uploaded successfully:', url);
    Toast.show({
      type: 'success',
      text1: 'Meme uploaded successfully',
      visibilityTime: 3000,
      position: 'top',
    });
    navigation.goBack();
  };

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(shake, 2000);
      });
    };

    shake();
  }, [shakeAnim]);

  const shakeInterpolate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: shakeInterpolate }],
  };

  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [cardFadeAnim]);

  return (
    <View style={[styles.background, isDarkMode && styles.darkBackground]}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.card, { opacity: cardFadeAnim }]}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Text style={styles.title}>This </Text>
          <Animated.Text style={[styles.title, styles.better, animatedStyle]}>
            BETTER
          </Animated.Text>
          <Text style={styles.title}> be funny!</Text>
        </View>
        {/* Wrap MemeUpload in a View with flex: 1 */}
        <View style={{ flex: 1 }}>
          <MemeUpload
            userEmail={user.email}
            username={user.username}
            onUploadSuccess={handleUploadSuccess}
            onImageSelect={() => {}}
            isDarkMode={isDarkMode}
            creationDate={user.creationDate}
            setIsUploading={setIsUploading}
          />
        </View>
      </Animated.View>
      {isUploading && (
        <View style={styles.fullScreenOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.7)']}
            style={styles.gradientBackground}
          >
            <View style={styles.uploadingContainer}>
              <LottieView
                source={require('../../../assets/animations/loading-animation.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
              <Text style={styles.uploadingText}>Uploading meme, please standby...</Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  background: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 30, // Reduced padding for better spacing
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10, // Added to provide space under title
  },
  backButton: {
    position: 'absolute',
    left: 15, // Adjusted for consistent placement
    top: 5,
  },
  title: {
    fontSize: 26, // Adjusted to fit better in the view
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  better: {
    color: COLORS.accent,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 }, // Increased for better visibility
    textShadowRadius: 2,
    fontFamily: FONTS.bold,
    fontSize: 28, // Emphasized BETTER text
  },
  card: {
    flex: 1,
    width: '95%', // Reduced width for better margin
    backgroundColor: '#333333',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    marginVertical: 50, // Added top and bottom margin
    alignSelf: 'center', // Centered the card
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Added opacity for better focus on loading
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  lottieAnimation: {
    width: 180, // Reduced size for better placement
    height: 180,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 15, // Reduced margin to tighten text
    fontFamily: FONTS.regular,
  },
});


export default MemeUploadScreen;
