import {useState, useCallback} from 'react';
import {Alert, Linking} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {UserState} from '../../../stores/userStore';
import {updateProfileImage, fetchMemes} from '../../../services/userService';
import {Meme, FetchMemesResult} from '../../../types/types';
import {TabName} from './useProfileLogic';
import {useUserStore} from '../../../stores/userStore';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import {deleteMeme,getUserMemes,removeDownloadedMeme,} from '../../../services/memeService';

export const useProfileHandlers = (
  user: UserState,
  setTabMemes: React.Dispatch<React.SetStateAction<Meme[]>>,
  navigation: any,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  isLoading: boolean,
  setLastEvaluatedKey: React.Dispatch<React.SetStateAction<string | null>>,
  setHasMoreMemes: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedMeme: React.Dispatch<React.SetStateAction<Meme | null>>,
  setCurrentMemeIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsCommentFeedVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setFullScreenImage: React.Dispatch<React.SetStateAction<string | null>>,
  setIsBlurVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
) => {


  const handleUpdateImage = async (
    imagePath: string,
    type: 'profile' | 'header',
  ) => {
    setIsUploading(true);
    setFullScreenImage(null);
    setIsBlurVisible(true);
  
    try {
      const result = await updateProfileImage(user.email, type, imagePath);
     // console.log('Update profile image result:', JSON.stringify(result, null, 2));
  
      // Update Zustand store with the new image URL from the server
      useUserStore.getState().setUserDetails({
        [type + 'Pic']: result.data[type + 'Pic'],
      });
  
      Toast.show({
        type: 'success',
        text1: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } catch (error: unknown) {
      console.error(`Failed to update ${type} image:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        Toast.show({
          type: 'error',
          text1: `Failed to update ${type} image: ${error.message}`,
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      } else {
        console.error('Unknown error type:', typeof error);
        Toast.show({
          type: 'error',
          text1: `An unknown error occurred while updating the ${type} image`,
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
    } finally {
      setIsUploading(false);
      setIsBlurVisible(false);
    }
  };
  
  const handleEditImagePress = async (type: 'profile' | 'header') => {
   // console.log(`handleEditImagePress called for ${type}`);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to update your profile image. Would you like to open settings and grant permission?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return;
    }
  
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
      });
  
    //  console.log('ImagePicker result:', JSON.stringify(result, null, 2));
  
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
          {compress: 1, format: ImageManipulator.SaveFormat.JPEG},
        );
  
      //  console.log('Image manipulated:', JSON.stringify(manipResult, null, 2));
        handleUpdateImage(manipResult.uri, type);
      } else {
        console.log('Image selection cancelled or failed');
      }
    } catch (error) {
      console.error('ImagePicker Error: ', error);
    }
  };

  const onLikeStatusChange = (
    memeID: string,
    status: {liked: boolean; doubleLiked: boolean},
    newLikeCount?: number,
  ) => {
    setTabMemes(prevMemes =>
      prevMemes.map(meme =>
        meme.memeID === memeID
          ? {...meme, likeCount: newLikeCount || meme.likeCount}
          : meme,
      ),
    );
  };

  const handleBioUpdate = (newBio: string) => {
    useUserStore.getState().setUserDetails({bio: newBio});
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

  //need to find caching strategy for profile tab meme fetching
  const fetchTabMemes = useCallback(
    async (tab: TabName, page: number = 1, pageSize: number = 30) => {
      if (!user.email || isLoading) {
      //  console.log('Skipping fetch: no user email or already loading');
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
            result = {memes: [], lastEvaluatedKey: null};
        }
      //  console.log(`Fetched ${result.memes.length} memes for ${tab} tab`);
        setTabMemes(result.memes);
        setLastEvaluatedKey(result.lastEvaluatedKey);
        setHasMoreMemes(result.memes.length === pageSize);
      } catch (error) {
        console.error(`Error fetching ${tab} memes:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      user.email,
      isLoading,
      setTabMemes,
      setLastEvaluatedKey,
      setHasMoreMemes,
      setIsLoading,
    ],
  );
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
    Alert.alert('Delete Meme', 'Are you sure you want to delete this meme?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteMeme(memeID, user.email);
            setTabMemes(prevMemes =>
              prevMemes.filter(meme => meme.memeID !== memeID),
            );
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
        },
      },
    ]);
  };

  const handleRemoveDownloadedMeme = async (memeID: string) => {
    try {
      await removeDownloadedMeme(user.email, memeID);
      setTabMemes(prevMemes =>
        prevMemes.filter(meme => meme.memeID !== memeID),
      );
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
    setFullScreenImage,
    setIsBlurVisible,
    handleShareProfile,
  };
};
