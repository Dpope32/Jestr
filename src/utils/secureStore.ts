// src/utils/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export const storeToken = async (key: string, value: string) => {
  try {
    console.log('Storing token:', value);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await SecureStore.setItemAsync(key, stringValue);
  } catch (error) {
    console.error('Error storing the token', error);
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

export const getToken = async (key: string) => {
  try {
    const token = await SecureStore.getItemAsync(key);
    console.log(`Retrieved token for key ${key}:`, token ? 'Token exists' : 'No token found');
    return token;
  } catch (error) {
    console.error('Error retrieving the token', error);
    return null;
  }
};

export const removeToken = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing the token', error);
  }
};