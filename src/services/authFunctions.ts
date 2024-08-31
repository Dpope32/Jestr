import {Alert} from 'react-native';
import React from 'react';
import Toast from 'react-native-toast-message';
import {StackNavigationProp} from '@react-navigation/stack';
import {resetPassword} from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, Meme, FetchMemesResult} from '../types/types';
import {API_URL} from '../components/Meme/config';
import {
  signUp,
  signOut,
  confirmSignIn,
  getCurrentUser,
  fetchAuthSession,
  signIn,
} from '@aws-amplify/auth';
import {RootStackParamList, ProfileImage} from '../types/types';
import * as FileSystem from 'expo-file-system';
import {v4 as uuidv4} from 'uuid';
import {useUserStore} from '../store/userStore';
import {getToken, removeToken, storeUserIdentifier} from '../store/secureStore';
import * as SecureStore from 'expo-secure-store';
import * as ImageManipulator from 'expo-image-manipulator';

type TransformedMemeView = {
  email: string;
  memeIDs: string[];
  ttl: number;
};

const API_ENDPOINT =
  'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser';

export const handleGoogleSignIn = async () => {
  // Implementation based on '@react-native-google-signin/google-signin'
};

export const checkAuthStatus = async () => {
  try {
    const {tokens} = await fetchAuthSession();
    return tokens !== undefined;
  } catch (error) {
    return false;
  }
};

