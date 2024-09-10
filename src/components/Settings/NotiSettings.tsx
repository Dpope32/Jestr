import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNotificationStore, NotificationSettings } from '../../stores/notificationStore';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const NotiSettings: React.FC = () => {
  const store = useNotificationStore();
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    ...store,
  });
  const navigation = useNavigation();

  useEffect(() => {
    setLocalSettings({ ...store });
  }, [store]);

  const renderSwitch = (label: string, setting: keyof NotificationSettings) => (
    <View style={styles.notificationSetting}>
      <Text style={styles.settingTitle}>{label}</Text>
      <Switch
        value={localSettings[setting] as boolean}
        onValueChange={(value) => setLocalSettings({ ...localSettings, [setting]: value })}
        trackColor={{ false: "#767577", true: "#34c759" }}
        thumbColor={localSettings[setting] ? "#f4f3f4" : "#f4f3f4"}
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
    <ScrollView style={styles.container}>
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
        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={store.resetToDefaults}>
          <Text style={styles.buttonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1c1c1e',
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
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  resetButton: {
    backgroundColor: '#8e8e93',
    padding: 10,
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