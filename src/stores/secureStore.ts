// src/utils/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export const storeToken = async (key: string, value: string | undefined) => {
  try {
    if (typeof value !== 'string') {
      console.error('Invalid token type:', typeof value);
      return;
    }
    console.log(`Storing token for key ${key}:`, value.substring(0, 10) + '...');
    await SecureStore.setItemAsync(key, value);
    console.log(`Token stored successfully for key ${key}`);
  } catch (error) {
    console.error(`Error storing the token for key ${key}:`, error);
  }
};

export const getToken = async (key: string) => {
  try {
    const token = await SecureStore.getItemAsync(key);
    console.log(`Retrieved token for key ${key}:`, token ? token.substring(0, 10) + '...' : 'No token found');
    return token;
  } catch (error) {
    console.error(`Error retrieving the token for key ${key}:`, error);
    return null;
  }
};

// In secureStore.ts

export const storeUserIdentifier = async (identifier: string) => {
  try {
    await SecureStore.setItemAsync('userIdentifier', identifier);
  } catch (error) {
    console.error('Error storing user identifier', error);
  }
};

export const getUserIdentifier = async () => {
  try {
    const identifier = await SecureStore.getItemAsync('userIdentifier');
    console.log('Retrieved user identifier:', identifier ? 'Identifier exists' : 'No identifier found');
    return identifier;
  } catch (error) {
    console.error('Error retrieving user identifier', error);
    return null;
  }
};

export const removeUserIdentifier = async () => {
  try {
    await SecureStore.deleteItemAsync('userIdentifier');
  } catch (error) {
    console.error('Error removing user identifier', error);
  }
};

export const removeToken = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing the token', error);
  }
};

export const storePushToken = async (token: string) => {
  await storeToken('pushToken', token);
};

export const getPushToken = async () => {
  return await getToken('pushToken');
};

export const removePushToken = async () => {
  await removeToken('pushToken');
};