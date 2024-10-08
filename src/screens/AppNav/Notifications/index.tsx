import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { BottomNavProp } from '../../../navigation/NavTypes/BottomTabsTypes';
import { COLORS, FONTS } from '../../../theme/theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNotificationStore, Notification } from '../../../stores/notificationStore';
import { LinearGradient } from 'expo-linear-gradient';
import Particles from '../../../components/Particles/Particles';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const NotificationsScreen = () => {
  const navigation = useNavigation<BottomNavProp>();
  const { isDarkMode } = useTheme();
  const { notifications, markAllAsRead } = useNotificationStore();
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [oldNotifications, setOldNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      markAllAsRead();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setNewNotifications(notifications.filter(n => !n.read));
    setOldNotifications(notifications.filter(n => n.read));
  }, [notifications]);

  const getProfilePic = (profilePicUrl: string) => {
    if (profilePicUrl.startsWith('http')) {
      return { uri: profilePicUrl };
    } else {
      // Dynamically require local images
      switch (profilePicUrl) {
        case '1.png':
          return require('../../../assets/images/1.png');
        case '2.png':
          return require('../../../assets/images/2.png');
        case '3.png':
          return require('../../../assets/images/3.png');
        case '4.png':
          return require('../../../assets/images/4.png');
        default:
          return require('../../../assets/images/5.png');
      }
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? 'rgba(255,255,255,0.1)' : 'rgba(29,185,84,0.3)' }
      ]}
    >
      <Image source={getProfilePic(item.profilePicUrl)} style={styles.profilePic} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#013026', '#014760', '#107e57']}
        style={StyleSheet.absoluteFillObject}
      />
      <Particles
        windowWidth={windowWidth}
        windowHeight={windowHeight}
        density={0.005}
        color="#39FF14"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon
            icon={faArrowLeft}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={[
          { title: 'New', data: newNotifications },
          { title: 'Earlier', data: oldNotifications },
        ]}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <FlatList
              data={item.data}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 16,
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 4,
    color: COLORS.white,
    fontFamily: FONTS.regular,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.regular,
  },
});

export default NotificationsScreen;