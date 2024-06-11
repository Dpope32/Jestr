import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/shared/Input/InutField';
import logoImage from '../../assets/images/Jestr.jpg';
import Button from '../../components/shared/Button/Button';
import LoadingScreen from '../LoadingScreen';
import HeaderPicUpload from '../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../components/Upload/ProfilePicUpload';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'react-native-checkbox';
import ProfileCompletedSlideshow from './ProfileCompletedSlideshow';
import { styles } from './LandingPage.styles';
import googleIcon from '../../assets/images/google.jpeg';
import appleIcon from '../../assets/images/apple.jpg';
import twitterIcon from '../../assets/images/twitter.jpg';
import SuccessModal from '../../components/Modals/SuccessModal'; 
import SignupSuccessModal from '../../components/Modals/SignupSuccessModal';

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
  const [isCompleteProfileLoading, setIsCompleteProfileLoading] = useState(false); // Added state for loading spinner
  const logoOpacity = useRef(new Animated.Value(1)).current;
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
    top: new Animated.Value(10),
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
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [signupSuccessModalVisible, setSignupSuccessModalVisible] = useState(false); 
const [modalUsername, setModalUsername] = useState('');

  const checkAuthStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setIsAuthenticated(true);
        navigation.navigate('Feed', { user: JSON.parse(user) });
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  };

  const handleButtonPress = () => {
    Animated.timing(logoOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setShowInitialScreen(false));
  };

  useEffect(() => {
    checkAuthStatus();
    console.log('LandingPage component mounted');
    startAnimation();
  }, []);

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset states or perform any setup necessary
      setShowInitialScreen(true); // Assuming this should be true initially
      setTitleMarginTop(-300); // Reset any animated values if necessary
      setAnimationComplete(false); // Reset animation states
    });
  
    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset states or perform any setup necessary
      setShowInitialScreen(true); // Assuming this should be true initially
      setTitleMarginTop(-300); // Reset any animated values if necessary
      setAnimationComplete(false); // Reset animation states
    });
  
    return unsubscribe;
  }, [navigation]);
  

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
  
    Animated.timing(titleOpacity, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  
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
    setTitleMarginTop(0);
    setAnimationComplete(true);  
    titleAnimationRef.current = Animated.timing(titleTranslateY, {
      toValue: -50, // Increased translation value to move title up
      duration: 500,
      useNativeDriver: true
    });
    if (titleAnimationRef.current) {
      titleAnimationRef.current.start(() => {
        setTitlePosition({ top: new Animated.Value(30), left: new Animated.Value(0) }); // Adjusted top position
      });
      console.log('Title position =', titlePosition);
    }
  };

  const handleCompleteProfileButtonClick = () => {
    setIsCompleteProfileLoading(true);
    handleCompleteProfile(
      email,
      username,
      displayName,
      profilePic,
      headerPicFile,
      setSuccessModalVisible, // Passing the state setter function
      navigation
    ).finally(() => {
      setIsCompleteProfileLoading(false);
    });
  };

  

  return (
    <View style={styles.container}>
      {!isAuthenticated && (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
                  <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />
                  </View>
                  <View style={styles.authContainer}>
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
                      <View style={styles.divider} />  
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
                        <View style={styles.divider} />
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
                        ? handleSignup(email, password, setIsSignedUp, setSignupSuccessModalVisible)
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
                      <HeaderPicUpload onHeaderPicChange={handleHeaderPicChange} />
                      <ProfilePicUpload onProfilePicChange={handleProfilePicChange} />
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
                        onPress={handleCompleteProfileButtonClick}
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
                </KeyboardAvoidingView>
              )}
            </Animated.View>
          )}
        </ScrollView>
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

export default LandingPage;
