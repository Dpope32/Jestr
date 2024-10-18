import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

import MemeUpload from '../../../components/Meme/MemeUpload';
import { COLORS } from '../../../theme/theme';
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
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation for the entire card
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Fade in animation with delay for the card content
    Animated.timing(cardFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Adjusted Shake animation for "Meme Creator" title
    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),  // Reduced duration
        Animated.timing(shakeAnim, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }), // Reduced duration
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),  // Reduced duration
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),  // Reduced duration
      ]).start(() => {
        setTimeout(shake, 3000); // Increased delay between shakes
      });
    };

    shake();
  }, [fadeAnim, shakeAnim, cardFadeAnim]);

  if (!user || !user.email) {
    Alert.alert('Error', 'User data is missing');
    navigation.goBack();
    return null;
  }

  const handleUploadSuccess = (url: string) => {
    Toast.show({
      type: 'success',
      text1: 'Meme uploaded successfully',
      visibilityTime: 3000,
      position: 'top',
    });
    navigation.goBack();
  };

  const shakeInterpolate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'], // Reduced rotation degrees
  });

  const animatedStyle = {
    transform: [{ rotate: shakeInterpolate }],
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={isDarkMode ? ['#232526', '#414345'] : ['#4e54c8', '#8f94fb']}
          style={{ flex: 1 }}
        >
          <StatusBar barStyle="light-content" />
          <Animated.View
            style={{
              flex: 1,
              opacity: cardFadeAnim,
              width: '100%',
              alignSelf: 'center',
              paddingVertical: 0,
              backgroundColor: isDarkMode ? 'rgba(34, 34, 34, 0.9)' : 'rgba(200, 200, 200, 0.9)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {/* Moved "Meme Creator" title to the top */}
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', paddingTop: 60, alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15, top: 60, padding: 10 }}>
                <FontAwesomeIcon icon={faArrowLeft} size={32} color={COLORS.primary} />
              </TouchableOpacity>
              <Animated.Text
                style={[
                  {
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: COLORS.primary,
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 4,
                  },
                  animatedStyle,
                ]}
              >
                Meme Creator
              </Animated.Text>
            </View>
            <View style={{ flex: 1 }}>
              <MemeUpload
                userEmail={user.email}
                username={user.username}
                onUploadSuccess={handleUploadSuccess}
                onImageSelect={() => {}}
                isDarkMode={isDarkMode}
                creationDate={user.creationDate}
                setIsUploading={setIsUploading}
                navigation={navigation} // Pass navigation prop
              />
            </View>
          </Animated.View>
          {isUploading && (
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
              >
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                  <LottieView
                    source={require('../../../assets/animations/loading-animation.json')}
                    autoPlay
                    loop
                    style={{ width: 180, height: 180 }}
                  />
                  <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 15 }}>
                    Uploading meme, please standby...
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MemeUploadScreen;
