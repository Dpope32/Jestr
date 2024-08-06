import React, { useEffect } from 'react';
import { Animated, StyleSheet, View, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const logo = require('../../assets/images/Jestr.jpg')

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
    }, 2000);

    // Logo bounce animation with Easing
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { 
          toValue: 0.8, 
          duration: 800, 
          easing: Easing.bounce, 
          useNativeDriver: true 
        }),
        Animated.timing(logoScale, { 
          toValue: 1.4, 
          duration: 1200, 
          easing: Easing.bounce, 
          useNativeDriver: true 
        }),

      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image source={logo} style={[styles.logo, { transform: [{ scale: logoScale }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
  },
  logo: {
    width: '50%',
    maxWidth: 350,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginRight: 45,
  },
});

export default LoadingScreen;
