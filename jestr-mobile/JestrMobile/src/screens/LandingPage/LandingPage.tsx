// LandingPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, ImageBackground, Alert } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { useNavigation } from '@react-navigation/native'; // Make sure to import this
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/Input/InutField';
import Button from '../../components/Button/Button';
import LoadingScreen from '../../components/LoadingScreen';
import HeaderPicUpload from '../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../components/Upload/ProfilePicUpload';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'react-native-checkbox';
import radialGradientBg from '../../assets/images/radial_gradient_bg.png';
import { Image} from 'react-native';
import ProfileCompletedSlideshow from './ProfileCompletedSlideshow';
import { styles } from './LandingPage.styles';
import googleIcon from '../../assets/images/google.jpeg';
import appleIcon from '../../assets/images/apple.jpg';
import twitterIcon from '../../assets/images/twitter.jpg';


import {
  handleSignup,
  handleCompleteProfile,
  handleLogin,
  handleGoogleSignIn,
  handleAppleSignIn,
  handleTwitterSignIn
} from '../../services/authFunctions';



type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
};

type RootStackParamList = {
  LandingPage: undefined;
  Feed: { user: User };
};

type LandingPageNavigationProp = NavigationProp<RootStackParamList, 'LandingPage'>;

type LetterScale = {
  scale: Animated.AnimatedInterpolation<string | number>;
  opacity: Animated.AnimatedInterpolation<string | number>;
}[];

