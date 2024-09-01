import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {LinearGradient} from 'expo-linear-gradient';
import {Image} from 'react-native';

import {styles, colorsGradient} from './componentData';
import {AuthNavProp} from '../../navigation/NavTypes/AuthStackTypes';
import RainEffect from '../../components/RainEffect/RainEffect';
import WelcomeText from '../../components/WelcomeText/WelcomeText';
import AuthFooterLinks from '../../components/AuthFooterLinks/AuthFooterLinks';

const FirstScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  return (
    <LinearGradient colors={colorsGradient} style={styles.container}>
      <RainEffect />

      <View style={styles.initialScreen}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Jestr.jpg')}
            style={styles.logo}
          />
        </View>
        <View style={styles.authContainer}>
          <WelcomeText />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* == FOOTER LINKS == */}
      <AuthFooterLinks />
    </LinearGradient>
  );
};

export default FirstScreen;
