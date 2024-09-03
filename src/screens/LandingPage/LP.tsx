import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { styles } from './LandingPage.styles';
import InputField from '../../components/shared/Input/InutField';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import SuccessModal from '../../components/Modals/SuccessModal'; 
import SignupSuccessModal from '../../components/Modals/SignupSuccessModal';
import { RootStackParamList, LandingPageNavigationProp, LetterScale } from '../../types/types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import WelcomeText from './WelcomeText';
import { BlurView } from 'expo-blur';
import RainEffect from './RainEffect';
import { handleForgotPassword } from '../../services/authService'
import  ContentModal  from './ContentModal'
import { handleSignup, handleLogin, handleGoogleSignIn, handleAppleSignIn, handleTwitterSignIn} from '../../services/authService';
import {handleLoginClick,handleHeaderPicChange,handleProfilePicChange,handleSignUpClick,} from './LPHandlers';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const handleHeaderPic = (file: string | null) => handleHeaderPicChange(file, setHeaderPicFile);
  const handleProfilePic = (file: string | null) => handleProfilePicChange(file, setProfilePic);
  const [signupSuccessModalVisible, setSignupSuccessModalVisible] = useState(false); 
  const [modalUsername, setModalUsername] = useState('');
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const handleTermsCheckbox = () => setTermsAccepted(!termsAccepted);
  const handleSignUp = () => handleSignUpClick(setShowInitialScreen, setShowSignUpForm);
  const [letterScale, setLetterScale] = useState<LetterScale>([]);
  const handleLoginWrapper = () => handleLoginClick(setShowInitialScreen, setShowSignUpForm);
  const [currentScreen, setCurrentScreen] = useState('initial'); // 'initial', 'login', or 'signup'
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<'privacy' | 'terms' | 'contact'>('privacy');


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

  const openModal = (content: 'privacy' | 'terms' | 'contact') => {
    setModalContent(content);
    setModalVisible(true);
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
         <ScrollView 
            contentContainerStyle={[
              styles.scrollViewContainer,
              currentScreen === 'signup' ? styles.signupScrollViewContainer : null
            ]}
          >
            <View style={[styles.titleContainer, { marginTop: titleMarginTop }]}>
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
                        <Text style={styles.termsText}>
                          I agree with <Text style={styles.termsHighlight}>terms</Text>,
                          <Text style={styles.termsHighlight}>conditions</Text>, and 
                          <Text style={styles.termsHighlight}> privacy policy</Text>
                        </Text>
                        </View>
                      </>
                    )}
  
                    <TouchableOpacity
                      onPress={() => {
                        if (currentScreen === 'signup') {
                          handleSignup(email, password, setIsSignedUp, setSignupSuccessModalVisible, navigation, navigateToConfirmSignUp, setCurrentScreen);
                        } else {
                          setIsLoading(true);
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
                    <TouchableOpacity onPress={() => handleForgotPassword(email)}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  )}
                   <View style={styles.continueButtonsContainer}>
                   <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                      <FontAwesome name="google" size={20} color="#000000" style={styles.buttonIcon} />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
                      <FontAwesome name="apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                      <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                    </TouchableOpacity>
                    </View>
                    {currentScreen === 'login' && (
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
                    )}
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>
          {isLoading && (
  <BlurView 
    intensity={100} 
    style={[
      StyleSheet.absoluteFill, 
      styles.blurView,
      { borderRadius: 20 }  // Add this line
    ]}
  >
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00ff00" />
      <Text style={styles.loadingText}>Logging in...</Text>
    </View>
  </BlurView>
)}
          <View style={styles.footer}>
          <TouchableOpacity onPress={() => openModal('privacy')}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}> | </Text>
        <TouchableOpacity onPress={() => openModal('terms')}>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}> | </Text>
        <TouchableOpacity onPress={() => openModal('contact')}>
          <Text style={styles.footerLink}>Contact Us</Text>
        </TouchableOpacity>
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
       <ContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        content={modalContent}
      />
    </LinearGradient>
  );
}

export default LP;
