import { useState, useCallback } from 'react';
import { Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { UserState } from '../../utils/userStore';
import { updateProfileImage, fetchMemes } from '../../services/userService';
import { Meme, FetchMemesResult } from '../../types/types';
import { TabName } from './Profile';
import {useUserStore} from '../../utils/userStore';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { deleteMeme, getUserMemes, removeDownloadedMeme } from 'services/memeService';

export const useProfileHandlers = (
  user: UserState,
  setTabMemes: React.Dispatch<React.SetStateAction<Meme[]>>,
  navigation: any,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLastEvaluatedKey: React.Dispatch<React.SetStateAction<string | null>>,
  setHasMoreMemes: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedMeme: React.Dispatch<React.SetStateAction<Meme | null>>,
  setCurrentMemeIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsCommentFeedVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [isLoading, setIsUploading] = useState(false);

  const handleUpdateImage = async (imagePath: string, type: 'profile' | 'header') => {
    setIsLoading(true);
    try {
      const result = await updateProfileImage(user.email, type, imagePath);
      console.log('Update profile image result:', JSON.stringify(result, null, 2));
      
      // Close the full-screen image view
      setFullScreenImage(null);
      setIsBlurVisible(false);
  
      // Update Zustand store with the new image URL from the server
      useUserStore.getState().setUserDetails({
        [type + 'Pic']: result.data[type + 'Pic']
      });
  
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
  
    } catch (error: unknown) {
      console.error('Failed to update image:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        Toast.show({
          type: 'error',
          text1: `Failed to update profile image: ${error.message}`,
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      } else {
        console.error('Unknown error type:', typeof error);
        Toast.show({
          type: 'error',
          text1: 'An unknown error occurred while updating the profile image',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImagePress = async (type: 'profile' | 'header') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        const manipResult = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [
            {
              resize: {
                width: type === 'profile' ? 300 : 1000,
                height: type === 'profile' ? 300 : 300,
              },
            },
          ],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        handleUpdateImage(manipResult.uri, type);
      }
    } catch (error) {
      console.log('ImagePicker Error: ', error);
    }
  };


  const onLikeStatusChange = (memeID: string, status: { liked: boolean; doubleLiked: boolean }, newLikeCount?: number) => {
    setTabMemes(prevMemes =>
      prevMemes.map(meme =>
        meme.memeID === memeID
          ? { ...meme, likeCount: newLikeCount || meme.likeCount }
          : meme
      )
    );
  };

  const handleBioUpdate = (newBio: string) => {
    useUserStore.getState().setUserDetails({ bio: newBio });
  };

  const handleHeightChange = (height: number) => {
    // todo
  };

  const handleCloseMediaPlayer = () => {
    setSelectedMeme(null);
    setCurrentMemeIndex(0);
  };

  const loadMoreMemes = () => {
    // todo?
  };

  const handleShareProfile = async () => {
    const profileLink = `exp://YOUR_EXPO_PROJECT_SLUG.exp.direct/--/profile/${user.username}`;
    await Clipboard.setStringAsync(profileLink);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Profile link copied',
      text2: 'Profile link copied to clipboard',
    });
  };

  const fetchTabMemes = useCallback(async (tab: TabName, page: number = 1, pageSize: number = 30) => {
    if (!user.email || isLoading) {
      console.log('Skipping fetch: no user email or already loading');
      return;
    }
  
    setIsLoading(true);
    try {
      let result: FetchMemesResult;
      switch (tab) {
        case 'posts':
          result = await getUserMemes(user.email);
          break;
        case 'liked':
          result = await fetchMemes(user.email, 'liked', null, pageSize);
          break;
        case 'history':
          result = await fetchMemes(user.email, 'viewed', null, pageSize);
          break;
        case 'downloaded':
          result = await fetchMemes(user.email, 'downloaded', null, pageSize);
          break;
        default:
          result = { memes: [], lastEvaluatedKey: null };
      }
      console.log(`Fetched ${result.memes.length} memes for ${tab} tab`);
      setTabMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setHasMoreMemes(result.memes.length === pageSize);
    } catch (error) {
      console.error(`Error fetching ${tab} memes:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [user.email, isLoading, setTabMemes, setLastEvaluatedKey, setHasMoreMemes, setIsLoading]);
  const handleMemePress = (meme: Meme, index: number) => {
    setSelectedMeme({
      ...meme,
      liked: meme.liked || false,
      doubleLiked: meme.doubleLiked || false,
      downloaded: meme.downloaded || false,
    });
    setCurrentMemeIndex(index);
    setIsCommentFeedVisible(false);
  };


  const handleDeleteMeme = async (memeID: string) => {
    Alert.alert(
      "Delete Meme",
      "Are you sure you want to delete this meme?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await deleteMeme(memeID, user.email);
              setTabMemes(prevMemes => prevMemes.filter(meme => meme.memeID !== memeID));
              setSelectedMeme(null);
              Toast.show({
                type: 'success',
                text1: 'Meme deleted successfully!',
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
              });
            } catch (error) {
              console.error('Failed to delete meme:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete meme',
                visibilityTime: 2000,
                autoHide: true,
                topOffset: 30,
                bottomOffset: 40,
              });
            }
          }
        }
      ]
    );
  };

  const handleRemoveDownloadedMeme = async (memeID: string) => {
    try {
      await removeDownloadedMeme(user.email, memeID);
      setTabMemes(prevMemes => prevMemes.filter(meme => meme.memeID !== memeID));
      Toast.show({
        type: 'success',
        text1: 'Meme removed from gallery!',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } catch (error) {
      console.error('Failed to remove downloaded meme:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to remove meme from gallery',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  };

  const handleSettingsClick = () => {
    navigation.navigate('Settings');
  };

  return {
    handleUpdateImage,
    handleEditImagePress,
    onLikeStatusChange,
    handleBioUpdate,
    handleHeightChange,
    handleCloseMediaPlayer,
    loadMoreMemes,
    fetchTabMemes,
    handleMemePress,
    handleDeleteMeme,
    handleRemoveDownloadedMeme,
    handleSettingsClick,
    fullScreenImage,
    setFullScreenImage,
    isBlurVisible,
    setIsBlurVisible,
    handleShareProfile,
  };
};