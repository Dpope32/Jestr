import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Animated, ScrollView, Image} from 'react-native';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {LinearGradient} from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {BlurView} from 'expo-blur';

import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import {styles, colorsGradient} from './componentData';
import WelcomeText from '../../../components/WelcomeText/WelcomeText';
import RainEffect from '../../../components/RainEffect/RainEffect';
import InputField from '../../../components/Input/InputField';
import SuccessModal from '../../../components/Modals/SuccessModal';
import SignupSuccessModal from '../../../components/Modals/SignupSuccessModal';
import {handleForgotPassword} from '../../../services/authFunctions';
import {
  handleSignup,
  handleLogin,
  handleGoogleSignIn,
  handleAppleSignIn,
  handleTwitterSignIn,
} from '../../../services/authFunctions';

interface LPProps {
  animationComplete: boolean;
  letterScale: Array<{
    scale: Animated.AnimatedInterpolation<string | number>;
    opacity: Animated.AnimatedInterpolation<string | number>;
  }>;
  titleMarginTop: number;
  titleOpacity: Animated.Value;
  titleTranslateY: Animated.Value;
  isAuthenticated: boolean;
  setShowSignUpForm: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToConfirmSignUp: (email: string) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LP: React.FC<LPProps> = ({
  animationComplete,
  titleMarginTop,
  titleOpacity,
  titleTranslateY,
  isAuthenticated,
  navigateToConfirmSignUp,
}) => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isSignedUp, setIsSignedUp] = useState(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [signupSuccessModalVisible, setSignupSuccessModalVisible] =
    useState(false);

  const [modalUsername, setModalUsername] = useState('');
  const [currentScreen, setCurrentScreen] = useState('initial');

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
      {!isAuthenticated && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer1}
          keyboardVerticalOffset={0}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            {/* WHAT IS THIS FOR ?? */}
            <View
              style={[
                styles.titleContainer,
                {marginTop: titleMarginTop},
              ]}></View>

            {animationComplete && (
              <Animated.View
                style={{
                  opacity: titleOpacity,
                  transform: [{translateY: titleTranslateY}],
                }}>
                {/* INITIAL SCREEN */}
                {currentScreen === 'initial' ? (
                  <View style={styles.initialScreen}>
                    <View style={styles.logoContainer}>
                      <Image
                        source={require('../../../assets/images/Jestr.jpg')}
                        style={styles.logo}
                      />
                    </View>
                    <View style={styles.authContainer}>
                      <WelcomeText />
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => setCurrentScreen('signup')}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => setCurrentScreen('login')}>
                        <Text style={styles.buttonText}>Login</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // FORM SCREEN
                  <View style={styles.formContainer}>
                    <Text style={styles.signupHeader}>
                      {currentScreen === 'signup' ? 'Sign Up' : 'Login'}
                    </Text>
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

                    {/* SIGN UP SCREEN */}
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
                          <Text style={styles.errorMessage}>
                            Passwords do not match!
                          </Text>
                        )}
                        <View style={styles.termsContainer}>
                          <Text style={styles.termsText}>
                            I agree with{' '}
                            <Text style={styles.termsHighlight}>terms</Text>,
                            <Text style={styles.termsHighlight}>
                              conditions
                            </Text>
                            , and
                            <Text style={styles.termsHighlight}>
                              {' '}
                              privacy policy
                            </Text>
                          </Text>
                        </View>
                      </>
                    )}

                    {/* BUTTON */}
                    <TouchableOpacity
                      onPress={() => {
                        if (currentScreen === 'signup') {
                          handleSignup(
                            email,
                            password,
                            setIsSignedUp,
                            setSignupSuccessModalVisible,
                            navigation,
                            navigateToConfirmSignUp,
                            setCurrentScreen,
                          );
                        } else {
                          setIsLoading(true);
                          handleLogin(
                            email,
                            password,
                            setIsLoading,
                            navigation,
                            setSuccessModalVisible,
                            setModalUsername,
                          );
                        }
                      }}
                      style={styles.button2}>
                      <Text style={styles.buttonText}>
                        {currentScreen === 'signup' ? 'Sign Up' : 'Login'}
                      </Text>
                    </TouchableOpacity>

                    {/* BUTTON ANOTHER */}
                    <TouchableOpacity
                      onPress={() =>
                        setCurrentScreen(
                          currentScreen === 'login' ? 'signup' : 'login',
                        )
                      }>
                      <Text style={styles.toggleFormText}>
                        {currentScreen === 'login'
                          ? 'Need an account? Sign up here'
                          : 'Already have an account? Login here'}
                      </Text>
                    </TouchableOpacity>

                    {/* ANOTHER BUTTON */}
                    {currentScreen === 'login' && (
                      <TouchableOpacity
                        onPress={() => handleForgotPassword(email)}>
                        <Text style={styles.forgotPasswordText}>
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    )}

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
                        <Text style={styles.googleButtonText}>
                          Continue with Google
                        </Text>
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
                        <Text style={styles.appleButtonText}>
                          Sign in with Apple
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* LOGIN SCREEN - SOCIAL AUTH BUTTONS */}
                    {currentScreen === 'login' && (
                      <View style={styles.socialButtonsRow}>
                        <TouchableOpacity
                          onPress={handleTwitterSignIn}
                          style={styles.socialButton}>
                          <FontAwesome
                            name="twitter"
                            size={24}
                            color="#1DA1F2"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleFacebookSignIn}
                          style={styles.socialButton}>
                          <FontAwesome
                            name="facebook"
                            size={24}
                            color="#4267B2"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleSnapchatSignIn}
                          style={styles.socialButton}>
                          <FontAwesome
                            name="snapchat-ghost"
                            size={24}
                            color="#FFFC00"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleInstagramSignIn}
                          style={styles.socialButton}>
                          <FontAwesome
                            name="instagram"
                            size={24}
                            color="#E1306C"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>

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

          {/* == FOOTER LINKS == */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('InfoFooterAuth', {
                  content: 'privacyPolicy',
                })
              }>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}> | </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('InfoFooterAuth', {
                  content: 'termsService',
                })
              }>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}> | </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
              <Text style={styles.footerLink}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/*  */}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        username={modalUsername}
      />

      {/*  */}
      <SignupSuccessModal
        visible={signupSuccessModalVisible}
        onClose={() => setSignupSuccessModalVisible(false)}
      />
    </LinearGradient>
  );
};

export default LP;
