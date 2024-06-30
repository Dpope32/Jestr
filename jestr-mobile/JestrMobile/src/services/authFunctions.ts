
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { Asset } from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';

const defaultProfilePicUrl = 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg';
const defaultHeaderPicUrl = 'https://jestr-bucket.s3.amazonaws.com/HeaderPictures/default-header-pic.jpg';

export type User = {
  email: string;
  username: string;
  profilePic: string;
  displayName: string;
  headerPic: string;
  creationDate: string;
  followersCount: number;
  followingCount: number;
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

  export const addFollow = async (followerId: string, followeeId: string) => {
    const followData = {
      operation: 'addFollow',
      followerId,
      followeeId,
    };
  
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/addFollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followData),
      });
  
      if (response.ok) {
        console.log('Follow added successfully');
      } else {
        console.error('Failed to add follow');
      }
    } catch (error) {
      console.error('Error adding follow:', error);
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
      console.log('Sending profile data:', JSON.stringify(profileData));


      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok && data.data && data.data.email) {
        const user: User = {
          email: data.data.email,
          username: data.data.username,
          profilePic: data.data.profilePic,
          displayName: data.data.displayName,
          headerPic: data.data.headerPic,
          creationDate: data.data.creationDate,
          followersCount: data.data.followersCount || 0,
          followingCount: data.data.followingCount || 0,
        };
        console.log('Profile data being passed:', data.user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setSuccessModalVisible(true); // Show success modal instead of alert
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('Feed', { user });

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
      if (response.ok && data.message === 'Sign-in successful.' && data.data && data.data.email) {
        const user: User = {
          email: data.data.email,
          username: data.data.username,
          profilePic: data.data.profilePic,
          displayName: data.data.displayName,
          headerPic: data.data.headerPic,
          creationDate: data.data.creationDate,
          followersCount: data.data.followersCount || 0,
          followingCount: data.data.followingCount || 0,
        };
        if (!response.ok || !data || data.message !== 'Sign-in successful.') {
          console.error('Sign-in failed:', data.message, 'Response status:', response.status);
          // Further error handling
        }
  
        await AsyncStorage.setItem('user', JSON.stringify(user)).catch(error => {
          console.log(user)
          console.error('Error storing user data:', error);
        });
        
        console.log('Sign-in successful');
        setModalUsername(user.displayName);
        setSuccessModalVisible(true);
        setTimeout(() => {
          navigation.navigate('Feed', { user });
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
    email: string,
    username: string,
    catchUser: string,
    message: string,
    setResponseModalVisible: (visible: boolean) => void,
    setResponseMessage: (message: string) => void
  ) => {
    const shareData = {
      operation: 'shareMeme',
      memeID,
      email: email,
      username,
      catchUser,
      message,
    };
  
    console.log('Share data:', shareData);
  
    try {
      console.log('Initiating share operation...');
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/shareMeme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });
  
      console.log('Response status:', response.status);
      console.log('Response body:', await response.text());
  
      if (response.ok) {
        Toast.show({
          type: 'success', // There are 'success', 'info', 'error'
          position: 'top',
          text1: 'Meme shared successfully!',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          props: { backgroundColor: '#333', textColor: '#00ff00' },
        });
        
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Failed to share meme.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          props: { backgroundColor: '#333', textColor: '#00ff00' },
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'An error occurred while sharing the meme.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30
      });
    }
  };

  export const checkFollowStatus = async (followerId: string, followeeId: string) => {
    try {
      
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkFollowStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'checkFollowStatus',
          followerId,
          followeeId
        }),
      });
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.data && typeof data.data.isFollowing === 'boolean' && typeof data.data.canFollow === 'boolean') {
        return data.data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
      return { isFollowing: false, canFollow: true };  // Default to allowing follow on error
    }
  };

  export const updateProfileImage = async (email: string, imageType: 'profile' | 'header', imagePath: string) => {
    try {
      console.log('Starting updateProfileImage');
      console.log('Email:', email);
      console.log('Image Type:', imageType);
      console.log('Image Path:', imagePath);
  
      const imageBase64 = await RNFetchBlob.fs.readFile(imagePath, 'base64');
      if (!imageBase64) {
        throw new Error('Failed to read image file');
      }
  
      console.log('Image converted to base64 successfully');
  
      const profileData = {
        operation: 'updateProfileImage',
        email,
        imageType,
        image: imageBase64,
      };
  
      console.log('Sending request to update profile image');
  
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateProfileImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Response data:', data);
  
      // Update local storage with new image URL
      const user = JSON.parse(await AsyncStorage.getItem('user') || '{}');
      user[imageType + 'Pic'] = data.data[imageType + 'Pic'];
      await AsyncStorage.setItem('user', JSON.stringify(user));
  
      return data;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  };

export const getUserMemes = async (email: string) => {
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUserMemes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation: 'getUserMemes', email }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.data; // This will be the array of user memes
  } catch (error) {
    console.error('Error fetching user memes:', error);
    throw error;
  }
};