export const handleLogin = async (
  username: string,
  password: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigation: StackNavigationProp<RootStackParamList>,
  setSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setModalUsername: React.Dispatch<React.SetStateAction<string>>,
) => {
  setIsLoading(true);
  try {
    // Clear existing auth data
    await signOut({global: true});
    await SecureStore.deleteItemAsync('accessToken');
    await AsyncStorage.removeItem('userIdentifier');
    useUserStore.getState().resetUserState(); // Use the resetUserState function

    const lowercaseUsername = username.toLowerCase();
    const {isSignedIn, nextStep} = await signIn({
      username: lowercaseUsername,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH',
      },
    });

    if (isSignedIn) {
      const {tokens} = await fetchAuthSession();
      const accessToken = tokens?.accessToken?.toString();
      if (accessToken) {
        await SecureStore.setItemAsync('accessToken', accessToken);
      }
      const userDetails = await fetchUserDetails(username, accessToken || '');

      // Update Zustand store
      useUserStore.getState().setUserDetails({
        email: userDetails.email,
        username: userDetails.username,
        displayName: userDetails.displayName,
        profilePic: userDetails.profilePic,
        headerPic: userDetails.headerPic,
        bio: userDetails.bio,
        creationDate: userDetails.CreationDate,
        followersCount: userDetails.FollowersCount,
        followingCount: userDetails.FollowingCount,
        isAdmin: userDetails.email === 'pope.dawson@gmail.com',
      });

      // Store user identifier
      await storeUserIdentifier(userDetails.email);

      navigation.navigate('Feed', {
        user: useUserStore.getState() as User, // Cast to User type
      });
    } else if (
      nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
    ) {
      navigation.navigate('ChangePassword', {
        username,
        nextStep: nextStep,
      });
    } else {
      Alert.alert('Login Failed', 'Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message || 'An unknown error occurred');
  } finally {
    setIsLoading(false);
  }
};

export const fetchUserDetails = async (identifier: string, token?: string) => {
  // console.log('Fetching user details for identifier:', identifier);
  // console.log('Using API endpoint:', API_ENDPOINT);
  // console.log('Token being sent:', token);

  const requestBody = {
    operation: 'getUser',
    identifier: identifier,
  };

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
  console.log('Response status:', response.status);
  //  console.log('Response headers:', JSON.stringify(response.headers));

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error response body:', errorBody);
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`,
    );
  }
  const data = await response.json();
  // console.log('User details fetched successfully:', JSON.stringify(data, null, 2));

  if (!data.data) {
    throw new Error('No user data returned from server');
  }

  return data.data; // Return only the data part
};

export const handleSignOut = async (
  navigation: StackNavigationProp<RootStackParamList>,
) => {
  try {
    await signOut({global: true});
    await removeToken('accessToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await SecureStore.deleteItemAsync('accessToken');
    await AsyncStorage.clear(); // Clears everything in AsyncStorage

    // Clear Zustand store
    useUserStore.getState().resetUserState();

    console.log('Sign out successful');

    // Log current navigation state
    console.log(
      'Current navigation state before reset:',
      navigation.getState(),
    );

    // Perform reset
    navigation.reset({
      index: 0,
      routes: [{name: 'LandingPage'}],
    });

    // Log navigation state after reset
    console.log('Navigation state after reset:', navigation.getState());
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const handleSignup = async (
  email: string,
  password: string,
  setIsSignedUp: React.Dispatch<React.SetStateAction<boolean>>,
  setSignupSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
  navigation: StackNavigationProp<RootStackParamList>,
  navigateToConfirmSignUp: (email: string) => void,
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>,
) => {
  const defaultName = 'jestruser';

  try {
    const userAttributes = {
      email,
      phone_number: '+1234567890', // Default phone number
      name: defaultName, // Default name
    };

    // console.log('User attributes being sent:', userAttributes);

    const {isSignUpComplete, userId, nextStep} = await signUp({
      username: email,
      password,
      options: {
        userAttributes,
      },
    });

    if (isSignUpComplete) {
      setIsSignedUp(true);
      setSignupSuccessModalVisible(true);

      // Automatically sign in the user after successful signup
      const {isSignedIn} = await signIn({
        username: email, // Use email here instead of username
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      });
      if (isSignedIn) {
        const authUser = await getCurrentUser();
        const user = convertAuthUserToUser(authUser);
        useUserStore.getState().setUserDetails(user);
        navigation.navigate('CompleteProfileScreen', {email});
      } else {
        Alert.alert(
          'Login Incomplete',
          'Please complete the additional step to sign in',
        );
      }
    } else {
      //   console.log('Additional signup step required:', nextStep);

      if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigateToConfirmSignUp(email);
      } else {
        Alert.alert(
          'Signup Incomplete',
          'Please check your email for verification instructions',
        );
      }
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.name === 'UsernameExistsException') {
      Alert.alert(
        'Account Already Exists',
        "Looks like you already have an account. Try to sign in or click 'Forgot Password'.",
        [
          {text: 'OK', onPress: () => {}},
          {text: 'Sign In', onPress: () => setCurrentScreen('login')}, // Assuming you have a function to switch forms
          {text: 'Forgot Password', onPress: () => handleForgotPassword(email)},
        ],
      );
    } else {
      Alert.alert(
        'Signup Failed',
        error.message || 'An unknown error occurred',
      );
    }
  }
};

const compressImage = async (image: ProfileImage): Promise<ProfileImage> => {
  if (!image.uri) {
    throw new Error('Image URI is undefined');
  }

  const manipulatedImage = await ImageManipulator.manipulateAsync(
    image.uri as string, // Type assertion to ensure TypeScript knows this is a string
    [{resize: {width: 800}}], // Resize the image
    {compress: 0.7, format: ImageManipulator.SaveFormat.JPEG},
  );

  return {
    uri: manipulatedImage.uri,
    width: manipulatedImage.width,
    height: manipulatedImage.height,
    type: image.type,
    fileName: image.fileName,
    fileSize: image.fileSize,
  };
};

export const handleCompleteProfile = async (
  email: string,
  username: string,
  displayName: string,
  profilePicAsset: ProfileImage | null,
  headerPicAsset: ProfileImage | null,
  bio: string,
  setSuccessModalVisible: (visible: boolean) => void,
  navigation: StackNavigationProp<RootStackParamList>,
  preferences: {
    darkMode: boolean;
    likesPublic: boolean;
    notificationsEnabled: boolean;
  },
) => {
  try {
    const profilePicBase64 = profilePicAsset
      ? await fileToBase64(await compressImage(profilePicAsset))
      : null;
    const headerPicBase64 = headerPicAsset
      ? await fileToBase64(await compressImage(headerPicAsset))
      : null;

    console.log('Sending to server:', {
      email,
      username,
      displayName,
      profilePic: profilePicBase64 ? 'Base64 data' : null,
      headerPic: headerPicBase64 ? 'Base64 data' : null,
      bio,
    });

    const profileData = {
      operation: 'completeProfile',
      email,
      username,
      displayName: displayName || null,
      profilePic: profilePicBase64,
      headerPic: headerPicBase64,
      bio,
      darkMode: preferences.darkMode,
      likesPublic: preferences.likesPublic,
      notificationsEnabled: preferences.notificationsEnabled,
    };

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(profileData),
      },
    );

    const responseData = await response.json();
    console.log('Raw response:', JSON.stringify(responseData));

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to complete profile');
    }

    if (responseData.data && responseData.data.email) {
      const user: User = {
        email: responseData.data.email,
        username: responseData.data.username,
        profilePic: responseData.data.profilePic || '',
        displayName: responseData.data.displayName || '',
        headerPic: responseData.data.headerPic || '',
        CreationDate:
          responseData.data.CreationDate || new Date().toISOString(),
        followersCount: responseData.data.followersCount || 0,
        followingCount: responseData.data.followingCount || 0,
        bio: responseData.data.bio || '',
        userId: responseData.data.userId || uuidv4(),
        darkMode: responseData.data.darkMode || false,
        likesPublic: responseData.data.likesPublic || true,
        notificationsEnabled: responseData.data.notificationsEnabled || true,
      };

      useUserStore.getState().setUserDetails({
        email: responseData.data.email,
        username: responseData.data.username,
        displayName: responseData.data.displayName,
        profilePic: responseData.data.profilePic,
        headerPic: responseData.data.headerPic,
        bio: responseData.data.bio,
        creationDate: responseData.data.CreationDate,
        darkMode: responseData.data.darkMode,
        likesPublic: responseData.data.likesPublic,
        notificationsEnabled: responseData.data.notificationsEnabled,
        userId: responseData.data.userId,
      });

      // Store the access token in SecureStore
      if (responseData.data.accessToken) {
        await SecureStore.setItemAsync(
          'accessToken',
          responseData.data.accessToken,
        );
        console.log('Token stored successfully');
      } else {
        const {tokens} = await fetchAuthSession();
        const accessToken = tokens?.accessToken?.toString();
        if (accessToken) {
          await SecureStore.setItemAsync('accessToken', accessToken);
          console.log('Token stored successfully from session');
        } else {
          console.warn('No access token available to store');
        }
      }

      // Store user identifier in SecureStore
      await storeUserIdentifier(user.email);

      setSuccessModalVisible(true);

      // Log current navigation state
      console.log(
        'Current navigation state before reset:',
        navigation.getState(),
      );

      // Use navigation.reset to clear the navigation stack
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Feed',
            params: {
              user: {
                email: user.email,
                username: user.username,
                // ... other serializable properties
              },
            },
          },
        ],
      });

      // Log navigation state after reset
      console.log('Navigation state after reset:', navigation.getState());
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error completing profile:', error);
    throw error;
  }
};

const fileToBase64 = async (asset: ProfileImage): Promise<string | null> => {
  if (asset.uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      return null;
    }
  }
  return null;
};

export const fetchTabMemes = async (
  tab: 'posts' | 'liked' | 'history' | 'downloaded',
  page: number = 1,
  pageSize: number = 30,
  userEmail: string,
  lastEvaluatedKey: string | null,
): Promise<FetchMemesResult> => {
  try {
    // console.log(`Fetching memes for tab: ${tab}, page: ${page}`);
    let result: FetchMemesResult;
    switch (tab) {
      case 'posts':
        result = await getUserMemes(userEmail);
        break;
      case 'liked':
        result = await fetchMemes(
          userEmail,
          'liked',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      case 'history':
        result = await fetchMemes(
          userEmail,
          'viewed',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      case 'downloaded':
        result = await fetchMemes(
          userEmail,
          'downloaded',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      default:
        result = {memes: [], lastEvaluatedKey: null};
    }
    console.log(`Fetched ${result.memes.length} memes for ${tab} tab`);
    return result;
  } catch (error) {
    console.error(`Error fetching ${tab} memes:`, error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

const convertAuthUserToUser = (authUser: any): User => {
  return {
    email: authUser.username,
    username: authUser.username,
    profilePic: '',
    displayName: '',
    headerPic: '',
    CreationDate: new Date().toISOString(),
    followersCount: 0,
    followingCount: 0,
    bio: '', // Add this line
  };
};

export const handleChangePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string,
  navigation: StackNavigationProp<RootStackParamList>,
) => {
  try {
    const {isSignedIn, nextStep} = await signIn({
      username,
      password: oldPassword,
    });
    if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      const result = await confirmSignIn({challengeResponse: newPassword});
      if (result.isSignedIn) {
        const authUser = await getCurrentUser();
        const user = convertAuthUserToUser(authUser);
        useUserStore.getState().setUserDetails(user);
        navigation.navigate('Feed', {user});
      } else {
        throw new Error('Failed to change password');
      }
    } else {
      throw new Error('Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    Alert.alert(
      'Password Change Failed',
      error.message || 'An unknown error occurred',
    );
  }
};

export const deleteMeme = async (memeID: string, userEmail: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/deleteMeme',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({operation: 'deleteMeme', memeID, userEmail}),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to delete meme');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting meme:', error);
    throw error;
  }
};

export const removeDownloadedMeme = async (
  userEmail: string,
  memeID: string,
) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/removeDownloadedMeme',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'removeDownloadedMeme',
          userEmail,
          memeID,
        }),
      },
    );
    if (!response.ok) {
      throw new Error('Failed to remove downloaded meme');
    }
    return await response.json();
  } catch (error) {
    console.error('Error removing downloaded meme:', error);
    throw error;
  }
};

export const handleAppleSignIn = async () => {
  // Implementation based on '@invertase/react-native-apple-authentication'
};

export const sendMessage = async (
  senderID: string,
  receiverID: string,
  content: string,
) => {
  try {
    //  console.log('Sending message from:', senderID, 'to:', receiverID);
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/sendMessage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'sendMessage',
          senderID,
          receiverID,
          content,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Server responded with an error:', data);
      throw new Error(data.message || 'Failed to send message');
    }

    //    console.log('Message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchMemes = async (
  email: string,
  type: 'liked' | 'viewed' | 'downloaded',
  lastEvaluatedKey: string | null = null,
  limit: number = 5,
): Promise<FetchMemesResult> => {
  // console.log(`Fetching ${type} memes for user: ${email}`);
  try {
    let endpoint;
    let operation;
    switch (type) {
      case 'liked':
        endpoint = '/fetchLikedMemes';
        operation = 'fetchLikedMemes';
        break;
      case 'downloaded':
        endpoint = '/fetchDownloadedMemes';
        operation = 'fetchDownloadedMemes';
        break;
      case 'viewed':
        endpoint = '/fetchViewHistory';
        operation = 'fetchViewHistory';
        break;
      default:
        throw new Error('Invalid type specified');
    }

    const requestBody = {
      operation,
      email,
      lastEvaluatedKey,
      limit,
    };

    //  console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${type} memes. Status: ${response.status}`,
      );
    }

    const responseData = await response.json();
    //  console.log('Raw API response:', JSON.stringify(responseData));

    // Check for the nested data structure
    const data =
      responseData.data && responseData.data.data
        ? responseData.data.data
        : responseData.data;

    if (!data || !Array.isArray(data.memes)) {
      console.error('Invalid data structure received:', responseData);
      return {memes: [], lastEvaluatedKey: null};
    }

    const memes: Meme[] = data.memes.map((item: any) => ({
      memeID: item.MemeID || '',
      url: item.MemeURL || '',
      caption: item.Caption || '',
      uploadTimestamp: item.UploadTimestamp || item.Timestamp || '',
      likeCount: item.LikeCount || 0,
      downloadCount: item.DownloadsCount || 0,
      commentCount: item.CommentCount || 0,
      shareCount: item.ShareCount || 0,
      username: item.Username || '',
      profilePicUrl: item.ProfilePicUrl || '',
      email: item.Email || item.email || '',
      liked: item.Liked || false,
      doubleLiked: item.DoubleLiked || false,
      memeUser: {
        email: item.Email || item.email || '',
        username: item.Username || '',
        profilePic: item.ProfilePicUrl || '',
      },
    }));

    //  console.log(`Processed ${memes.length} memes`);

    return {
      memes,
      lastEvaluatedKey: data.lastEvaluatedKey || null,
    };
  } catch (error) {
    console.error(`Error fetching ${type} memes:`, error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

export const getUserMemes = async (
  email: string,
  lastEvaluatedKey: string | null = null,
): Promise<FetchMemesResult> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUserMemes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getUserMemes',
          email,
          lastEvaluatedKey,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
      memes: data.data.memes,
      lastEvaluatedKey: data.data.lastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error fetching user memes:', error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

export const removeFollow = async (
  unfollowerId: string,
  unfolloweeId: string,
): Promise<void> => {
  // Implementation
};

export const fetchConversations = async (userEmail: string) => {
  //console.log('Fetching conversations for:', userEmail);
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getConversations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getConversations',
          userID: userEmail,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const responseData = await response.json();
    //  console.log('Full API Response:', responseData);
    if (responseData.data && Array.isArray(responseData.data.conversations)) {
      return responseData.data.conversations;
    } else {
      console.error('Unexpected response structure:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const handleTwitterSignIn = async () => {
  try {
    console.log('twit click');
  } catch (error) {}
};

export const fetchMessages = async (userID: string, conversationID: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getMessages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getMessages',
          userID,
          conversationID,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    //console.log('Fetched messages:', responseData);

    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else {
      console.error('Unexpected response structure:', responseData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const addFollow = async (followerId: string, followeeId: string) => {
  const followData = {
    operation: 'addFollow',
    followerId,
    followeeId,
  };

  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/addFollow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followData),
      },
    );

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        followersCount: result.followersCount,
        followingCount: result.followingCount,
      };
    } else {
      console.error('Failed to add follow');
      return {success: false};
    }
  } catch (error) {
    console.error('Error adding follow:', error);
    return {success: false};
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getAllUsers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({operation: 'getAllUsers'}),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    //console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON response');
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure');
    }

    return data.data.map((user: any) => ({
      email: user.email,
      username: user.username || '',
      profilePic: user.profilePic || '',
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const handleShareMeme = async (
  memeID: string,
  email: string,
  username: string,
  catchUser: string,
  message: string,
) => {
  const shareData = {
    operation: 'shareMeme',
    memeID,
    email: email,
    username,
    catchUser,
    message,
  };

  //    console.log('Share data:', shareData);

  try {
    //   console.log('Initiating share operation...');
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/shareMeme',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      },
    );

    //    console.log('Response status:', response.status);
    //    console.log('Response body:', await response.text());

    if (response.ok) {
      Toast.show({
        type: 'success', // There are 'success', 'info', 'error'
        position: 'top',
        text1: 'Meme shared successfully!',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        props: {backgroundColor: '#333', textColor: '#white'},
      });
    } else {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Failed to share meme.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        props: {backgroundColor: '#333', textColor: '#00ff00'},
      });
    }
  } catch (error) {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'An error occurred while sharing the meme.',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
    });
  }
};

