// src/screens/CompleteProfileScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, ActivityIndicator } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { Keyboard } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/core';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMoon, faHeart, faBell } from '@fortawesome/free-solid-svg-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileImage } from '../../../types/types';
import HeaderPicUpload from '../../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../../components/Upload/ProfilePicUpload';
import InputField from '../../../components/Input/InputField';
import { handleCompleteProfile } from '../../../services/profileServices';
import { useUserStore } from '../../../stores/userStore';
import { useTheme } from '../../../theme/ThemeContext';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { CompleteProfileNavRouteProp } from '../../../navigation/NavTypes/AuthStackTypes';
import PushNotificationManager from '../../../services/PushNotificationManager'; // Import the manager
import useImagePicker from '../../../utils/useImagePicker'; // Custom hook for image picking
import { styles } from './CompleteProfileStyles'; // Import the styles

const CompleteProfileScreen: React.FC = () => {
  const route = useRoute<CompleteProfileNavRouteProp>();
  const navigation = useNavigation();

  const { headerPic, profilePic, bio, setBio, setDarkMode } = useUserStore();
  const { privacySafety, updatePrivacySafety } = useSettingsStore();
  const { pushEnabled, setNotificationPreferences } = useNotificationStore();

  const email = route.params?.email;
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkModeLocal] = useState(isDarkMode);
  const [isPushEnabled, setIsPushEnabled] = useState(pushEnabled);

  const { pickImage } = useImagePicker(); // Use the custom hook

  useEffect(() => {
    const checkMediaPermission = async () => {
      const storedPermission = await AsyncStorage.getItem('mediaPermission');

      if (storedPermission !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Please grant permission to access your photos.',
          );
          await AsyncStorage.setItem('mediaPermission', 'denied');
        } else {
          await AsyncStorage.setItem('mediaPermission', 'granted');
        }
      }
    };

    checkMediaPermission();
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkModeLocal(newMode);
    toggleDarkMode();
    setDarkMode?.(newMode);
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    setIsPushEnabled(value);
    setNotificationPreferences({ pushEnabled: value });

    if (value) {
      // Register for push notifications
      const pushToken = await PushNotificationManager.registerForPushNotificationsAsync();
      if (pushToken) {
        // Optionally, send the pushToken to your backend server here
        console.log('Push Token:', pushToken);
      } else {
        Alert.alert(
          'Push Notifications',
          'Failed to register for push notifications. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } else {
      // Unregister from push notifications
      await PushNotificationManager.unregisterPushNotificationsAsync();
      // Optionally, notify your backend server to disable push notifications for this user
      console.log('Push notifications have been disabled.');
    }
  };

  const handleImagePick = useCallback(async (type: 'header' | 'profile') => {
    const selectedAsset = await pickImage(type);
    if (selectedAsset) {
      if (type === 'header') {
        useUserStore.getState().setHeaderPic(selectedAsset);
      } else {
        useUserStore.getState().setProfilePic(selectedAsset);
      }
    }
  }, [pickImage]);

  const handleCompleteProfileButton = async () => {
    setIsLoading(true);
    try {
      const validProfilePic =
        profilePic && typeof profilePic !== 'string' ? profilePic : null;
      const validHeaderPic =
        headerPic && typeof headerPic !== 'string' ? headerPic : null;

      setDarkMode?.(darkMode);
      updatePrivacySafety({
        likesPublic: privacySafety.likesPublic,
        allowDMsFromEveryone: privacySafety.allowDMsFromEveryone,
      });
      setNotificationPreferences({ pushEnabled: isPushEnabled });

      await handleCompleteProfile(
        email,
        username,
        displayName,
        validProfilePic,
        validHeaderPic,
        bio,
        () => {}, // This is the setSuccessModalVisible function
        {
          darkMode,
          likesPublic: privacySafety.likesPublic,
          notificationsEnabled: isPushEnabled,
        },
      );

      setError(null);
    } catch (error: unknown) {
      console.error('Error completing profile:', error);
      if (error instanceof Error) {
        setError(
          error.message || 'Failed to complete profile. Please try again.',
        );
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../../assets/animations/loading-animation.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Creating Account...</Text>
        </View>
      </BlurView>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <HeaderPicUpload onHeaderPicChange={() => handleImagePick('header')} />
          <ProfilePicUpload onProfilePicChange={() => handleImagePick('profile')} />
          <View style={styles.inputsContainer}>
            <InputField
              label="Display Name"
              placeholder="Enter Display Name"
              value={displayName}
              labelStyle={styles.whiteText}
              onChangeText={setDisplayName}
              accessibilityLabel="Display Name Input"
            />
            <InputField
              label="Username"
              placeholder="Enter Username"
              value={username}
              labelStyle={styles.whiteText}
              onChangeText={setUsername}
              accessibilityLabel="Username Input"
            />
            <InputField
              label="Bio"
              placeholder="Enter your bio"
              labelStyle={styles.whiteText}
              value={bio}
              onChangeText={text => setBio?.(text)}
              multiline
              numberOfLines={4}
              accessibilityLabel="Bio Input"
            />
          </View>

          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <FontAwesomeIcon icon={faMoon} size={24} color="#1bd40b" />
              <Text style={styles.preferenceText}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#767577', true: '#1bd40b' }}
                thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
                accessibilityLabel="Dark Mode Switch"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.preferenceItem}>
              <FontAwesomeIcon icon={faHeart} size={24} color="#1bd40b" />
              <Text style={styles.preferenceText}>Likes Public</Text>
              <Switch
                value={privacySafety.likesPublic}
                onValueChange={value =>
                  updatePrivacySafety({ likesPublic: value })
                }
                trackColor={{ false: '#767577', true: '#1bd40b' }}
                thumbColor={privacySafety.likesPublic ? '#f4f3f4' : '#f4f3f4'}
                accessibilityLabel="Likes Public Switch"
                accessibilityRole="switch"
              />
            </View>

            <View style={styles.preferenceItem}>
              <FontAwesomeIcon icon={faBell} size={24} color="#1bd40b" />
              <Text style={styles.preferenceText}>Push Notifications</Text>
              <Switch
                value={isPushEnabled}
                onValueChange={handlePushNotificationsToggle}
                trackColor={{ false: '#767577', true: '#1bd40b' }}
                thumbColor={isPushEnabled ? '#f4f3f4' : '#f4f3f4'}
                accessibilityLabel="Push Notifications Switch"
                accessibilityRole="switch"
              />
            </View>

            <TouchableOpacity
              onPress={handleCompleteProfileButton}
              style={styles.button}
              disabled={isLoading || !displayName.trim() || !username.trim()}
              accessibilityLabel="Complete Profile Button"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#002400', '#00e100']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Complete Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
};

export default CompleteProfileScreen;
