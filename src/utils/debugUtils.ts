// Add this to a utility file, e.g., utils/debugUtils.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../stores/userStore';

export const logStorageContents = async () => {
  // Log AsyncStorage contents
  console.log('AsyncStorage contents:');
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  for (const key of asyncStorageKeys) {
    const value = await AsyncStorage.getItem(key);
    console.log(`${key}: ${value}`);
  }

  // Log Zustand store contents
  console.log('Zustand store contents:');
  console.log(JSON.stringify(useUserStore.getState(), null, 2));

  // Log SecureStore contents
  console.log('SecureStore contents:');
  const secureStoreKeys = ['accessToken', 'userIdentifier']; // Add any other keys you're using
  for (const key of secureStoreKeys) {
    const value = await SecureStore.getItemAsync(key);
    console.log(`${key}: ${value ? 'exists' : 'does not exist'}`);
  }
};