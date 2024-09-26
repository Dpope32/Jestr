// NotiSettings.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  useNotificationStore,
  NotificationSettings,
} from '../../../stores/notificationStore';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext'; // Ensure consistent import

const NotiSettings: React.FC = () => {
  const store = useNotificationStore();
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    ...store,
  });
  const navigation = useNavigation();
  const { colors } = useTheme(); // Use custom ThemeContext for consistent theming

  useEffect(() => {
    setLocalSettings({ ...store });
  }, [store]);

  const renderSwitch = (
    label: string,
    setting: keyof NotificationSettings
  ) => (
    <View style={styles.notificationSetting}>
      <Text style={[styles.settingTitle, { color: colors.text }]}>
        {label}
      </Text>
      <Switch
        value={localSettings[setting]}
        onValueChange={(value) =>
          setLocalSettings({ ...localSettings, [setting]: value })
        }
        trackColor={{ false: '#767577', true: '#34c759' }}
        thumbColor={localSettings[setting] ? '#f4f3f4' : '#f4f3f4'}
      />
    </View>
  );

  const saveChanges = () => {
    store.updateAllSettings(localSettings);
    console.log('Saving notification settings:', localSettings);
    Toast.show({
      type: 'success',
      text1: 'Settings Saved',
      text2: 'Your notification preferences have been updated.',
    });
    navigation.goBack(); // Close the modal
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderSwitch('Push Notifications', 'pushEnabled')}
      {renderSwitch('Email Notifications', 'emailEnabled')}
      {renderSwitch('SMS Notifications', 'smsEnabled')}
      {renderSwitch('In-App Notifications', 'inAppEnabled')}
      {renderSwitch('New Follower Notifications', 'newFollowerNotif')}
      {renderSwitch('New Comment Notifications', 'newCommentNotif')}
      {renderSwitch('New Like Notifications', 'newLikeNotif')}
      {renderSwitch('Mention Notifications', 'mentionNotif')}
      {renderSwitch('Daily Digest', 'dailyDigest')}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#34c759' }]} onPress={saveChanges}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: '#8e8e93' }]}
          onPress={() => {
            store.resetToDefaults();
            setLocalSettings({
              pushEnabled: true,
              emailEnabled: true,
              smsEnabled: false,
              inAppEnabled: true,
              newFollowerNotif: true,
              newCommentNotif: true,
              newLikeNotif: true,
              mentionNotif: true,
              dailyDigest: false,
            });
            Toast.show({
              type: 'info',
              text1: 'Settings Reset',
              text2: 'Notification preferences have been reset to default.',
            });
          }}
        >
          <Text style={styles.buttonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  notificationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default NotiSettings;
