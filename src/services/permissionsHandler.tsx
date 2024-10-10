// src/services/permissionsHandler.tsx

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import PushNotificationManager from './PushNotificationManager'; // Import the manager

const PermissionsHandler = () => {
  const requestPermissions = async () => {
    // Push Notifications
    const storedNotificationPermission = await AsyncStorage.getItem('notificationsPermission');
    if (storedNotificationPermission !== 'granted') {
      const pushToken = await PushNotificationManager.registerForPushNotificationsAsync();
      if (!pushToken) {
        // Handle permission denial if necessary
      } else {
        // Optionally, send this token to your backend server here
      }
    }

    // Media Library
    const storedMediaPermission = await AsyncStorage.getItem('mediaPermission');
    if (storedMediaPermission !== 'granted') {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert("Media Permission Needed", "We need access to your media library to pick images.", [{ text: "OK" }]);
        await AsyncStorage.setItem('mediaPermission', 'denied');
      } else {
        await AsyncStorage.setItem('mediaPermission', 'granted');
      }
    }

    // Camera
    const storedCameraPermission = await AsyncStorage.getItem('cameraPermission');
    if (storedCameraPermission !== 'granted') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert("Camera Permission Needed", "We need access to your camera to take photos.", [{ text: "OK" }]);
        await AsyncStorage.setItem('cameraPermission', 'denied');
      } else {
        await AsyncStorage.setItem('cameraPermission', 'granted');
      }
    }

    // Location
    const storedLocationPermission = await AsyncStorage.getItem('locationPermission');
    if (storedLocationPermission !== 'granted') {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert("Location Permission Needed", "We need access to your location for better services.", [{ text: "OK" }]);
        await AsyncStorage.setItem('locationPermission', 'denied');
      } else {
        await AsyncStorage.setItem('locationPermission', 'granted');
      }
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  return null; // This component does not render anything
};

export default PermissionsHandler;
