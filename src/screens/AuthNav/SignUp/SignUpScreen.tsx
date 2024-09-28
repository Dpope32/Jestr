import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert, TextInput, KeyboardAvoidingView, } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './componentData';
import { colorsGradient } from '../LandingPage/componentData';
import { AuthNavProp } from '../../../navigation/NavTypes/AuthStackTypes';
import InputField from '../../../components/Input/InputField';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';
import RainEffect from '../../../components/RainEffect/RainEffect';
import SocialLoginBtns from '../../../components/SocialLoginBtns/SocialLoginBtns';
import { handleSignup } from '../../../services/authService';

const SignUpScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for input fields
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleSignupAction = async () => {
    Keyboard.dismiss(); // Dismiss keyboard when sign-up is initiated
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    setIsLoading(true);
    try {
      await handleSignup(email, password, navigation);
    } catch (error: any) {
      console.log('Error signing up:', error.message);
      Alert.alert('Sign Up Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={colorsGradient} style={styles.container}>
        <RainEffect />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.signupHeader}>Sign Up</Text>

            <InputField
              ref={emailInputRef}
              placeholder="Enter Email"
              value={email}
              onChangeText={text => setEmail(text)}
              containerStyle={styles.input}
              inputStyle={styles.inputText}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              accessibilityLabel="Email Input"
            />

            <InputField
              ref={passwordInputRef}
              placeholder="Enter Password"
              secureTextEntry
              value={password}
              onChangeText={text => setPassword(text)}
              containerStyle={styles.input}
              inputStyle={styles.inputText}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              accessibilityLabel="Password Input"
            />

            <InputField
              ref={confirmPasswordInputRef}
              placeholder="Re-enter Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              containerStyle={styles.input}
              inputStyle={styles.inputText}
              returnKeyType="done"
              onSubmitEditing={handleSignupAction}
              accessibilityLabel="Confirm Password Input"
            />

            {/* Show error message if passwords do not match */}
            {password !== confirmPassword && confirmPassword !== '' && (
              <Text style={styles.errorMessage}>Passwords do not match!</Text>
            )}

            {/* TERMS AGREEMENT */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                I agree with{' '}
                <Text style={styles.termsHighlight}>terms of service</Text>, and{' '}
                <Text style={styles.termsHighlight}>privacy policy</Text>
              </Text>
            </View>

            {/* SIGN UP BUTTON */}
            <TouchableOpacity
              onPress={handleSignupAction}
              style={styles.button2}
              disabled={isLoading}
              accessibilityLabel="Sign Up Button"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* NAVIGATE TO LOGIN */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityLabel="Navigate to Login"
              accessibilityRole="button"
            >
              <Text style={styles.toggleFormText}>
                Already have an account? Login here
              </Text>
            </TouchableOpacity>

            {/* SOCIAL LOGIN BUTTONS */}
            <SocialLoginBtns />

            {/* FOOTER LINKS */}
            <AuthFooterLinks />
          </View>

          {/* BLURVIEW WHILE LOADING */}
          {isLoading && (
            <BlurView
              intensity={100}
              style={styles.blurView}
              accessibilityLabel="Loading Indicator"
              accessible={true}
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ff00" />
                <Text style={styles.loadingText}>Signing up...</Text>
              </View>
            </BlurView>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default SignUpScreen;