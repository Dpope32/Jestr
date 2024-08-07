import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { User, Meme, FetchMemesResult  } from '../types/types'
import { API_URL } from '../components/Meme/config';
import { signUp, signOut, confirmSignIn, getCurrentUser, fetchAuthSession, signIn, SignInOutput } from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { ImagePickerAsset } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from '../screens/userStore';
import { ProfileImage } from '../screens/userStore';
type Asset = {
  uri: string;
  type: string;
  name: string;
};

const defaultProfilePicUrl = 'https://jestr-bucket.s3.amazonaws.com/ProfilePictures/default-profile-pic.jpg';
const defaultHeaderPicUrl = 'https://jestr-bucket.s3.amazonaws.com/HeaderPictures/default-header-pic.jpg';

type LandingPageNavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;
const API_ENDPOINT = 'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser';

export const checkAuthStatus = async () => {
  try {
    const { tokens } = await fetchAuthSession();
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
  setModalUsername: React.Dispatch<React.SetStateAction<string>>
) => {
  setIsLoading(true);
  try {
    // Clear any existing session
    await signOut({ global: true });

    const { isSignedIn, nextStep } = await signIn({
      username,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH'
      }
    });
    
    if (isSignedIn) {
      const { tokens } = await fetchAuthSession();
      const accessToken = tokens?.accessToken?.toString();
      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
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
          // ... any other relevant fields
        });
      // Add this line to set isAdmin based on the email
      userDetails.isAdmin = userDetails.email === 'pope.dawson@gmail.com';
      console.log('isAdmin set to:', userDetails.isAdmin);
  
      console.log('User details before navigation:', JSON.stringify(userDetails, null, 2));
      await AsyncStorage.setItem('user', JSON.stringify(userDetails));
      setModalUsername(userDetails.username);
      setSuccessModalVisible(true);
      
      navigation.navigate('Feed', { 
        user: {
          email: userDetails.email,
          username: userDetails.username,
          profilePic: userDetails.email,
          displayName: userDetails.displayName,
          headerPic: userDetails.headerPic,
          creationDate: userDetails.creationDate,
          followersCount: userDetails.followersCount,
          followingCount: userDetails.followingCount
        }
      });
    } else if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      navigation.navigate('ChangePassword', { 
        username, 
        nextStep: nextStep 
      });
    } else {
      console.log('Unexpected next step:', nextStep);
      Alert.alert('Login Failed', 'Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message || 'An unknown error occurred');
  } finally {
    setIsLoading(false);
  }
};

export const fetchUserDetails = async (username: string, token?: string) => {
  console.log('Fetching user details for username:', username);
  console.log('Using API endpoint:', API_ENDPOINT);
  console.log('Token being sent:', token);

  // Extract email from username if it's an email, otherwise use username
  const identifier = username.includes('@') ? username : username;

  const requestBody = {
    operation: "getUser",
    identifier: identifier  // Changed from username to identifier
  };
  console.log('Request body:', JSON.stringify(requestBody));

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', JSON.stringify(response.headers));

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error response body:', errorBody);
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
  }
  const data = await response.json();
  console.log('User details fetched successfully:', JSON.stringify(data, null, 2));
  
  if (!data.data) {
    throw new Error('No user data returned from server');
  }
  
  return data.data; // Return only the data part
};
 
export const handleSignOut = async () => {
  try {
    await signOut({ global: true });
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    console.log('Sign out successful');
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
  navigateToConfirmSignUp: (email: string) => void
) => {
  const defaultName = 'jestruser';

  try {
    const userAttributes = {
      email,
      phone_number: '+1234567890', // Default phone number
      name: defaultName, // Default name
    };

    console.log('User attributes being sent:', userAttributes);

    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes,
      }
    });

    if (isSignUpComplete) {
      setIsSignedUp(true);
      setSignupSuccessModalVisible(true);

      // Automatically sign in the user after successful signup
      const { isSignedIn } = await signIn({
        username: email, // Use email here instead of username
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH'
        }
      });

      if (isSignedIn) {
        const authUser = await getCurrentUser();
        const user = convertAuthUserToUser(authUser);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.navigate('CompleteProfileScreen', { email });
      } else {
        console.log('Additional sign-in step required:', nextStep);
        Alert.alert('Login Incomplete', 'Please complete the additional step to sign in');
      }
    } else {
      console.log('Additional signup step required:', nextStep);

      if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigateToConfirmSignUp(email);
      } else {
        Alert.alert('Signup Incomplete', 'Please check your email for verification instructions');
      }
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    Alert.alert('Signup Failed', error.message || 'An unknown error occurred');
  }
};

export const handleCompleteProfile = async (
  email: string,
  username: string,
  displayName: string,
  profilePicAsset: ProfileImage | null,
  headerPicAsset: ProfileImage | null,
  bio: string,
  setSuccessModalVisible: (visible: boolean) => void,
  navigation: StackNavigationProp<RootStackParamList>
) => {
  try {
    const profilePicBase64 = profilePicAsset ? await fileToBase64(profilePicAsset) : null;
    const headerPicBase64 = headerPicAsset ? await fileToBase64(headerPicAsset) : null;
    const creationDate = new Date().toISOString();
    const userId = uuidv4();

    const profileData = {
      operation: 'completeProfile',
      email,
      username,
      displayName: displayName || null,
      profilePic: profilePicBase64,
      headerPic: headerPicBase64,
      bio,
      creationDate,
      userId,
    };
    console.log('Sending profile data:', JSON.stringify(profileData));

    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete profile');
    }

    const responseData = await response.json();
    if (responseData.data && responseData.data.email) {
      const user: User = {
        email: responseData.data.email,
        username: responseData.data.username,
        profilePic: responseData.data.profilePic || '',
        displayName: responseData.data.displayName || '',
        headerPic: responseData.data.headerPic || '',
        creationDate: responseData.data.creationDate || creationDate,
        followersCount: responseData.data.followersCount || 0,
        followingCount: responseData.data.followingCount || 0,
        bio: responseData.data.bio || '',
        userId: responseData.data.userId || userId,
      };
      console.log('Profile data being passed:', user);

      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update Zustand store
      useUserStore.getState().setUserDetails(user);

      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        navigation.navigate('Feed', { user });
      }, 3000);
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
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      return null;
    }
  }
  return null;
};


