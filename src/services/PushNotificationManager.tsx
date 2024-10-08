// src/services/PushNotificationManager.tsx

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class PushNotificationManager {
  // Request permissions and get push token
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    try {
      const existingStatus = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus.status;

      if (existingStatus.status !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'You need to allow notifications to receive updates.',
          [{ text: 'OK' }],
        );
        await AsyncStorage.setItem('notificationsPermission', 'denied');
        return null;
      }

      await AsyncStorage.setItem('notificationsPermission', 'granted');

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      // Optionally, send this token to your backend server here

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      Alert.alert('Error', 'Failed to register for push notifications.');
      return null;
    }
  }

  // Unregister from push notifications
  static async unregisterPushNotificationsAsync() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      await AsyncStorage.setItem('notificationsPermission', 'denied');

      // Optionally, notify your backend server to disable push notifications for this user
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }
}

export default PushNotificationManager;
