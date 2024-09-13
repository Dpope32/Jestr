import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Switch} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faMoon, faSignOutAlt, faTimes} from '@fortawesome/free-solid-svg-icons';
import {faUser, faRibbon, faBell} from '@fortawesome/free-solid-svg-icons';
import {faHistory, faCog, faHome} from '@fortawesome/free-solid-svg-icons';

import styles from './styles';
import {AppNavParamList} from '../../navigation/NavTypes/RootNavTypes';
import {AppNavProp} from '../../navigation/NavTypes/RootNavTypes';
import {useTheme} from '../../theme/ThemeContext';
import LogoutModal from '../Modals/LogoutModal';
import {useUserStore} from '../../stores/userStore';
import {handleSignOut} from '../../services/authService';
import {User} from '../../types/types';
import {FONTS} from '../../theme/theme';
import Anon1Image from '../../assets/images/Jestr5.jpg';

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

  // console.log('DRAWER props: ', props);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSignOutClick = () => {
    setLogoutModalVisible(true);
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const confirmSignOut = async () => {
    try {
      await handleSignOut();
      await SecureStore.deleteItemAsync('accessToken');
      useUserStore.getState().setUserDetails({});
    } catch (error) {
      console.error('Error during sign-out:', error);
    } finally {
      setLogoutModalVisible(false);
    }
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
        <TouchableOpacity
          style={styles.signoutButton}
          onPress={handleSignOutClick}>
          <FontAwesomeIcon
            icon={faSignOutAlt}
            style={styles.signoutIcon}
            size={24}
          />
          <Text style={styles.signoutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={styles.darkModeContainer}>
          <Switch
            trackColor={{false: '#767577', true: '#1bd40b'}}
            thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#b7a1a1"
            onValueChange={handleDarkModeToggle}
            value={isDarkMode}
          />
          <FontAwesomeIcon
            icon={faMoon}
            style={styles.darkModeIcon}
            size={24}
          />
        </View>
      </View>

      {/* == LOGOUT == */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmSignOut}
      />
    </View>
  );
};

export default CustomDrawer;
