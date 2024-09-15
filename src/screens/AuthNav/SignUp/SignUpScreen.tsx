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
import {handleSignup} from '../../../services/authService';

const SignUpScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupAction = async () => {
    setIsLoading(true);
    try {
      await handleSignup(email, password, navigation);
    } catch (error) {
      console.log('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={colorsGradient} style={styles.container}>
      <RainEffect />

      <Text style={styles.signupHeader}>Sign Up</Text>

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

      <InputField
        label=""
        placeholder="Re-enter Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={text => setConfirmPassword(text)}
        containerStyle={styles.input}
      />
      {password !== confirmPassword && (
        <Text style={styles.errorMessage}>Passwords do not match!</Text>
      )}

      {/* TERMS AGREEMENT */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          I agree with <Text style={styles.termsHighlight}>terms</Text>,
          <Text style={styles.termsHighlight}>conditions</Text>, and
          <Text style={styles.termsHighlight}> privacy policy</Text>
        </Text>
      </View>

      {/* HANDLE SIGN UP BUTTON */}
      <TouchableOpacity onPress={handleSignupAction} style={styles.button2}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* NAV to LOGIN BUTTON */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.toggleFormText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>

      <SocialLoginBtns />
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

export default SignUpScreen;
