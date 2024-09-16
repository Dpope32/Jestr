import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';

import {styles} from './componentData';
import {colorsGradient} from '../LandingPage/componentData';
import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import InputField from '../../../components/Input/InputField';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';
import RainEffect from '../../../components/RainEffect/RainEffect';
import SocialLoginBtns from '../../../components/SocialLoginBtns/SocialLoginBtns';
import SocialBtnsRow from '../../../components/SocialLoginBtns/SocialBtnsRow';
import {handleLogin, handleForgotPassword} from '../../../services/authService';
import ForgotPasswordModal from '../../../components/Modals/ForgotPasswordModal';

const LoginScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);

  const handleLoginAction = async () => {
    setIsLoading(true);
    try {
      await handleLogin(email, password, navigation);
    } catch (error: any) {
      console.log('Error logging in:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={colorsGradient} style={styles.container}>
      <RainEffect />
      <Text style={styles.signupHeader}>Login</Text>

      <InputField
        label=""
        placeholder="Enter Email"
        value={email}
        onChangeText={text => setEmail(text)}
        containerStyle={styles.input}
        inputStyle={styles.inputText}
      />

      <InputField
        label=""
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)}
        containerStyle={styles.input}
      />

      {/* HANDLE SIGN UP BUTTON */}
      <TouchableOpacity onPress={handleLoginAction} style={styles.button2}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* NAV to LOGIN BUTTON */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.toggleFormText}>Need an account? Sign up here</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setForgotPasswordModalVisible(true)}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isVisible={isForgotPasswordModalVisible}
        onClose={() => setForgotPasswordModalVisible(false)}
      />
      <SocialLoginBtns />
      <SocialBtnsRow />
      <AuthFooterLinks />

      {/* BLURVIEW WHILE LOADING */}
      {isLoading && (
        <BlurView
          intensity={100}
          style={[StyleSheet.absoluteFill, styles.blurView]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        </BlurView>
      )}
    </LinearGradient>
  );
};

export default LoginScreen;
