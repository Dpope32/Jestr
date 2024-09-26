// Notifications/index.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNotificationStore, Notification } from '../../../stores/notificationStore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext'; // Ensure consistent import

const NotificationsScreen = () => {
  const notificationStore = useNotificationStore();
  const notifications = notificationStore.notifications; // Now exists in the store
  const navigation = useNavigation();
  const { colors } = useTheme();

  console.log("Notifications:", notifications); // Debugging

  // Explicitly type the 'item' as 'Notification'
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={[styles.notificationItem, { backgroundColor: colors.card }]}
      accessible
      accessibilityLabel={`Notification: ${item.title}`}
    >
      <View style={styles.notificationHeader}>
        <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
        {!item.read && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
      <Text style={{ color: colors.text }}>{item.message}</Text>
      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  // Explicitly type the 'notification' parameter as 'Notification'
  const handleNotificationPress = (notification: Notification) => {
    // Example: Navigate to a detailed view of the notification
   // navigation.navigate('NotificationDetail', { notificationId: notification.id });

    // Optionally mark the notification as read
    if (!notification.read) {
      notificationStore.markAsRead(notification.id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.textSecondary }}>No notifications available.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()} // Ensure each notification has a unique id
          style={styles.notificationList}
          contentContainerStyle={styles.listContent}
          accessibilityLabel="List of notifications"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notificationList: {
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30', // Red dot for unread
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen;
