// src/screens/AuthNav/Login/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
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
import SocialBtnsRow from '../../../components/SocialLoginBtns/SocialBtnsRow';
import { handleLogin } from '../../../services/authService';
import ForgotPasswordModal from '../../../components/Modals/ForgotPasswordModal';

const LoginScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);

  // Refs for input fields
  const passwordInputRef = useRef<TextInput>(null);

  const handleLoginAction = async () => {
    Keyboard.dismiss(); // Dismiss keyboard when login button is pressed
    setIsLoading(true);
    try {
      await handleLogin(email, password, navigation);
    } catch (error: any) {
      console.log('Error logging in:', error.message);
      Alert.alert('Login Error', error.message || 'An unexpected error occurred.');
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
            <Text style={styles.signupHeader}>Login</Text>

            <InputField
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
              returnKeyType="done"
              onSubmitEditing={handleLoginAction} // Trigger login on submit
              accessibilityLabel="Password Input"
            />

            {/* HANDLE LOGIN BUTTON */}
            <TouchableOpacity
              onPress={handleLoginAction}
              style={styles.button2}
              disabled={isLoading}
              accessibilityLabel="Login Button"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* NAV to SIGN UP BUTTON */}
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              accessibilityLabel="Navigate to Sign Up"
              accessibilityRole="button"
            >
              <Text style={styles.toggleFormText}>Need an account? Sign up here</Text>
            </TouchableOpacity>

            {/* FORGOT PASSWORD BUTTON */}
            <TouchableOpacity
              onPress={() => setForgotPasswordModalVisible(true)}
              accessibilityLabel="Forgot Password"
              accessibilityRole="button"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
              isVisible={isForgotPasswordModalVisible}
              onClose={() => setForgotPasswordModalVisible(false)}
            />

            {/* SOCIAL LOGIN BUTTONS */}
            <SocialLoginBtns />
            <SocialBtnsRow />

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
                <Text style={styles.loadingText}>Logging in...</Text>
              </View>
            </BlurView>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
