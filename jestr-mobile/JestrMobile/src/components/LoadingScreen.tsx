import React, { useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const logo = require('../assets/images/db/JestrLogo.jpg');
const radialGradientBg = require('../assets/images/radial_gradient_bg.png');

type RootStackParamList = {
  LandingPage: undefined; // Add other routes and their params if any
};

const LoadingScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const logoScale = new Animated.Value(0.5);

  useEffect(() => {
    // Simulating an asynchronous loading process
    setTimeout(() => {
      navigation.navigate('LandingPage');
    }, 5000);

    // Logo bounce animation
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 1.1, duration: 1250, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 0.9, duration: 1250, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 1250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ImageBackground source={radialGradientBg} style={styles.container}>
      <Animated.Image source={logo} style={[styles.logo, { transform: [{ scale: logoScale }] }]} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '50%',
    maxWidth: 150,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});

export default LoadingScreen;