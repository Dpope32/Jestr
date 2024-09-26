import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const PermissionsHandler = () => {
  const requestPermissions = async () => {
    // Check for stored notification permission status
    const storedNotificationPermission = await AsyncStorage.getItem('notificationsPermission');
    if (storedNotificationPermission !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied!", "You need to allow notifications to use this feature.", [{ text: "OK" }]);
        await AsyncStorage.setItem('notificationsPermission', 'denied');
      } else {
        await AsyncStorage.setItem('notificationsPermission', 'granted');
      }
    }

    // Check for stored media permission status
    const storedMediaPermission = await AsyncStorage.getItem('mediaPermission');
    if (storedMediaPermission !== 'granted') {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert("Media permission needed", "We need access to your media library to pick images.", [{ text: "OK" }]);
        await AsyncStorage.setItem('mediaPermission', 'denied');
      } else {
        await AsyncStorage.setItem('mediaPermission', 'granted');
      }
    }

    // Check for stored camera permission status
    const storedCameraPermission = await AsyncStorage.getItem('cameraPermission');
    if (storedCameraPermission !== 'granted') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert("Camera permission needed", "We need access to your camera to take photos.", [{ text: "OK" }]);
        await AsyncStorage.setItem('cameraPermission', 'denied');
      } else {
        await AsyncStorage.setItem('cameraPermission', 'granted');
      }
    }

    // Check for stored location permission status
    const storedLocationPermission = await AsyncStorage.getItem('locationPermission');
    if (storedLocationPermission !== 'granted') {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert("Location permission needed", "We need access to your location for better services.", [{ text: "OK" }]);
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