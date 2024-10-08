// src/hooks/useImagePicker.tsx

import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileImage } from '../types/types';

const useImagePicker = () => {
  const pickImage = async (type: 'header' | 'profile'): Promise<ProfileImage | null> => {
    const storedPermission = await AsyncStorage.getItem('mediaPermission');

    // Request permission if not previously granted
    if (storedPermission !== 'granted') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos.');
        await AsyncStorage.setItem('mediaPermission', 'denied');
        return null;
      }
      await AsyncStorage.setItem('mediaPermission', 'granted');
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'header' ? [16, 9] : [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset: ProfileImage = {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: result.assets[0].type,
          fileName: result.assets[0].fileName,
          fileSize: result.assets[0].fileSize,
        };
        return selectedAsset;
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
    return null;
  };

  return { pickImage };
};

export default useImagePicker;