export const checkFollowStatus = async (
  followerId: string,
  followeeId: string,
): Promise<{isFollowing: boolean; canFollow: boolean}> => {
  //  console.log(`Checking follow status for follower ${followerId} and followee ${followeeId}`);
  if (!followerId || !followeeId) {
    console.error('Missing required parameters: followerId or followeeId');
    return {isFollowing: false, canFollow: false};
  }
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkFollowStatus',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'checkFollowStatus',
          followerId,
          followeeId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //   console.log('Follow status response:', data);
    return data.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

export const updateProfileImage = async (
  email: string,
  imageType: 'profile' | 'header',
  imagePath: string,
) => {
  try {
    const imageBase64 = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
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

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateProfileImage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Update Zustand store with new image URL
    const userStore = useUserStore.getState();
    const updatedUser = {
      ...userStore,
      [imageType + 'Pic']: data.data[imageType + 'Pic'],
    };
    userStore.setUserDetails(updatedUser);

    // Optionally, you can still store the updated user data in SecureStore
    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));

    return data;
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getUser',
          email: userId, // Assuming userId is an email
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const handleForgotPassword = async (email: string) => {
  try {
    if (!email) {
      Alert.alert(
        'Error',
        'Please enter your email address on the login screen',
      );
      return;
    }
    await resetPassword({username: email});
    Alert.alert('Success', 'Check your email for password reset instructions');
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    Alert.alert('Error', (error as Error).message || 'An error occurred');
  }
};

export const verifyToken = async (token: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/verifyToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowing',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getFollowing',
          userId: userId, // Changed from userEmail to userId
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
};

export const getFollowers = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getFollowers',
          userId: userId, // Changed from userEmail to userId
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
};

