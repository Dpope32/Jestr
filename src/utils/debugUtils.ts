import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../stores/userStore';
import { useFollowStore } from '../stores/followStore';
import { useInboxStore } from '../stores/inboxStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSettingsStore } from '../stores/settingsStore';

export const logStorageContents = async () => {
 // console.log('AsyncStorage contents:');
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  for (const key of asyncStorageKeys) {
    if (!key.includes('cachedMemes') && !key.includes('@MemoryStorage:CognitoIdentityServiceProvider')) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }
  }

  console.log('Zustand store contents:');
  logStoreContents('user');
 // logStoreContents('follow');
 // logStoreContents('inbox');
 // logStoreContents('notification');
  //logStoreContents('settings');

//  console.log('SecureStore contents:');
  const secureStoreKeys = ['accessToken', 'userIdentifier', 'refreshToken', 'idToken'];
  for (const key of secureStoreKeys) {
    const value = await SecureStore.getItemAsync(key);
    console.log(`${key}: ${value ? 'exists' : 'does not exist'}`);
  }
};

const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      return `Error stringifying: ${error.message}`;
    } else {
      return `Error stringifying: Unknown error`;
    }
  }
};

export const logStoreContents = (storeName: string) => {
  const stores = {
    user: useUserStore,
    follow: useFollowStore,
    inbox: useInboxStore,
    notification: useNotificationStore,
    settings: useSettingsStore,
  };
  if (storeName in stores) {
    console.log(`${storeName}Store:`, safeStringify((stores[storeName as keyof typeof stores]).getState()));
  } else {
    console.log(`Store "${storeName}" not found.`);
  }
};