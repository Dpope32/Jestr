import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  InputField  from '../../components/Input/InutField';
import Button  from '../../components/Button/Button';
import LoadingScreen from '../../components/LoadingScreen';
import { Alert } from 'react-native';
import  HeaderPicUpload  from '../../components/Upload/HeaderPicUpload';
import  ProfilePicUpload  from '../../components/Upload/ProfilePicUpload';
import { ImageBackground } from 'react-native';

const radialGradientBg = require('../../assets/images/radial_gradient_bg.png');


type User = {
    email: string;
    username: string;
    profilePic: string;
    displayName: string;
    headerPic: string;
    creationDate: string;
  };

function LandingPage() {
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
    useEffect(() => {
      letterAnimations.current = ['J', 'e', 's', 't', 'r'].map((letter, index) => {
        const animation = new Animated.Value(0);
        Animated.timing(animation, {
          toValue: 1,
          duration: 500,
          delay: index * 200,
          useNativeDriver: true,
        }).start(index === 4 ? handleTitleAnimationComplete : undefined);
        return animation;
      });
    }, []);
  
  
  
    const handleTitleAnimationComplete = () => {
      setAnimationComplete(true);
      titleAnimationRef.current = Animated.timing(titleTranslateY, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      });
  
      if (titleAnimationRef.current) {
        titleAnimationRef.current.start(() => {
          setTitlePosition({ top: new Animated.Value(100), left: new Animated.Value(0) });
        });
      }
    };
    const letterScale = letterAnimations.current.map((animation: Animated.Value) => {
      return {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        opacity: animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 1],
        }),
      };
    });
    type RootStackParamList = {
        Feed: { user: User };
      };
      type LandingPageNavigationProp = NavigationProp<RootStackParamList, 'Feed'>;
      const navigation = useNavigation<LandingPageNavigationProp>();

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

    const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setUsername('');
    };

  const formContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const headerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: custom * 0.5 },
    }),
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'linear',
        duration: 1,
      },
    },
  };

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
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

  return (
    <ImageBackground source={radialGradientBg} style={styles.container}>
      {letterAnimations.current.length > 0 && (
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
              top: titlePosition.top,
              left: titlePosition.left,
            },
          ]}
        >
          {['J', 'e', 's', 't', 'r'].map((letter, index) => (
            <Animated.Text
              key={letter}
              style={[
                styles.titleLetter,
                {
                  transform: [{ scale: letterScale[index].scale }],
                  opacity: letterScale[index].opacity,
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </Animated.View>
      )}
      {animationComplete && (
        <Animated.View style={[styles.formContainer, {
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }]}>
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
            <Button title="Continue with Google" onPress={() => {}} />
          )}
        </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent', // Add this line
  },
  titleContainer: {
    flexDirection: 'row',
  },
  titleLetter: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10, 
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
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    color: '#666',
  },
  footerDivider: {
    fontSize: 14,
    color: '#666',
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