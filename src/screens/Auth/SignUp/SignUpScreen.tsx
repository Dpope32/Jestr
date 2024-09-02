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

import {
  handleSignup,
  handleGoogleSignIn,
  handleAppleSignIn,
} from '../../../services/authFunctions';

const SignUpScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //   is loading request / replace from tanstack
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupAction = () => {
    handleSignup(
      email,
      password,
      setIsSignedUp,
      setSignupSuccessModalVisible,
      navigation,
      navigateToConfirmSignUp,
      setCurrentScreen,
    );
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

export default SignUpScreen;