export const getUser = async (userEmail: string): Promise<User | null> => {
  try {
    const requestBody = JSON.stringify({
      operation: 'getUser',
      email: userEmail, // Add this line
    });

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
    );
    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, body: ${responseText}`,
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    if (!data || !data.data || !data.data.email) {
      console.error('Invalid or incomplete user data received:', data);
      throw new Error('Invalid or incomplete user data received');
    }
    return data.data || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const recordMemeViews = async (
  memeViews: {email: string; memeID: string}[],
): Promise<void> => {
  // Log the incoming data to ensure it's correct
  console.log('Received meme views:', JSON.stringify(memeViews));

  if (!Array.isArray(memeViews) || memeViews.length === 0) {
    console.error('memeViews must be a non-empty array.');
    return;
  }

  // Transform single meme views to the expected format if necessary
  // Transform single meme views to the expected format if necessary
  const transformedViews = memeViews.reduce<TransformedMemeView[]>(
    (acc, view) => {
      const existing = acc.find(v => v.email === view.email);
      if (existing) {
        existing.memeIDs.push(view.memeID);
      } else {
        acc.push({
          email: view.email,
          memeIDs: [view.memeID],
          ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Add TTL if needed
        });
      }
      return acc;
    },
    [],
  );

  // Log transformed data
  console.log(
    'Transformed meme views for batch processing:',
    JSON.stringify(transformedViews),
  );

  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/recordMemeView',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken('accessToken')}`,
        },
        body: JSON.stringify({
          operation: 'recordMemeView',
          memeViews: transformedViews,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to record meme views');
    }

    console.log('Meme views recorded successfully');
  } catch (error) {
    console.error('Error recording meme views:', error);
    throw error;
  }
};
