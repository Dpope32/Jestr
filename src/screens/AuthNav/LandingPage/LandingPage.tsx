import React, {useRef, useEffect} from 'react';
import {Text, TouchableOpacity, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {LinearGradient} from 'expo-linear-gradient';
import {Image} from 'react-native';

import {styles, colorsGradient} from './componentData';
import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import RainEffect from '../../../components/RainEffect/RainEffect';
import WelcomeText from '../../../components/WelcomeText/WelcomeText';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';

const LandingPage = () => {
  const navigation = useNavigation<AuthNavProp>();

  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={colorsGradient} style={styles.container}>
      <RainEffect />

      <Animated.View
        style={[
          styles.innerCtr,
          {
            opacity: titleOpacity,
          },
        ]}>
        <Image
          source={require('../../../assets/images/Jestr.jpg')}
          style={styles.logo}
        />

        <WelcomeText />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <AuthFooterLinks />
      </Animated.View>
    </LinearGradient>
  );
};

export default LandingPage;
