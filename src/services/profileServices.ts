import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {User} from '../types/types';
import {fetchAuthSession} from '@aws-amplify/auth';
import { ProfileImage} from '../types/types';
import * as FileSystem from 'expo-file-system';
import {v4 as uuidv4} from 'uuid';
import {useUserStore} from '../stores/userStore';
import {storeUserIdentifier} from '../stores/secureStore';
import * as SecureStore from 'expo-secure-store';
import * as ImageManipulator from 'expo-image-manipulator';
import {useSettingsStore} from '../stores/settingsStore';
import {useNotificationStore} from '../stores/notificationStore';

export const handleCompleteProfile = async (
    email: string,
    username: string,
    displayName: string,
    profilePicAsset: ProfileImage | null,
    headerPicAsset: ProfileImage | null,
    bio: string,
    setSuccessModalVisible: (visible: boolean) => void,
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
  
      let accessToken = await SecureStore.getItemAsync('accessToken');
      //console.log( 'Retrieved access token:', accessToken ? 'Token exists' : 'No token',);
  
      if (!accessToken) {
      //  console.log('No access token found, attempting to fetch a new session');
        const {tokens} = await fetchAuthSession();
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
  
    //  console.log('Sending profile data to API');
      const response = await fetch(
        'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
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
     // console.log('Profile data updated successfully');
    //  console.log('API response:', responseData);
      // console.log('Response data:', responseData);
  
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
        //  console.log('Token stored successfully');
        } else {
          const {tokens} = await fetchAuthSession();
          const accessToken = tokens?.accessToken?.toString();
          if (accessToken) {
            await SecureStore.setItemAsync('accessToken', accessToken);
       //     console.log('Token stored successfully from session');
          } else {
            console.warn('No access token available to store');
          }
        }
  
        // Store user identifier in SecureStore
        await storeUserIdentifier(user.email);
  
        setSuccessModalVisible(true);
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