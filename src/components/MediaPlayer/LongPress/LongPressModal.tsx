import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, TouchableWithoutFeedback, Alert, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faSave, faShare, faFlag, faUser } from '@fortawesome/free-solid-svg-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { styles } from './LongPress.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LongPressModalProps {
  isVisible: boolean;
  onClose: () => void;
  meme: {
    id: string;
    url: string;
  };
  onSaveToProfile: () => Promise<void>;
  onShare: () => void;
  onReport: () => void;
  user: any;
  memeID: string;
  isSaved: boolean;
  setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setCounts: React.Dispatch<
    React.SetStateAction<{
      likes: number;
      downloads: number;
      shares: number;
      comments: number;
    }>
  >;
}

export const LongPressModal: React.FC<LongPressModalProps> = ({
  isVisible,
  onClose,
  meme,
  onSaveToProfile,
  onShare,
  onReport,
}) => {
  const scale = React.useRef(new Animated.Value(0)).current;

  const ensureMediaLibraryPermission = async () => {
    const mediaPermission = await AsyncStorage.getItem('mediaPermission');
    if (mediaPermission !== 'granted') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This app needs access to your media library to save images. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      } else {
        await AsyncStorage.setItem('mediaPermission', 'granted');
      }
    }
    return true;
  };

  useEffect(() => {
    if (isVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start(() => {
        onClose();
      });
    }
  }, [isVisible, scale, onClose]);

  const copyLink = async () => {
    await Clipboard.setStringAsync(`https://jestr.com/meme/${meme.id}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Link Copied',
      text2: 'Meme link copied to clipboard',
    });
    onClose();
  };

  const downloadImage = async (url: string): Promise<string | null> => {
    try {
      const fileName = url.substring(url.lastIndexOf('/') + 1);
   //   console.log('fileName:', fileName);
      // Set the directory to include the 'Memes' subdirectory
      const directoryUri = `${FileSystem.cacheDirectory}Memes/`;
   //   console.log('directoryUri:', directoryUri);
  
      // Check if the directory exists
      const dirInfo = await FileSystem.getInfoAsync(directoryUri);
      if (!dirInfo.exists) {
        // Create the directory if it doesn't exist
        await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
      }
  
      // Construct the file URI
      const fileUri = `${directoryUri}${fileName}`;
  //    console.log('fileUri:', fileUri);
      // Proceed with downloading the image
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      return uri;
    } catch (error) {
      console.error('Error downloading file:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to download file.',
      });
      return null;
    }
  };
  

  const saveToGallery = async () => {
    try {
      const hasPermission = await ensureMediaLibraryPermission();
   //   console.log('Permission:', hasPermission);
      if (!hasPermission) {
        return;
      }
  
      const localUri = await downloadImage(meme.url);
   //   console.log('Local URI:', localUri);
      if (localUri) {
        const asset = await MediaLibrary.createAssetAsync(localUri);
  
        // Attempt to create an album named 'Jestr' and add the asset to it
        try {
          await MediaLibrary.createAlbumAsync('Jestr', asset, false);
        } catch (albumError) {
          console.warn('Could not create album, but image was saved:', albumError);
        }
  
        Toast.show({
          type: 'success',
          text1: 'Image Saved',
          text2: 'Successfully saved image to gallery!',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.log('Local URI is not OK:');
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save image to gallery.',
      });
    } finally {
      onClose();
    }
  };
  

  const handleSaveToProfile = async () => {
    try {
      await onSaveToProfile();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Toast.show({
        type: 'success',
        text1: 'Meme Saved',
        text2: 'Saved image to your gallery inside your profile',
      });
    } catch (error) {
      console.error('Error saving meme to profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save meme to profile',
      });
    }
    onClose();
  };

  const options = [
    {
      icon: faLink,
      text: 'Copy Link',
      onPress: copyLink,
      color: '#4A90E2',
    },
    {
      icon: faUser,
      text: 'Save to Profile',
      onPress: handleSaveToProfile,
      color: '#9370DB',
    },
    {
      icon: faSave,
      text: 'Save to Gallery',
      onPress: saveToGallery,
      color: '#50C878',
    },
    {
      icon: faShare,
      text: 'Share',
      onPress: onShare,
      color: '#FF69B4',
    },
    {
      icon: faFlag,
      text: 'Report',
      onPress: onReport,
      color: '#FF6347',
    },
  ];

  const renderOptions = () =>
    options.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={styles.option}
        onPress={option.onPress}>
        <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
          <FontAwesomeIcon icon={option.icon} size={24} color="#fff" />
        </View>
        <Text style={styles.optionText}>{option.text}</Text>
      </TouchableOpacity>
    ));

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.container}>
            <Animated.View
              style={[styles.modalContainer, { transform: [{ scale }] }]}>
              <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.memePreview}>
                  <Image
                    source={{ uri: meme.url }}
                    style={styles.memeImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableWithoutFeedback>
              <View style={styles.optionsContainer}>{renderOptions()}</View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </BlurView>
    </View>
  );
};
