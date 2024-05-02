import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

export type User = {
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
  type LandingPageNavigationProp = NavigationProp<RootStackParamList, 'Feed'>;

    export const handleGoogleSignIn = async () => {
        // Implementation based on '@react-native-google-signin/google-signin'
    };

    export const handleAppleSignIn = async () => {
        // Implementation based on '@invertase/react-native-apple-authentication'
    };

    export const handleTwitterSignIn = async () => {
        try {
        console.log("twit click")
        } catch (error) {
        }
    };

    export const handleSignup = async (
        email: string,
        password: string,
        setIsSignedUp: React.Dispatch<React.SetStateAction<boolean>>
      ) => {
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

    export const handleCompleteProfile = async (
        email: string,
        username: string,
        displayName: string,
        profilePic: File | null,
        headerPicFile: File | null,
        navigation: LandingPageNavigationProp
      ) => {
        try {
        const profileData = {
            operation: 'completeProfile',
            email: email,
            username: username,
            displayName: displayName,
            profilePic: profilePic,
            headerPic: headerPicFile, 
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

    export const handleLogin = async (
      email: string,
      password: string,
      setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
      navigation: LandingPageNavigationProp
    ) => {
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
              navigation.navigate('Feed', { user: data.user }); // Pass the user object as a parameter
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
    