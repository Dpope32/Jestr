import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';

import {styles} from './componentData';
import {colorsGradient} from '../FirstScreen/componentData';

import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import InputField from '../../../components/Input/InputField';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';
import RainEffect from '../../../components/RainEffect/RainEffect';
import {useUserStore} from '../../../store/userStore';

import {
  handleLogin,
  handleGoogleSignIn,
  handleAppleSignIn,
  handleForgotPassword,
  handleTwitterSignIn,
} from '../../../services/authFunctions';

const LoginScreen = () => {
  const setLoggedIn = useUserStore(state => state.setLoggedIn);
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //   is loading request / replace from tanstack
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginAction = () => {
    // setIsLoading(true);
    // try {
    //   handleLogin(
    //     email,
    //     password,
    //     //   setIsLoading,
    //   );
    // } catch (error: any) {
    //   console.log('Error logging in:', error.message);
    // } finally {
    //   setIsLoading(false);
    // }
    setLoggedIn(true);
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook sign-in initiated');
    // TODO: Implement Facebook authentication
  };

  const handleSnapchatSignIn = () => {
    console.log('Snapchat sign-in initiated');
    // TODO: Implement Snapchat authentication
  };

  const handleInstagramSignIn = () => {
    console.log('Instagram sign-in initiated');
    // TODO: Implement Instagram authentication
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

      <TouchableOpacity onPress={() => handleForgotPassword(email)}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* SOCIAL AUTH BUTTONS */}
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
        <TouchableOpacity
          style={styles.appleButton}
          onPress={handleAppleSignIn}>
          <FontAwesome
            name="apple"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.appleButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialButtonsRow}>
        <TouchableOpacity
          onPress={handleTwitterSignIn}
          style={styles.socialButton}>
          <FontAwesome name="twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFacebookSignIn}
          style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSnapchatSignIn}
          style={styles.socialButton}>
          <FontAwesome name="snapchat-ghost" size={24} color="#FFFC00" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleInstagramSignIn}
          style={styles.socialButton}>
          <FontAwesome name="instagram" size={24} color="#E1306C" />
        </TouchableOpacity>
      </View>

      {/* FOOTER LINKS */}
      <AuthFooterLinks />

      {/* BLURVIEW WHILE LOADING */}
      {/* FIXME: TO REMOVE ?? */}
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
