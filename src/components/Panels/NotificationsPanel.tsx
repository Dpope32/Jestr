import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FlashList } from '@shopify/flash-list';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const NotificationsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Fetch notifications from your API here
    // For now, we'll use dummy data
    setNotifications([
      { id: '1', message: 'New follower: @user1', timestamp: '2 minutes ago' },
      { id: '2', message: '@user2 liked your meme', timestamp: '1 hour ago' },
      { id: '3', message: 'Your meme is trending!', timestamp: '3 hours ago' },
    ]);
  }, []);

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationItem, isDarkMode && styles.darkNotificationItem]}>
      <Text style={[styles.notificationMessage, isDarkMode && styles.darkText]}>{item.message}</Text>
      <Text style={[styles.notificationTimestamp, isDarkMode && styles.darkText]}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
      <FontAwesomeIcon icon={faTimes} style={isDarkMode ? styles.darkIcon : styles.closeIcon} />
      </TouchableOpacity>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Notifications</Text>
      <FlashList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1C1C1C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  darkNotificationItem: {
    backgroundColor: '#333333',
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 5,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#888888',
  },
  darkText: {
    color: '#ffffff',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closeIcon: {
    color: '#000000',
  },
  darkIcon: {
    color: '#ffffff',
  },
});

export default NotificationsPanel;