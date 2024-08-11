import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { styles } from './LandingPage.styles';
import InputField from '../../components/shared/Input/InutField';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import SuccessModal from '../../components/Modals/SuccessModal'; 
import SignupSuccessModal from '../../components/Modals/SignupSuccessModal';
import { RootStackParamList, LandingPageNavigationProp, LetterScale } from '../../types/types';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import WelcomeText from './WelcomeText';
import { BlurView } from 'expo-blur';
import RainEffect from './RainEffect';

import { 
  handleSignup, 
  handleLogin, 
  handleCompleteProfile, 
  handleGoogleSignIn, 
  handleAppleSignIn, 
  handleTwitterSignIn,
} from '../../services/authFunctions';

import {
  handleLoginClick,
  handleForgotPassword,
  handleHeaderPicChange,
  handleProfilePicChange,
  handleCompleteProfileButtonClick,
  handleSignUpClick,
} from './LPHandlers';

interface LPProps {
  animationComplete: boolean;
  letterScale: Array<{ scale: Animated.AnimatedInterpolation<string | number>; opacity: Animated.AnimatedInterpolation<string | number>;}>;
  titleMarginTop: number;
  titleOpacity: Animated.Value;
  titleTranslateY: Animated.Value;
  showInitialScreen: boolean;
  isAuthenticated: boolean;
  setShowInitialScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSignUpForm: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToConfirmSignUp: (email: string) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LP: React.FC<LPProps> = ({
  animationComplete, titleMarginTop, titleOpacity, titleTranslateY, showInitialScreen, isAuthenticated, setShowInitialScreen, navigateToConfirmSignUp,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Feed'>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [headerPicFile, setHeaderPicFile] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isCompleteProfileLoading, setIsCompleteProfileLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const handleHeaderPic = (file: string | null) => handleHeaderPicChange(file, setHeaderPicFile);
  const handleProfilePic = (file: string | null) => handleProfilePicChange(file, setProfilePic);
  const [signupSuccessModalVisible, setSignupSuccessModalVisible] = useState(false); 
  const [modalUsername, setModalUsername] = useState('');
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const handleTermsCheckbox = () => setTermsAccepted(!termsAccepted);
  const handleSignUp = () => handleSignUpClick(setShowInitialScreen, setShowSignUpForm);
  const [letterScale, setLetterScale] = useState<LetterScale>([]);
  const [currentScreen, setCurrentScreen] = useState('initial'); // 'initial', 'login', or 'signup'
  const handleLoginWrapper = () => handleLoginClick(setShowInitialScreen, setShowSignUpForm);
  const handleCompleteProfileButton = () => handleCompleteProfileButtonClick(
    email,
    username,
    displayName,
    profilePic,
    headerPicFile,
    setSuccessModalVisible,
    navigation as LandingPageNavigationProp
  );

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

  const handleLoginPress = async () => {
    setIsLoading(true);
    await handleLogin(email, password, setIsLoading, navigation, setSuccessModalVisible, setModalUsername);
  };


  return (
    <LinearGradient
      colors={[
        '#080808', '#0a0a0a', '#0c0c0c', '#0e0e0e', '#101010',
        '#121212', '#141414', '#161616', '#181818', '#1a1a1a',
        '#1c1c1c', '#1e1e1e', '#202020', '#222222', '#242424',
        '#262626', '#282828', '#2a2a2a', '#2c2c2c', '#2e2e2e',
        '#303030', '#323232', '#343434', '#363636', '#383838',
        '#3a3a3a', '#3c3c3c', '#3e3e3e'
      ]}
      style={styles.container}
    >
      <RainEffect />
      {!isAuthenticated && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer1}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={[styles.titleContainer, { marginTop: titleMarginTop }]}>
              {letterScale.map((anim, index) => (
                <Animated.Text
                  key={index}
                  style={[
                    styles.titleLetter,
                    {
                      opacity: anim.opacity,
                      transform: [
                        { scale: anim.scale },
                        { translateY: anim.translateY }
                      ]
                    }
                  ]}
                >
                  {['J', 'e', 's', 't', 'r'][index]}
                </Animated.Text>
              ))}
            </View>
  
            {animationComplete && (
              <Animated.View
                style={{
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }]
                }}
              >
                {currentScreen === 'initial' ? (
                  <View style={styles.initialScreen}>
                    <View style={styles.logoContainer}>
                      <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />
                    </View>
                    <View style={styles.authContainer}>
                    <WelcomeText />
                      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('signup')}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.button} onPress={() => setCurrentScreen('login')}>
                        <Text style={styles.buttonText}>Login</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.formContainer}>
                    <Text style={styles.signupHeader}>{currentScreen === 'signup' ? 'Sign Up' : 'Login'}</Text>
                    <InputField
                      label=""
                      placeholder="Enter Email"
                      value={email}
                      onChangeText={text => setEmail(text)}
                    />
                    <InputField
                      label=""
                      placeholder="Enter Password"
                      secureTextEntry
                      value={password}
                      onChangeText={text => setPassword(text)}
                    />
                    {currentScreen === 'signup' && (
                      <>
                        <InputField
                          label=""
                          placeholder="Re-enter Password"
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={text => setConfirmPassword(text)}
                        />
                        {password !== confirmPassword && (
                          <Text style={styles.errorMessage}>Passwords do not match!</Text>
                        )}
                        <View style={styles.termsContainer}>
                          <BouncyCheckbox
                            size={25}
                            fillColor="#1bd40b"
                            unFillColor="#FFFFFF"
                            text="I agree to the terms and conditions"
                            iconStyle={{ borderColor: "#1bd40b" }}
                            textStyle={{ textDecorationLine: "none" }}
                            onPress={(isChecked: boolean) => setIsChecked(isChecked)}
                          />
                        </View>
                      </>
                    )}
  
                    <TouchableOpacity
                      onPress={() => {
                        if (currentScreen === 'signup') {
                          handleSignup(email, password, setIsSignedUp, setSignupSuccessModalVisible, navigation, navigateToConfirmSignUp);
                        } else {
                          setIsLoading(true); // Show loading indicator
                          handleLogin(email, password, setIsLoading, navigation, setSuccessModalVisible, setModalUsername);
                        }
                      }}
                      style={styles.button2}
                    >
                      <Text style={styles.buttonText}>{currentScreen === 'signup' ? 'Sign Up' : 'Login'}</Text>
                    </TouchableOpacity>
  
                    <TouchableOpacity onPress={() => setCurrentScreen(currentScreen === 'login' ? 'signup' : 'login')}>
                      <Text style={styles.toggleFormText}>
                        {currentScreen === 'login' 
                          ? 'Need an account? Sign up here' 
                          : 'Already have an account? Login here'}
                      </Text>
                    </TouchableOpacity>
  
                    {currentScreen === 'login' && (
                      <TouchableOpacity onPress={handleForgotPassword} style={styles.toggleForm}>
                        <Text style={styles.toggleFormText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
  
                    <View style={styles.socialContainer}>
                      <Text style={styles.socialHeaderText}>Login with Social Media</Text>
                      <View style={styles.socialButtonsRow}>
                        <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                          <FontAwesome name="twitter" size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleFacebookSignIn} style={styles.socialButton}>
                          <FontAwesome name="facebook" size={24} color="#4267B2" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSnapchatSignIn} style={styles.socialButton}>
                          <FontAwesome name="snapchat-ghost" size={24} color="#FFFC00" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleInstagramSignIn} style={styles.socialButton}>
                          <FontAwesome name="instagram" size={24} color="#E1306C" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.continueButtonsContainer}>
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                          <FontAwesome name="google" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                          <Text style={styles.buttonText}>Continue with Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
                          <FontAwesome name="apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                          <Text style={styles.buttonText}>Sign in with Apple</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
                 {isLoading && (
        <BlurView intensity={100} style={StyleSheet.absoluteFill}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text style={styles.loadingText}>Logging in...</Text>
          </View>
        </BlurView>
      )}
              </Animated.View>
            )}
          </ScrollView>
          <View style={styles.footer}>
        <Text style={styles.footerLink}>Privacy Policy</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Terms of Service</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Contact Us</Text>
      </View>
        </KeyboardAvoidingView>
      )}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        username={modalUsername}
      />
      <SignupSuccessModal
        visible={signupSuccessModalVisible}
        onClose={() => setSignupSuccessModalVisible(false)}
      />
    </LinearGradient>
  );
}

export default LP;
