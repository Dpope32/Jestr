  
  import 'react-native-get-random-values';
  import 'react-native-url-polyfill/auto';
  import {API_URL} from './config';
  import Toast from 'react-native-toast-message';
  import {StackNavigationProp} from '@react-navigation/stack';
  import {User, Meme, FetchMemesResult} from '../types/types';
  import {fetchAuthSession} from '@aws-amplify/auth';
  import {RootStackParamList, ProfileImage} from '../types/types';
  import * as FileSystem from 'expo-file-system';
  import {v4 as uuidv4} from 'uuid';
  import { useUserStore, UserState } from '../stores/userStore'; // Adjust the import path as needed
  import {storeUserIdentifier} from '../stores/secureStore';
  import * as SecureStore from 'expo-secure-store';
  import * as ImageManipulator from 'expo-image-manipulator';
  //import * as Google from 'expo-auth-session/providers/google';
  import { getUserMemes } from './memeService';
  import { useSettingsStore } from '../stores/settingsStore';
  import { useNotificationStore } from '../stores/notificationStore';
  
  
  const API_ENDPOINT =
  'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser';

  export const getUser = async (userEmail: string): Promise<User | null> => {
    console.log('getUser called with userEmail:', userEmail);
    try {
      const requestBody = JSON.stringify({
        operation: 'getUser',
        identifier: userEmail, // Changed from 'email' to 'identifier'
      });
      
      console.log('Sending request to getUser API with body:', requestBody);
      
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
      console.log('Received response from getUser API:', responseText);
      
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
      console.log('Processed user data:', data.data);
      return data.data || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };


  //adjusted to use the user store details if available, otherwise fetch from API, Singificantly reduces API calls and speeds up load times
  export const fetchUserDetails = async (identifier: string, token?: string): Promise<UserState> => {
    // Get the current user state from the store
    const currentUserState = useUserStore.getState();
    
    // Check if the current user state is not empty and matches the identifier
    if (!isEmptyUserState(currentUserState) && (currentUserState.email === identifier || currentUserState.userId === identifier)) {
      console.log('Using user details from store');
      return currentUserState;
    }
  
    console.log('Fetching user details from API for identifier:', identifier);
  
    const requestBody = {
      operation: 'getUser',
      identifier: identifier,
    };
  
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
  
      const data = await response.json();
  
      if (!data.data) {
        throw new Error('No user data returned from server');
      }
  
      // Update the user store with the new data
      useUserStore.getState().setUserDetails(data.data);
  
      return data.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  };
  
  export const isEmptyUserState = (state: UserState): boolean => {
    return (
      !state.email &&
      !state.username &&
      !state.displayName &&
      !state.bio &&
      !state.creationDate &&
      state.followersCount === 0 &&
      state.followingCount === 0 &&
      !state.profilePic &&
      !state.headerPic &&
      !state.userId
    );
  }
  
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
      // Compress and convert images to base64
      const profilePicBase64 = profilePicAsset
        ? await fileToBase64(await compressImage(profilePicAsset))
        : null;
      const headerPicBase64 = headerPicAsset
        ? await fileToBase64(await compressImage(headerPicAsset))
        : null;
  
      // Get the current access token
      let accessToken = await SecureStore.getItemAsync('accessToken');
      console.log('Retrieved access token:', accessToken ? 'Token exists' : 'No token');
  
      if (!accessToken) {
        console.log('No access token found, attempting to fetch a new session');
        const { tokens } = await fetchAuthSession();
        const newAccessToken = tokens?.accessToken?.toString();
        if (newAccessToken) {
          accessToken = newAccessToken;
          await SecureStore.setItemAsync('accessToken', newAccessToken);
        } else {
          throw new Error('Unable to obtain access token');
        }
      }
  
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
  
      console.log('Sending profile data to API');
      const response = await fetch(
        'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profileData),
        },
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response not OK:', response.status, errorData);
        throw new Error(`API error: ${errorData.message || response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log('API response:', responseData);
  
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
        };
  
        useUserStore.getState().setUserDetails({
          email: responseData.data.email,
          username: responseData.data.username,
          displayName: responseData.data.displayName,
          profilePic: responseData.data.profilePic,
          headerPic: responseData.data.headerPic,
          bio: responseData.data.bio,
          creationDate: responseData.data.CreationDate,
          followersCount: responseData.data.followersCount,
          followingCount: responseData.data.followingCount, 
          darkMode: responseData.data.darkMode,
          userId: responseData.data.userId,
        });

        // Update settingsStore
        useSettingsStore.getState().updatePrivacySafety({
          likesPublic: user.likesPublic,
        });

        useNotificationStore.getState().setNotificationPreferences({
          pushEnabled: responseData.data.notificationsEnabled,
          emailEnabled: responseData.data.notificationsEnabled,
          inAppEnabled: responseData.data.notificationsEnabled,
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
                userEmail: user.email,
                username: user.username,
                displayName: user.displayName,
                profilePic: user.profilePic,
                bio: user.bio,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                userId: user.userId,
                darkMode: user.darkMode,
                likesPublic: user.likesPublic,
                notificationsEnabled: responseData.data.notificationsEnabled,
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

  export const updateProfileImage = async (
    email: string,
    imageType: 'profile' | 'header',
    imagePath: string,
  ) => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
  
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
            'Authorization': `Bearer ${accessToken}`,
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

  export const updateBio = async (userEmail: string, bio: string, onBioUpdate: (bio: string) => void, setIsEditing: (isEditing: boolean) => void) => {
    const requestBody = {
      operation: 'updateBio',
      email: userEmail,
      bio: bio,
    };
  
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateBio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        if (responseData.data && responseData.data.data && responseData.data.data.updatedBio) {
          onBioUpdate(responseData.data.data.updatedBio);
          setIsEditing(false);
  
          Toast.show({
            type: 'success',
            text1: 'Bio updated successfully!',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            props: { backgroundColor: '#333', textColor: '#00ff00' },
          });
        } else {
          console.error('Unexpected response structure:', responseData);
        }
      } else {
        console.error('Failed to update bio. Server response:', responseData);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };
  
  export const updateUserProfile = async (user: User): Promise<User> => {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateUserProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
  
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
  
    return response.json();
  };
  
  export const getTotalUsers = async (): Promise<number> => {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getTotalUsers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to get total users');
    }
  
    const data = await response.json();
    return data.totalUsers;
  };
  
  export const getUserGrowthRate = async (): Promise<number> => {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUserGrowthRate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to get user growth rate');
    }
  
    const data = await response.json();
    return data.growthRate;
  };
  
  export const getDAU = async (): Promise<number> => {
    const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getDAU', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to get DAU');
    }
  
    const data = await response.json();
    return data.dau;
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
       console.log('Raw API response:', JSON.stringify(responseData));
  
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
  
        console.log(`Processed ${memes.length} memes`);
  
      return {
        memes,
        lastEvaluatedKey: data.lastEvaluatedKey || null,
      };
    } catch (error) {
      console.error(`Error fetching ${type} memes:`, error);
      return {memes: [], lastEvaluatedKey: null};
    }
  };

  export const fetchTabMemes = async (
    tab: 'posts' | 'liked' | 'history' | 'downloaded',
    page: number = 1,
    pageSize: number = 30,
    userEmail: string,
    lastEvaluatedKey: string | null,
  ): Promise<FetchMemesResult> => {
    try {
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
  
  //HELPER FUNCTIONS

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