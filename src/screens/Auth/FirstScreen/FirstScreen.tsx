import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {LinearGradient} from 'expo-linear-gradient';
import {Image} from 'react-native';

import {styles, colorsGradient} from './componentData';
import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import RainEffect from '../../../components/RainEffect/RainEffect';
import WelcomeText from '../../../components/WelcomeText/WelcomeText';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';

const FirstScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  return (
    <LinearGradient colors={colorsGradient} style={styles.container}>
      <RainEffect />

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

      {/* == FOOTER LINKS == */}
      <AuthFooterLinks />
    </LinearGradient>
  );
};

export default FirstScreen;