async function uriToAsset(uri: string): Promise<Asset> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return {
    uri,
    type: blob.type,
    name: uri.split('/').pop() || 'file',
  };
}

const convertAuthUserToUser = (authUser: any): User => {
  return {
    email: authUser.username,
    username: authUser.username,
    profilePic: '',
    displayName: '',
    headerPic: '',
    creationDate: new Date().toISOString(),
    followersCount: 0,
    followingCount: 0,
    bio: '',  // Add this line
  };
};

export const handleChangePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string,
  navigation: StackNavigationProp<RootStackParamList>
) => {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password: oldPassword });
    if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        const authUser = await getCurrentUser();
        const user = convertAuthUserToUser(authUser);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.navigate('Feed', { user });
      } else {
        throw new Error('Failed to change password');
      }
    } else {
      throw new Error('Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    Alert.alert('Password Change Failed', error.message || 'An unknown error occurred');
  }
};


  export const handleGoogleSignIn = async () => {
      // Implementation based on '@react-native-google-signin/google-signin'
  };

  export const handleAppleSignIn = async () => {
      // Implementation based on '@invertase/react-native-apple-authentication'
  };

  export const fetchAllUsers = async (): Promise<User[]> => {
    // Implement your API call here
    // For now, return an empty array
    return [];
  };

export const sendMessage = async (senderID: string, receiverID: string, content: string) => {
  try {
      console.log('Sending message from:', senderID, 'to:', receiverID);
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/sendMessage', {
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
      });

      const data = await response.json();

      if (!response.ok) {
          console.error('Server responded with an error:', data);
          throw new Error(data.message || 'Failed to send message');
      }

      console.log('Message sent successfully:', data);
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
  limit: number = 5
): Promise<FetchMemesResult> => {
  console.log(`Fetching ${type} memes for user: ${email}`);
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
      limit
    };

    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} memes. Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Raw API response:', JSON.stringify(responseData));

    // Check for the nested data structure
    const data = responseData.data && responseData.data.data ? responseData.data.data : responseData.data;

    if (!data || !Array.isArray(data.memes)) {
      console.error('Invalid data structure received:', responseData);
      return { memes: [], lastEvaluatedKey: null };
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
      }
    }));

    console.log(`Processed ${memes.length} memes`);

    return {
      memes,
      lastEvaluatedKey: data.lastEvaluatedKey || null
    };
  } catch (error) {
    console.error(`Error fetching ${type} memes:`, error);
    return { memes: [], lastEvaluatedKey: null };
  }
};

export const getUserMemes = async (email: string): Promise<FetchMemesResult> => {
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
    return { 
      memes: data.data,
      lastEvaluatedKey: data.LastEvaluatedKey || null
    };
  } catch (error) {
    console.error('Error fetching user memes:', error);
    return { memes: [], lastEvaluatedKey: null };
  }
};


export const removeFollow = async (unfollowerId: string, unfolloweeId: string): Promise<void> => {
  // Implementation
};

export const fetchConversations = async (userEmail: string) => {
  console.log('Fetching conversations for:', userEmail);
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getConversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getConversations',
        userID: userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Full API Response:', responseData);
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
      console.log("twit click")
      } catch (error) {
      }
  };

  export const fetchMessages = async (userID: string, conversationID: string) => {
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getMessages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'getMessages',
          userID,
          conversationID,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log('Fetched messages:', responseData);
  
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

  export const getAllUsers = async (): Promise<User[]> => {
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getAllUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'getAllUsers' }),
      });
  
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
          props: { backgroundColor: '#333', textColor: '#white' },
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

  export const checkFollowStatus = async (followerId: string, followeeId: string): Promise<{ isFollowing: boolean, canFollow: boolean }> => {
    if (!followerId || !followeeId) {
      console.error('Missing required parameters: followerId or followeeId');
      return { isFollowing: false, canFollow: false };
    }
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkFollowStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'checkFollowStatus',
          followerId,
          followeeId,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  };

  
  export const updateProfileImage = async (email: string, imageType: 'profile' | 'header', imagePath: string) => {
    try {
      console.log('Starting updateProfileImage');
      console.log('Email:', email);
      console.log('Image Type:', imageType);
      console.log('Image Path:', imagePath);
    
      const imageBase64 = await FileSystem.readAsStringAsync(imagePath, { encoding: FileSystem.EncodingType.Base64 });
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
  

  // In authFunctions.ts
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getUser',
        email: userId, // Assuming userId is an email
      }),
    });

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

// Add these new functions
export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getFollowing',
        userId: userId,  // Changed from userEmail to userId
      }),
    });

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
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getFollowers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getFollowers',
        userId: userId,  // Changed from userEmail to userId
      }),
    });

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
      email: userEmail,  // Add this line
    });

    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    const responseText = await response.text();
  
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, body: ${responseText}`);
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

export const recordMemeView = async (email: string, memeID: string): Promise<void> => {
  try {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/recordMemeView', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'recordMemeView',
        email,
        memeID,
      }),
    });
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to record meme view: ${responseText}`);
    }

    const data = JSON.parse(responseText);
  } catch (error) {
    console.error('Error recording meme view:', error);
    throw error;
  }
};