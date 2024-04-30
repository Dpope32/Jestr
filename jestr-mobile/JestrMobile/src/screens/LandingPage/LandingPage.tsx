import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, ImageBackground, Alert} from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  InputField  from '../../components/Input/InutField';
import Button  from '../../components/Button/Button';
import LoadingScreen from '../../components/LoadingScreen';
import  HeaderPicUpload  from '../../components/Upload/HeaderPicUpload';
import  ProfilePicUpload  from '../../components/Upload/ProfilePicUpload';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'react-native-checkbox';

const radialGradientBg = require('../../assets/images/radial_gradient_bg.png');

type User = {
    email: string;
    username: string;
    profilePic: string;
    displayName: string;
    headerPic: string;
    creationDate: string;
  };

  type LetterScale = {
    scale: Animated.AnimatedInterpolation<string | number>;
    opacity: Animated.AnimatedInterpolation<string | number>;
  }[];
  

function LandingPage() {
  console.log('LandingPage component rendered');
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
    const [lastLogin, setLastLogin] = useState('');
    const [isdisplayNameAvailable, setIsdisplayNameAvailable] = useState(false);
    const defaultProfilePic = "https://via.placeholder.com/150"; 
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(20)).current;
    const [titlePosition, setTitlePosition] = useState({ top: new Animated.Value(50), left: new Animated.Value(0) });
    const titleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
    const letterAnimations = useRef<Animated.Value[]>([]);
    type RootStackParamList = {Feed: { user: User };};
    type LandingPageNavigationProp = NavigationProp<RootStackParamList, 'Feed'>;
    const [letterScale, setLetterScale] = useState<LetterScale>([]);
    const navigation = useNavigation<LandingPageNavigationProp>();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleTermsCheckbox = () => setTermsAccepted(!termsAccepted);
    const [termsAccepted, setTermsAccepted] = useState(false);

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
  
    useEffect(() => {
      checkAuthStatus();
      startAnimation(); // Start the animation on component mount
      setAnimationComplete(false);
    }, []);
  
    const handleSignup = async () => {
    const userData = {
        operation: 'signup',
        email: email,
        password: password,
    };
    try {
        const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        });

        if (response.ok) {
        const data = await response.json();
        console.log('Account created:', data);
        setIsSignedUp(true);
        Toast.show({
            type: 'success',
            text1: 'Account Created Successfully!',
            visibilityTime: 2000,
        });
        } else {
        throw new Error('Failed to create account');
        }
    } catch (error) {
        console.error('Signup error:', error);
        Alert.alert('An error occurred while signing up. Please try again.');
    }
    };

    const handleCompleteProfile = async () => {
    try {
    // Assume profilePic and headerPicFile are already in the correct base64 encoded string format
    const profileData = {
    operation: 'completeProfile',
    email: email,
    username: username,
    displayName: displayName,
    profilePic: profilePic, // This should be a base64 encoded string
    headerPic: headerPicFile, // This should be a base64 encoded string
    };

    console.log('Sending complete profile request with data:', profileData);

    const response = await fetch('https://your-api-endpoint/completeProfile', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
    });

    const data = await response.json();
    if (response.ok) {
    console.log('Profile completed successfully with response:', data);
    Toast.show({
        type: 'success',
        text1: 'Profile completed successfully!',
        position: 'top',
        visibilityTime: 1000,
        onHide: () => {
        navigation.navigate('Feed', { user: data.user });
        },
    });
    } else {
    console.error('Failed to complete profile', data);
    Toast.show({
        type: 'error',
        text1: data.message || 'Failed to complete profile',
    });
    }
    } catch (error) {
    console.error('Error completing profile:', error);
    Toast.show({ type: 'error', text1: 'An error occurred while completing your profile. Please try again.' })
    }
    };

  const handleLogin = async () => {
    setIsLoading(true);
    const userData = {
        operation: 'signin',
        email: email,
        password: password,
    };
    try {
        console.log('Sending login request...');
        const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        });
        const data = await response.json();
        console.log('Login response:', data);
        if (response.ok && data.message === 'Sign-in successful.' && data.user && data.user.email) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        console.log('Sign-in successful');
        Toast.show({
          type: 'success',
          text1: `Welcome back, ${data.user.displayName}!`,
          position: 'top',
          visibilityTime: 1000,
            onHide: () => {
            console.log('Toast closed, navigating to Feed');
            const user = {
                email: data.user.email,
                username: data.user.username,
                profilePic: data.user.profilePic,
                headerPic: data.user.headerPic,
                displayName: data.user.displayName,
                bio: data.user.bio,
                lastLogin: data.user.lastLogin,
                creationDate: data.user.creationDate || '',
            };
            console.log('Logged-in user data:', data.user);
            
            navigation.navigate('Feed', { user });
            setIsLoading(false);
            },
        });
      } else {
        console.log('Sign-in failed');
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: data.message || 'Sign-in failed. Please check your credentials.',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        Toast.show({
        type: 'error',
        text1: 'An error occurred during sign-in. Please try again.',
        position: 'top',
        visibilityTime: 2000,
        });
    }
    };

    const handleForgotPassword = () => {
  // Navigate to the password reset page or trigger an email with reset instructions
  // Example: navigation.navigate('PasswordReset');
  console.log('Forgot Password clicked');
};

    const handleGoogleSignIn = async () => {
      // Implementation based on '@react-native-google-signin/google-signin'
    };

    const handleAppleSignIn = async () => {
      // Implementation based on '@invertase/react-native-apple-authentication'
    };

    const handleTwitterSignIn = async () => {
      // Implementation based on your Twitter authentication library
      // Example using 'react-native-twitter-signin':
      try {
        console.log("twit click")
        // Handle successful Twitter sign-in
      } catch (error) {
        // Handle Twitter sign-in error
      }
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
        useNativeDriver: true,
      }).start();
    
      // Create an array of letter animation configurations
      const letterAnimationConfigs = letterAnimations.current.map((anim, index) => {
        return {
          0: {
            opacity: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
          1: {
            opacity: 1,
            transform: [{ scale: 1 }],
          },
        };
      });
    
      // Create the staggered animation sequence
      Animated.stagger(500, letterAnimationConfigs.map((config, index) => {
        return Animated.timing(letterAnimations.current[index], {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        });
      })).start(handleTitleAnimationComplete);
    
      const scale: LetterScale = letterAnimations.current.map(animation => ({
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        opacity: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      }));
      setLetterScale(scale);
    };

    const handleTitleAnimationComplete = () => {
      console.log('Title animation complete');
      setAnimationComplete(true);
      titleAnimationRef.current = Animated.timing(titleTranslateY, {
        toValue: -50,
        duration: 500,
        useNativeDriver: true,
      });
    
      if (titleAnimationRef.current) {
        titleAnimationRef.current.start(() => {
          setTitlePosition({ top: new Animated.Value(50), left: new Animated.Value(0) });
        });
        console.log('Title position =', titlePosition);
      }
    };

    return (
      <ImageBackground source={radialGradientBg} style={styles.container} resizeMode="cover">
        {!isAuthenticated && (
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.titleContainer}>
              {letterScale.map((anim, index) => (
                <Animated.Text
                  key={index}
                  style={[
                    styles.titleLetter,
                    {
                      opacity: anim.opacity,
                      transform: [{ scale: anim.scale }],
                    },
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
                  transform: [{ translateY: titleTranslateY }],
                }}
              >
                

                {isSignedUp ? (
                  <View style={styles.profileContainer}>
                    <View style={styles.headerUploadContainer}>
                      <HeaderPicUpload onHeaderPicChange={handleHeaderPicChange} />
                    </View>
                    <View style={styles.profilePicUploadContainer}>
                    <ProfilePicUpload
                      onProfilePicChange={handleProfilePicChange}
                      style={styles.profilePicUpload}
                    />
                  </View>
                    <InputField
                      label="Username"
                      placeholder="What should your @ be?"
                      value={username}
                      onChangeText={handleUsernameChange}
                      onBlur={() => username.trim() === '' && setUsername('')}
                      labelStyle={styles.enhancedInputLabel}
                      inputStyle={styles.enhancedInput}
                    />
                    {username.trim().length > 0 && (
                      <Text style={isUsernameAvailable ? styles.available : styles.unavailable}>
                        {isUsernameAvailable ? 'Username available!' : 'Username unavailable!'}
                      </Text>
                    )}
                    <InputField
                      label="Display Name"
                      placeholder="(yes you can change this later)"
                      value={displayName}
                      onChangeText={handledisplayNameChange}
                      onBlur={() => displayName.trim() === '' && setDisplayName('')}
                      labelStyle={styles.enhancedInputLabel}
                      inputStyle={styles.enhancedInput}
                    />
                    {displayName.trim().length > 0 && (
                      <Text style={isdisplayNameAvailable ? styles.available : styles.unavailable}>
                        {isdisplayNameAvailable ? 'Display Name available!' : 'Display name unavailable!'}
                      </Text>
                    )}
                    <Button title="Complete Profile" onPress={handleCompleteProfile} />
                  </View>
                ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
                  <View style={styles.formContainer}>
                    <Text style={styles.signupHeader}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                    <InputField
                      label="Email"
                      placeholder="Enter Email"
                      value={email}
                      onChangeText={(text) => setEmail(text)}
                      containerStyle={styles.enhancedInputContainer}
                      labelStyle={styles.enhancedInputLabel}
                      inputStyle={styles.enhancedInput}
                    />
                    {isEmailTaken && (
                      <Text style={styles.errorMessage}>Email already taken!</Text>
                    )}
                    <InputField
                      label="Password"
                      placeholder="Enter Password"
                      secureTextEntry
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      containerStyle={styles.enhancedInputContainer}
                      labelStyle={styles.enhancedInputLabel}
                      inputStyle={styles.enhancedInput}
                    />
                    {!isLogin && (
                      <>
                        <InputField
                          label="Confirm Password"
                          placeholder="Re-enter Password"
                          secureTextEntry
                          value={confirmPassword}
                          onChangeText={(text) => setConfirmPassword(text)}
                          containerStyle={styles.enhancedInputContainer}
                          labelStyle={styles.enhancedInputLabel}
                          inputStyle={styles.enhancedInput}
                        />
                        {password !== confirmPassword && (
                          <Text style={styles.errorMessage}>Passwords do not match!</Text>
                        )}
                      </>
                    )}

                   {!isLogin && (
                      <View style={styles.termsContainer}>
                        <CheckBox
                          label="I have read and agree to the terms and conditions"
                          checked={termsAccepted}
                          onChange={handleTermsCheckbox}
                          style={styles.checkbox}
                          labelStyle={styles.termsText}
                        />
                      </View>
                    )}
                    {isLogin ? (
                      <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <LinearGradient
                          colors={['#002400', '#00e100']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: .5 }}
                          style={styles.gradient}
                        >
                          <Text style={styles.buttonText}>Login</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                    ) : (
                      <Button title="Sign Up" onPress={handleSignup} />
                    )}
                    <TouchableOpacity onPress={toggleForm} style={styles.toggleForm}>
                      <Text style={styles.toggleFormText}>
                        {isLogin
                          ? "Need an account? Sign up here"
                          : "Already have an account? Login here"}
                      </Text>
                    </TouchableOpacity>
                    {isLogin && (
                        <TouchableOpacity onPress={handleForgotPassword} style={styles.toggleForm}>
                          <Text style={styles.toggleFormText}>Forgot Password?</Text>
                        </TouchableOpacity>
                      )}
                {!isSignedUp && (
                      <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity onPress={handleGoogleSignIn} style={styles.socialButton}>
                          <FontAwesomeIcon name="google" size={24} color="#DB4437" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAppleSignIn} style={styles.socialButton}>
                          <FontAwesomeIcon name="apple" size={24} color="#000000" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleTwitterSignIn} style={styles.socialButton}>
                          <MaterialIcon name="twitter" size={24} color="#1DA1F2" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 1.0)',
    },
    scrollViewContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      width: '100%',
    },
    titleContainer: {
      marginBottom: 30,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '30%', // Added width to make the title container full width
    },
    titleLetter: {
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
      fontSize: 60,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center', // Added textAlign to center the title letters
    justifyContent: 'center',
    alignItems: 'center',
},
    formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 1.0)',
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 14,
      width: '90%', // Updated width to make the form container narrower
      maxWidth: 360, // Adjusted maxWidth to control the maximum width of the form container
      alignSelf: 'center',
      borderWidth: 1, // Added border width
      borderColor: '#ddd', // Light border color
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 20,
      marginTop: 30, // Added marginTop to lower the form container
    },
    
    signupHeader: {
      fontSize: 32, // Reduced for space
      fontWeight: 'bold',
      color: '#333',
      alignSelf: 'center',
      marginBottom: 20,
    },
    profileContainer: {
      alignItems: 'center',
    },
    headerUploadContainer: {
      width: '100%',
      marginBottom: 30, // Reduced to save space
    },
    profilePicUpload: {
      position: 'absolute',
      top: -45, // Adjusted for better visual effect
      alignSelf: 'center',
      zIndex: 1,
    },
    errorMessage: {
      color: '#e63946', // Standard color for error
      fontSize: 14, // Scaled down for subtlety
      paddingVertical: 5,
    },
    buttonContainer: {
      width: '100%',
      marginTop: 10,
    },
    button: {
      borderRadius: 18,
      overflow: 'hidden', // This is necessary to contain the LinearGradient
      marginVertical: 5,
      width: '100%', // Set the width to 100% of its parent container
    },
    
    gradient: {
      height: 50, // Set a fixed height for the gradient
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%', // Make sure the gradient also covers the full width
    },
    
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
      borderRadius: 48,
      overflow: 'hidden', // This is necessary to contain the LinearGradient
      marginVertical: 4,
      paddingHorizontal: 100,
      width: '100%', // Set the width to 100% of its parent container
    },

    toggleForm: {
      marginTop: 20,
    },
    toggleFormText: {
      color: '#007AFF',
      fontSize: 16,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      fontSize: 16,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.0)', // Semi-transparent black background
    },
    footerLink: {
      fontSize: 16, // Increased font size for better tap targets
      color: '#4A90E2',
    },
    footerDivider: {
      fontSize: 14,
      color: '#999', // Lighter for less emphasis
      marginHorizontal: 5,
    },
    available: {
      color: '#2ecc71', // Soft green for availability
    },
    unavailable: {
      color: '#e74c3c', // Soft red for unavailability
    },
    enhancedInputContainer: {
      marginBottom: 15,
    },
    enhancedInputLabel: {
      color: '#333',
      fontSize: 18, // Increased font size for better readability
      fontWeight: '600',
      marginBottom: 5,
    },
    enhancedInput: {
      backgroundColor: '#f7f7f7', // Slightly darker to differentiate from the background
      borderRadius: 8,
      fontSize: 16,
      paddingHorizontal: 15,
      height: 50,
    },
    uniformButton: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
    },
    checkbox: {
      marginRight: 10,
      borderRadius: 4, // Rounded corners for the checkbox
      borderWidth: 2, // Thicker border for better visibility
      borderColor: '#333', // Darker border color for contrast
    },
    termsText: {
      fontSize: 10,
      color: '#333',
    },
    socialButtonsContainer: {
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    
    socialButton: {
      marginHorizontal: 20,
    },
    
    socialButtonIcon: {
      width: 40,
      height: 40,
    },
    profilePicUploadContainer: {
      position: 'absolute',
      top: -60, // Adjust the value to position the profile pic as desired
      alignSelf: 'center',
      zIndex: 1,
    },
  });

export default LandingPage;