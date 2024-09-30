// Notification Screen inside the Profile Panel Drawer, considering turning into a component rather than a screen

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNotificationStore, Notification } from '../../../stores/notificationStore';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext'; 
import { BottomNavProp } from '../../../navigation/NavTypes/BottomTabsTypes';
import Particles from '../../../components/Particles/Particles';
import { COLORS, SPACING } from '../../../theme/theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faBell } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePushNotifications } from './usePushNotification';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const NotificationsScreen = () => {
  const navigation = useNavigation<BottomNavProp>();
  const notificationStore = useNotificationStore();
  const notifications = notificationStore.notifications; 
  const { colors, isDarkMode } = useTheme();
  const { expoPushToken, notification } = usePushNotifications();
  const data = JSON.stringify(notification, undefined, 2);
  console.log('expoPushToken:', expoPushToken);


  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={[styles.notificationItem]}
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

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      notificationStore.markAsRead(notification.id);
    }
  };

  return (
    <View style={styles.container}>
          <LinearGradient
    colors={['#013026', '#014760', '#107e57', '#a1ce3f', '#39FF14']}
    style={styles.blurOverlay}
  >
      <Particles 
        windowWidth={windowWidth} 
        windowHeight={windowHeight} 
        density={0.05} 
        color={isDarkMode ? COLORS.particlesDark : COLORS.particlesLight} 
      />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessible
            accessibilityLabel="Go Back"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              size={24}
              color={isDarkMode ? COLORS.white : COLORS.black}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: isDarkMode ? COLORS.white : COLORS.black }
            ]}
          >
            Notifications
          </Text>
          <Text>Notification: {data}</Text>
          <Text>Token: {expoPushToken?.data }</Text>
          <FontAwesomeIcon icon={faBell} size={24} color={COLORS.primary} />
          
        </View>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.text }}>No notifications available.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            style={styles.notificationList}
            contentContainerStyle={styles.listContent}
            accessibilityLabel="List of notifications"
          />
        )}
     </LinearGradient> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#014760',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: windowWidth,
    height: windowHeight - 100,
    zIndex: -1,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    justifyContent: 'flex-start', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1E1E1E',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    backgroundColor: 'rgba(30, 30, 30, 0.8)', 
    elevation: 2,
    shadowColor: COLORS.black,
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
    backgroundColor: COLORS.error, // Red dot for unread
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
    paddingTop: -100,
    flexGrow: 1,
  },
});

export default NotificationsScreen;
