
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
    ProfileCompletedSlideshow: { user: User };
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
          Alert.alert(
            'Success',
            'Account created successfully!',
            [{ text: 'OK' }],
            { cancelable: false }
          );
        } else {
          throw new Error('Failed to create account');
        }
      } catch (error) {
        console.error('Signup error:', error);
        Alert.alert('Error', 'An error occurred while signing up. Please try again.');
      }
    };
// Utility function to convert file to base64 string
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export const handleCompleteProfile = async (
  email: string,
  username: string,
  displayName: string,
  profilePicFile: File | null,
  headerPicFile: File | null,
  navigation: LandingPageNavigationProp
): Promise<void> => {
  try {
    const profilePic = profilePicFile ? await fileToBase64(profilePicFile) : null;
    const headerPic = headerPicFile ? await fileToBase64(headerPicFile) : null;

    const profileData = {
      operation: 'completeProfile',
      email,
      username,
      displayName,
      profilePic,
      headerPic,
    };

    console.log('Sending complete profile request with data:', profileData);

    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Profile completed successfully with response:', data);
      Alert.alert(
        'Success',
        'Profile completed successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Feed', { user: data.user }) }],
        { cancelable: false }
      );
    } else {
      console.error('Failed to complete profile', data);
      Alert.alert('Error', data.message || 'Failed to complete profile');
    }
  } catch (error) {
    console.error('Error completing profile:', error);
    Alert.alert('Error', 'An error occurred while completing your profile. Please try again.');
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
          Alert.alert(
            'Success',
            `Welcome back, ${data.user.displayName}!`,
            [{ text: 'OK', onPress: () => {
              console.log('Alert closed, navigating to Feed');
              navigation.navigate('Feed', { user: data.user });
              setIsLoading(false);
            }}],
            { cancelable: false }
          );
        } else {
          console.log('Sign-in failed');
          setIsLoading(false);
          Alert.alert('Error', data.message || 'Sign-in failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        Alert.alert('Error', 'An error occurred during sign-in. Please try again.');
      }
    };
    