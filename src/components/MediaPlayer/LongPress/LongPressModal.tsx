// LongPressModal.tsx

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './LongPress.styles';

interface LongPressModalProps {
  isVisible: boolean;
  onClose: () => void;
  meme: {
    id: string;
    url: string;
  };
  onSaveToProfile: () => Promise<void>;
  onReport: () => void;
  onFavorite?: () => void; // Optional prop
}

export const LongPressModal: React.FC<LongPressModalProps> = ({
  isVisible,
  onClose,
  meme,
  onSaveToProfile,
  onReport,
  onFavorite, // Optional prop
}) => {
  const scale = React.useRef(new Animated.Value(0)).current;

  const ensureMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    try {
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
    } catch (error) {
      console.error('Permission Error:', error);
      return false;
    }
  }, []);

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

  const copyLink = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(`https://jestr.com/meme/${meme.id}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Link Copied',
        text2: 'Send that sucker out ;)',
      });
      onClose();
    } catch (error) {
      console.error('Copy Link Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Copy Failed',
        text2: 'Unable to copy link.',
      });
    }
  }, [meme.id, onClose]);

  const downloadImage = useCallback(async (url: string): Promise<string | null> => {
    try {
      const fileName = url.substring(url.lastIndexOf('/') + 1);
      const directoryUri = `${FileSystem.cacheDirectory}Memes/`;

      const dirInfo = await FileSystem.getInfoAsync(directoryUri);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
      }

      const fileUri = `${directoryUri}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      return uri;
    } catch (error) {
      console.error('Download Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Failed to download file.',
      });
      return null;
    }
  }, []);

  const saveToGallery = useCallback(async () => {
    try {
      const hasPermission = await ensureMediaLibraryPermission();
      if (!hasPermission) return;

      const localUri = await downloadImage(meme.url);
      if (localUri) {
        const asset = await MediaLibrary.createAssetAsync(localUri);
        try {
          await MediaLibrary.createAlbumAsync('Jestr', asset, false);
        } catch (albumError) {
          console.warn('Album Creation Error:', albumError);
        }

        Toast.show({
          type: 'success',
          text1: 'Image Saved',
          text2: 'Successfully saved image to gallery!',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.log('Invalid Local URI');
      }
    } catch (error) {
      console.error('Save to Gallery Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save image to gallery.',
      });
    } finally {
      onClose();
    }
  }, [ensureMediaLibraryPermission, downloadImage, meme.url, onClose]);

  const handleSaveToProfile = useCallback(async () => {
    try {
      await onSaveToProfile();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Toast.show({
        type: 'success',
        text1: 'Meme Saved',
        text2: 'Saved image your profile gallery.',
      });
    } catch (error) {
      console.error('Save to Profile Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save meme to profile.',
      });
    } finally {
      onClose();
    }
  }, [onSaveToProfile, onClose]);

  const options = [
    {
      iconName: 'link-outline',
      text: 'Copy Link',
      onPress: copyLink,
      color: '#4A90E2', 
    },
    {
      iconName: 'bookmark-outline',
      text: 'Bookmark',
      onPress: handleSaveToProfile,
      color: '#FFA500', 
    },
    {
      iconName: 'download-outline',
      text: 'Download',
      onPress: saveToGallery,
      color: '#50C878', 
    },
    {
      iconName: 'flag-outline',
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
        onPress={option.onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={option.iconName as keyof typeof Ionicons.glyphMap} size={28} color={option.color} />
        </View>
        <Text style={styles.optionText}>{option.text}</Text>
      </TouchableOpacity>
    ));

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={90} style={styles.blurView} tint="dark">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modalContainer, { transform: [{ scale }] }]}>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </BlurView>
    </View>
  );
};