const LandingPage = () => {
  const navigation = useNavigation<any>(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creationDate, setCreationDate] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [headerPicFile, setHeaderPicFile] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [bio, setBio] = useState('');
  const [showProfileCompletedSlideshow, setShowProfileCompletedSlideshow] = useState(false);
  const [lastLogin, setLastLogin] = useState('');
  const [isdisplayNameAvailable, setIsdisplayNameAvailable] = useState(false);
  const defaultProfilePic = 'https://via.placeholder.com/150';
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const [titlePosition, setTitlePosition] = useState({
    top: new Animated.Value(30),
    left: new Animated.Value(0)
  });
  const titleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const letterAnimations = useRef<Animated.Value[]>([]);
  type RootStackParamList = { Feed: { user: User } };
  type LandingPageNavigationProp = NavigationProp<RootStackParamList, 'Feed'>;
  const [letterScale, setLetterScale] = useState<LetterScale>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleTermsCheckbox = () => setTermsAccepted(!termsAccepted);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [titleMarginTop, setTitleMarginTop] = useState(-300);


  const checkAuthStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setIsAuthenticated(true);
        navigation.navigate('Feed', { user: JSON.parse(user) });
      } else {
        setIsAuthenticated(false);
        // Optionally, display a welcome message or perform any other action when the user is not authenticated
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    console.log('LandingPage component mounted');
    startAnimation();
  }, []);

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [showInitialScreen, showSignUpForm]);

  const handleSignUpClick = () => {
    setShowInitialScreen(false);
    setShowSignUpForm(true);
  };

  const handleLoginClick = () => {
    setShowInitialScreen(false);
    setShowSignUpForm(false);
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password clicked');
  };

  const handleUsernameChange = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (usernameRegex.test(username)) {
      setUsername(username);
      setIsUsernameAvailable(true);
    } else {
      setIsUsernameAvailable(false);
    }
  };

  const handledisplayNameChange = (displayName: string) => {
    const displayNameRegex = /^[a-zA-Z0-9]+$/;
    if (displayNameRegex.test(displayName)) {
      setDisplayName(displayName);
      setIsdisplayNameAvailable(true);
    } else {
      setIsdisplayNameAvailable(false);
    }
  };

  const handleProfilePicChange = (file: File | null) => {
    setProfilePic(file);
  };

  const handleHeaderPicChange = (file: File | null) => {
    if (file) {
      setHeaderPicFile(file);
    } else {
      setHeaderPicFile(null);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const startAnimation = () => {
    setAnimationComplete(false);
    console.log('Title animation starting');
    letterAnimations.current = ['J', 'e', 's', 't', 'r'].map(() => new Animated.Value(0));
  
    // Start the title opacity animation immediately
    Animated.timing(titleOpacity, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  
    // Create an array of letter animation configurations
    const letterAnimationConfigs = letterAnimations.current.map((anim, index) => {
      return {
        0: {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
              })
            }
          ]
        },
        1: {
          opacity: 1,
          transform: [{ scale: 1 }]
        }
      };
    });
  
    // Create the staggered animation sequence
    Animated.stagger(
      500,
      letterAnimationConfigs.map((config, index) => {
        return Animated.timing(letterAnimations.current[index], {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        });
      })
    ).start(handleTitleAnimationComplete);
  
    const scale: LetterScale = letterAnimations.current.map(animation => ({
      scale: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      }),
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      })
    }));
    setLetterScale(scale);
  };
  

  const handleTitleAnimationComplete = () => {
    console.log('Title animation complete');
    setTitleMarginTop(0); // Set to a higher value in pixels
    setAnimationComplete(true);  
    titleAnimationRef.current = Animated.timing(titleTranslateY, {
      toValue: -30, // Reduced vertical translation
      duration: 500,
      useNativeDriver: true
    });
    if (titleAnimationRef.current) {
      titleAnimationRef.current.start(() => {
        setTitlePosition({ top: new Animated.Value(50), left: new Animated.Value(0) });
      });
      console.log('Title position =', titlePosition);
    }
  };

  const handleProfileCompletionComplete = async () => {
    setShowProfileCompletedSlideshow(false);

    try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);

            navigation.navigate('Feed', { user });
        } else {
            console.error('No user data found in AsyncStorage');
            Alert.alert('Error', 'User data not found. Please sign in again.');
        }
    } catch (error) {
        console.error('Error retrieving user data:', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
    }
};
  

  return (
    <ImageBackground source={radialGradientBg} style={styles.container} resizeMode="cover">
      {!isAuthenticated && (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
             {showProfileCompletedSlideshow && (
            <ProfileCompletedSlideshow onComplete={handleProfileCompletionComplete} />
          )}
          <View style={[styles.titleContainer, { marginTop: titleMarginTop }]}>
            
            {letterScale.map((anim, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.titleLetter,
                  {
                    opacity: anim.opacity,
                    transform: [{ scale: anim.scale }]
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
                  <Text style={styles.welcomeText}>Welcome</Text>
                  <TouchableOpacity style={styles.button} onPress={handleSignUpClick}>
                    <LinearGradient
                      colors={['#002400', '#00e100']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.gradient}
                    >
                      <Text style={styles.buttonText}>Sign Up</Text>
                    </LinearGradient>
                  </TouchableOpacity>
  
                  <TouchableOpacity style={styles.button} onPress={handleLoginClick}>
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
                    <TouchableOpacity onPress={handleAppleSignIn} style={styles.socialButton}>
                      <Image source={appleIcon} style={styles.socialIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                      <Image source={twitterIcon} style={styles.socialIcon} />
                    </TouchableOpacity>
                  </View>

                </View>
              ) : (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.formContainer}
                >
                  {!isSignedUp && (
                    <View style={styles.formContainer}>
                      <Text style={styles.signupHeader}>{showSignUpForm ? 'Sign Up' : 'Login'}</Text>
                      <InputField
                        label=""
                        placeholder="Enter Email"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        containerStyle={styles.enhancedInputContainer}
                        labelStyle={styles.enhancedInputLabel}
                        inputStyle={styles.enhancedInput}
                      />
                      {isEmailTaken && <Text style={styles.errorMessage}>Email already taken!</Text>}
                      <InputField
                        label=""
                        placeholder="Enter Password"
                        secureTextEntry
                        value={password}
                        onChangeText={text => setPassword(text)}
                        containerStyle={styles.enhancedInputContainer}
                        labelStyle={styles.enhancedInputLabel}
                        inputStyle={styles.enhancedInput}
                      />
                      {showSignUpForm && (
                        <>
                          <InputField
                            label=""
                            placeholder="Re-enter Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={text => setConfirmPassword(text)}
                            containerStyle={styles.enhancedInputContainer}
                            labelStyle={styles.enhancedInputLabel}
                            inputStyle={styles.enhancedInput}
                          />
                          {password !== confirmPassword && (
                            <Text style={styles.errorMessage}>Passwords do not match!</Text>
                          )}
                          <View style={styles.termsContainer}>
                            <CheckBox
                              label="I have read and agree to the terms and conditions"
                              checked={termsAccepted}
                              onChange={handleTermsCheckbox}
                              style={styles.checkbox}
                              labelStyle={styles.termsText}
                            />
                          </View>
                        </>
                      )}
  
                      <TouchableOpacity
                        onPress={() =>
                          showSignUpForm
                            ? handleSignup(email, password, setIsSignedUp)
                            : handleLogin(email, password, setIsLoading, navigation)
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
                          <TouchableOpacity onPress={handleAppleSignIn} style={styles.socialButton}>
                      <Image source={appleIcon} style={styles.socialIcon} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                      <Image source={twitterIcon} style={styles.socialIcon} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                  {isSignedUp && (
                    <View style={styles.headerUploadContainer}>
                      <HeaderPicUpload onHeaderPicChange={handleHeaderPicChange} />
                      <ProfilePicUpload onProfilePicChange={handleProfilePicChange} />
                      <View style={styles.inputFieldsContainer}>
                        <InputField
                          label=""
                          placeholder="Enter Display Name"
                          value={displayName}
                          onChangeText={setDisplayName}
                          containerStyle={{ marginBottom: 20 }}
                          inputStyle={styles.inputField}
                        />
                        <InputField
                          label=""
                          placeholder="Enter Username"
                          value={username}
                          onChangeText={setUsername}
                          containerStyle={{ marginBottom: 20 }}
                          inputStyle={styles.inputField}
                        />
                      </View>

  
                      {/* Complete Profile Button */}
                      <TouchableOpacity
                        onPress={() =>
                          handleCompleteProfile(
                            email,
                            username,
                            displayName,
                            profilePic,
                            headerPicFile,
                            navigation
                          )
                        }
                        style={styles.button}
                      >
                        <LinearGradient
                          colors={['#002400', '#00e100']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={styles.gradient}
                        >
                          <Text style={styles.buttonText}>Complete Profile</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      
                    </View>
                  )}
                </KeyboardAvoidingView>
              )}
            </Animated.View>
          )}
        </ScrollView>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerLink}>Privacy Policy</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Terms of Service</Text>
        <Text style={styles.footerDivider}> | </Text>
        <Text style={styles.footerLink}>Contact Us</Text>
      </View>
    </ImageBackground>
  );
}
  export default LandingPage;