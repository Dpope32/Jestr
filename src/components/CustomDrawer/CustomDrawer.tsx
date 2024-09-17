import React, { useRef, } from 'react';
import {View, Text, Image, TouchableOpacity, Animated, Easing} from 'react-native';
import {Switch} from 'react-native';
import {DrawerContentScrollView,DrawerItem,DrawerContentComponentProps,} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faMoon, faCog, faHome, faUser, faBell, faRibbon} from '@fortawesome/free-solid-svg-icons';

import styles from './styles';
import {AppNavParamList} from '../../navigation/NavTypes/RootNavTypes';
import {AppNavProp} from '../../navigation/NavTypes/RootNavTypes';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import {User} from '../../types/types';
import Anon1Image from '../../assets/images/Jestr.jpg';

const drawerItems = [
  {
    label: 'Home',
    icon: faHome,
    navigateTo: 'Home' as keyof AppNavParamList,
  },
  {
    label: 'Profile',
    icon: faUser,
    navigateTo: 'Profile' as keyof AppNavParamList,
  },
  {
    label: 'Badges',
    icon: faRibbon,
    navigateTo: 'Profile' as keyof AppNavParamList,
  },
  {
    label: 'Settings',
    icon: faCog,
    navigateTo: 'Settings' as keyof AppNavParamList,
  },
  {
    label: 'Notifications',
    icon: faBell,
    navigateTo: 'Notifications' as keyof AppNavParamList,
  },
];

const CustomDrawer = (props: DrawerContentComponentProps) => {
  const navigation = useNavigation<AppNavProp>();
  const {isDarkMode, toggleDarkMode} = useTheme();
  const user = useUserStore(state => state as User);
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    Animated.timing(spinValue, {
      toValue: isDarkMode ? 0 : 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };


  const handleProfileClick = () => {
    navigation.navigate('Profile');
  };

  const getProfilePic = () => {
    if (user?.profilePic) {
      return {uri: user.profilePic};
    } else {
      console.log('Profile picture URL not available');
      return Anon1Image;
    }
  };

  return (
    <View
      style={{flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#494949'}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{}}>
        {/* == PROFILE INFO == */}
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={handleProfileClick}>
            <Image source={getProfilePic()} style={styles.profilePic} />
          </TouchableOpacity>
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>
              {user?.displayName || 'Anon'}
            </Text>
            <Text style={styles.username}>@{user?.username || 'Username'}</Text>
          </View>
          <View style={styles.followContainer}>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{0}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* NAV ITEMS */}
        <View style={styles.navItemsCtr}>
          {drawerItems.map((item, index) => (
            <DrawerItem
              key={index}
              label={item.label}
              style={{}}
              icon={() => (
                <FontAwesomeIcon
                  icon={item.icon}
                  size={24}
                  style={styles.icon}
                />
              )}
              onPress={() => {
                navigation.navigate(item.navigateTo);
              }}
              labelStyle={styles.iconLabel}
            />
          ))}
        </View>
      </DrawerContentScrollView>

      {/* == BOTTOM CONTENT == */}
      <View style={styles.bottomContainer}>
          <View style={styles.darkModeContainer}>
            <Switch
              trackColor={{false: '#767577', true: '#1bd40b'}}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleDarkModeToggle}
              value={isDarkMode}
            />
            <Animated.View 
              style={{ 
                transform: [{ rotate: spin }],
                padding: 6,
              }}
            >
              <FontAwesomeIcon
                icon={faMoon}
                style={styles.darkModeIcon}
                color={isDarkMode ? '#1bd40b' : '#ffffff'}
                size={24}
              />
            </Animated.View>
          </View>
        </View>
    </View>
  );
};

export default CustomDrawer;
