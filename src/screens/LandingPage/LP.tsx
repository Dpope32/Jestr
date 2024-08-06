import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { styles } from './LandingPage.styles';
import InputField from '../../components/shared/Input/InutField';
import { StackNavigationProp } from '@react-navigation/stack';
import HeaderPicUpload from '../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../components/Upload/ProfilePicUpload';
import { LinearGradient } from 'expo-linear-gradient';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import googleIcon from '../../assets/images/google.jpeg';
import appleIcon from '../../assets/images/apple.jpg';
import twitterIcon from '../../assets/images/twitter.jpg';
import SuccessModal from '../../components/Modals/SuccessModal'; 
import SignupSuccessModal from '../../components/Modals/SignupSuccessModal';
import { RootStackParamList, LandingPageNavigationProp, LetterScale } from '../../types/types';


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
  letterScale: Array<{
    scale: Animated.AnimatedInterpolation<string | number>;
    opacity: Animated.AnimatedInterpolation<string | number>;
  }>;
  titleMarginTop: number;
  titleOpacity: Animated.Value;
  titleTranslateY: Animated.Value;
  showInitialScreen: boolean;
  isAuthenticated: boolean;
  setShowInitialScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSignUpForm: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToConfirmSignUp: (email: string) => void; // Add this line
}


const LP: React.FC<LPProps> = ({
  animationComplete,
  titleMarginTop,
  titleOpacity,
  titleTranslateY,
  showInitialScreen,
  isAuthenticated,
  setShowInitialScreen,
  navigateToConfirmSignUp,
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

  
  

  return (
    <View style={styles.container}>
      {!isAuthenticated && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
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
                {showInitialScreen ? (
                  <View style={styles.initialScreen}>
                    <View style={styles.logoContainer}>
                      <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />
                    </View>
                    <View style={styles.authContainer}>
                      <Text style={styles.welcomeText}>Welcome</Text>
                      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <LinearGradient
                          colors={['#002400', '#00e100']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.gradient}
                        >
                          <Text style={styles.buttonText}>Sign Up</Text>
                        </LinearGradient>
                      </TouchableOpacity>
  
                      <TouchableOpacity style={styles.button} onPress={handleLoginWrapper}>
                        <LinearGradient
                          colors={['#002400', '#00e100']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.gradient}
                        >
                          <Text style={styles.buttonText}>Login</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <View style={styles.separator}></View>
                      <Text style={styles.socialHeaderText}>Login with Social Media</Text>
  
                      <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity onPress={handleGoogleSignIn} style={styles.socialButton}>
                          <Image source={googleIcon} style={styles.socialIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                          <Image source={twitterIcon} style={[styles.socialIcon, styles.twitterButton]} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAppleSignIn} style={styles.socialButton}>
                          <Image source={appleIcon} style={[styles.socialIcon, styles.appleButton]} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.formContainer}>
                    {!isSignedUp && (
                      <View style={styles.formContainer}>
                        <Text style={styles.signupHeader}>{showSignUpForm ? 'Sign Up' : 'Login'}</Text>
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
                        {showSignUpForm && (
                          <>
                            <View style={styles.divider} />
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
                          onPress={() =>
                            showSignUpForm
                            ? handleSignup(email, password, setIsSignedUp, setSignupSuccessModalVisible, navigation, navigateToConfirmSignUp)
                            : handleLogin(email, password, setIsLoading, navigation, setSuccessModalVisible, setModalUsername)
                          }
                          style={styles.button}
                        >
                          <LinearGradient
                            colors={['#002400', '#00e100']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradient1}
                          >
                            <Text style={styles.buttonText}>{showSignUpForm ? 'Sign Up' : 'Login'}</Text>
                          </LinearGradient>
                        </TouchableOpacity>
  
                        <TouchableOpacity
                          onPress={() => setShowSignUpForm(!showSignUpForm)}
                          style={styles.toggleForm}
                        >
                          <Text style={styles.toggleFormText}>
                            {showSignUpForm
                              ? 'Already have an account? Login here'
                              : 'Need an account? Sign up here'}
                          </Text>
                        </TouchableOpacity>
  
                        {!showSignUpForm && (
                          <TouchableOpacity
                            onPress={handleForgotPassword}
                            style={styles.toggleForm}
                          >
                            <Text style={styles.toggleFormText}>Forgot Password?</Text>
                          </TouchableOpacity>
                        )}
                        {!isSignedUp && (
                          <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity onPress={handleGoogleSignIn} style={styles.socialButton}>
                              <Image source={googleIcon} style={styles.socialIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                              <Image source={twitterIcon} style={[styles.socialIcon, styles.twitterButton]} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAppleSignIn} style={styles.socialButton}>
                              <Image source={appleIcon} style={[styles.socialIcon, styles.appleButton]} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                    {isSignedUp && (
                      <View style={styles.headerUploadContainer}>
                        <HeaderPicUpload onHeaderPicChange={handleHeaderPic} />
                        <ProfilePicUpload onProfilePicChange={handleProfilePic} />
  
                        <View style={styles.inputFieldsContainer}>
                          <InputField
                            label=""
                            placeholder="Enter Display Name (Optional)"
                            value={displayName}
                            onChangeText={setDisplayName}
                            containerStyle={{ marginBottom: 20 }}
                            inputStyle={styles.inputField}
                          />
                          <InputField
                            label=""
                            placeholder="Enter Username (Required)"
                            value={username}
                            onChangeText={setUsername}
                            containerStyle={{ marginBottom: 20 }}
                            inputStyle={styles.inputField}
                          />
                        </View>
  
                        <TouchableOpacity
                          onPress={handleCompleteProfileButton}
                          style={styles.button}
                        >
                          <LinearGradient
                            colors={['#002400', '#00e100']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradient}
                          >
                            {isCompleteProfileLoading ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.buttonText}>Complete Profile</Text>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>
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
      <View style={styles.footer}>
        <Text style={styles.footerLink}>Privacy Policy</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Terms of Service</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Contact Us</Text>
      </View>
    </View>
  );
  
}

export default LP;
