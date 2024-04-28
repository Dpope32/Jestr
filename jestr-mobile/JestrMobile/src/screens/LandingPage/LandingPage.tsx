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

    const checkAuthStatus = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setIsAuthenticated(true);
          // Navigate to the main app screen or display the appropriate content for authenticated users
        } else {
          setIsAuthenticated(false);
          // Navigate to the landing page or display the login/signup forms
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };
  
    useEffect(() => {
      checkAuthStatus();
      startAnimation(); // Start the animation on component mount
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
            position: 'top',
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
        console.log('Sign-in successful');
        Toast.show({
            type: 'success',
            text1: 'Sign-in successful!',
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
            text1: data.message || 'Sign-in failed.',
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

    const handleGoogleSignIn = async () => {
      // Implementation based on '@react-native-google-signin/google-signin'
    };

    const handleAppleSignIn = async () => {
      // Implementation based on '@invertase/react-native-apple-authentication'
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
      // Initialize the animated values
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

      <View style={styles.formContainer}>
        {animationComplete && (
        <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }}
      >
            {(!isSignedUp || isLogin) && (
              <>
              <InputField
                label="Email"
                placeholder="Enter Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
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
              />
              {!isLogin && (
               <Button title="Sign Up" onPress={handleSignup} />
              )}
              {isLogin && (
               <Button title="Login" onPress={handleLogin} />
              )}
            </>
          )}
          {isSignedUp && (
            <>
              {/* Complete profile section */}
              <HeaderPicUpload onHeaderPicChange={handleHeaderPicChange} />
              <ProfilePicUpload onProfilePicChange={handleProfilePicChange} />
              <InputField
                label="Username"
                placeholder="What should your @ be?"
                value={username}
                onChangeText={handleUsernameChange}
                onBlur={() => username.trim() === '' && setUsername('')}
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
              />
              {displayName.trim().length > 0 && (
                <Text style={isdisplayNameAvailable ? styles.available : styles.unavailable}>
                  {isdisplayNameAvailable ? 'Display Name available!' : 'Display name unavailable!'}
                </Text>
              )} 
              <Button title="Complete Profile" onPress={() => handleCompleteProfile()} />
            </>
          )}
          <TouchableOpacity onPress={toggleForm} style={styles.toggleForm}>
            <Text style={styles.toggleFormText}>
              {isLogin
                ? "Need an account? Sign up here"
                : "Already have an account? Login here"}
            </Text>
          </TouchableOpacity>
          {!isSignedUp && !isLogin && (
              <View>
                <GoogleSigninButton
                  style={styles.button}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                />
                <AppleButton
                  style={styles.button}
                  buttonStyle={AppleButton.Style.BLACK}
                  buttonType={AppleButton.Type.SIGN_IN}
                  onPress={handleAppleSignIn}
                />
              </View>
            )}
            </Animated.View>
          )}
        </View>
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
    backgroundColor: 'transparent',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row', // This will align the letters horizontally
    justifyContent: 'center', // This will center the letters in the container
    alignItems: 'center', // This will center the letters vertically within the container
    width: '100%', // Ensure the container takes the full width
    height: '30%', // Adjust the height accordingly
  },
  titleLetter: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    // remove any margin or padding that might affect layout
  },
  formContainer: {
    alignSelf: 'center',
    marginTop: 50, // Adjust this value as needed
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleForm: {
    marginTop: 20,
  },
  toggleFormText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  footerLink: {
    fontSize: 14,
    color: '#fff',
  },
  footerDivider: {
    fontSize: 14,
    color: '#fff',
    marginHorizontal: 5,
  },
  available: {
    color: 'green',
  },
  unavailable: {
    color: 'red',
  },
});

export default LandingPage;