
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { Asset } from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';

const defaultProfilePicUrl = 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg';
const defaultHeaderPicUrl = 'https://jestr-bucket.s3.amazonaws.com/HeaderPictures/default-header-pic.jpg';

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
    setIsSignedUp: React.Dispatch<React.SetStateAction<boolean>>,
    setSignupSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
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
        setSignupSuccessModalVisible(true);
        setTimeout(() => {
          setSignupSuccessModalVisible(false);
        }, 4000); // Modal visible for 1 second
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An error occurred while signing up. Please try again.');
    }
  };

  // Utility function to convert file to base64 string
  const fileToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await RNFetchBlob.fs.readFile(uri, 'base64');
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      return null;
    }
  };

  export const handleCompleteProfile = async (
    email: string,
    username: string,
    displayName: string | null,
    profilePic: Asset | null,
    headerPicFile: Asset | null,
    setSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    navigation: LandingPageNavigationProp
  ) => {
    try {
      const profilePicBase64 = profilePic && profilePic.uri ? await fileToBase64(profilePic.uri) : null;
      const headerPicBase64 = headerPicFile && headerPicFile.uri ? await fileToBase64(headerPicFile.uri) : null;
      

      const profileData = {
        operation: 'completeProfile',
        email,
        username,
        displayName: displayName || null,
        profilePic: profilePicBase64,
        headerPic: headerPicBase64,
      };

      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Profile data being passed:', data.user);
        setSuccessModalVisible(true); // Show success modal instead of alert
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('Feed', { user: data.user });
        }, 3000); // Modal visible for 1 second then navigate
      } else {
        console.error('Failed to complete profile:', data.message);
        setSuccessModalVisible(false); // Optionally handle error with modal/notification
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      setSuccessModalVisible(false); // Optionally handle error with modal/notification
    }
  };

  export const handleLogin = async (
    email: string,
    password: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    navigation: LandingPageNavigationProp,
    setSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setModalUsername: React.Dispatch<React.SetStateAction<string>>
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
        setModalUsername(data.user.displayName);
        setSuccessModalVisible(true);
        setTimeout(() => {
          navigation.navigate('Feed', { user: data.user });
          setIsLoading(false);
          setSuccessModalVisible(false);
        }, 2000); // Show modal for 2 seconds before navigating
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

  export const handleShareMeme = async (
    memeID: string,
    userEmail: string,
    username: string,
    catchUser: string,
    setResponseModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setResponseMessage: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const shareData = {
      operation: 'shareMeme',
      memeID,
      email: userEmail,
      username,
      catchUser,
    };
  
    try {
      console.log('Initiating share operation...');
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/shareMeme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Share successful:', data);
        setResponseMessage('Meme shared successfully!');
        setResponseModalVisible(true);
        setTimeout(() => setResponseModalVisible(false), 3000); // Show response modal for 3 seconds
      } else {
        throw new Error(data.message || 'Failed to share meme.');
      }
    } catch (error) {
      console.error('Share error:', error);
      setResponseModalVisible(true);
      setTimeout(() => setResponseModalVisible(false), 3000); // Show error modal for 3 seconds
    }
  };
  
    