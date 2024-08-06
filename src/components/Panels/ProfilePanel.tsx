import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import styles from './ProfilePanel.styles';
import { faUser , faRibbon, faBell, faHistory, faCog, faMoon, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import Anon1Image from '../../assets/images/Jestr5.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../Modals/LogoutModal';
import { User } from '../../types/types';
import NotificationsPanel from './NotificationsPanel';
import { Switch } from 'react-native';
import { handleSignOut } from '../../services/authFunctions';
import { CommonActions } from '@react-navigation/native';


const { width } = Dimensions.get('window');

type ProfilePanelProps = {
  isVisible: boolean;
  onClose: () => void;
  profilePicUrl: string;
  username: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
  onDarkModeToggle: (isDarkMode: boolean) => void;
  user: User | null;
  navigation: any;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isVisible, onClose, profilePicUrl, username, displayName, followersCount: initialFollowersCount,
  followingCount: initialFollowingCount, onDarkModeToggle, user, navigation, isDarkMode, setIsDarkMode,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [followersCount] = useState(initialFollowersCount);
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [followingCount] = useState(initialFollowingCount);
  const [showNotifications, setShowNotifications] = useState(false);
  const bio = localUser?.Bio || localUser?.bio || 'Default bio';

  const panelTranslateX = useRef(new Animated.Value(-width)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          panelTranslateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -width * 0.4) {
          closePanel();
        } else {
          Animated.spring(panelTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      openPanel();
    } else {
      closePanel();
    }
  }, [isVisible]);

  const openPanel = () => {
    Animated.spring(panelTranslateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(panelTranslateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
    onDarkModeToggle(value);
  };

  const getProfilePic = () => {
    if (profilePicUrl) {
      return { uri: profilePicUrl };
    } else {
      console.log('Profile picture URL not available');
      return Anon1Image;
    }
  };

  const handleProfileClick = () => {
    navigation.navigate('Profile', { user: localUser });
    console.log(localUser)
    closePanel();
  };


  const handleSettingsClick = () => {
    navigation.navigate('Settings');
  };
  

  const handleBadgeClick = () => {
    setShowBadgeModal(true);
  };

  const handleFavoritesClick = () => {
    console.log('Favorites clicked');
    closePanel();
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
    setShowNotifications(true);
    closePanel();
  };

  const handleSignOutClick = () => {
    setLogoutModalVisible(true);
  };

  const confirmSignOut = async () => {
    try {
      await handleSignOut();
      await AsyncStorage.clear(); // Clear all stored data
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LandingPage' }],
        })
      );
    } catch (error) {
      console.error('Error during sign-out:', error);
    } finally {
      setLogoutModalVisible(false);
    }
  };

  const cancelSignOut = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.profilePanel,
          {
            transform: [{ translateX: panelTranslateX }],
            backgroundColor: isDarkMode ? '#1e1e1e' : '#494949',
          },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
          <FontAwesomeIcon icon={faTimes} style={styles.closeButtonIcon} size={24} />
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={handleProfileClick}>
            <Image source={getProfilePic()} style={styles.profilePic} />
          </TouchableOpacity>
          <View style={styles.userInfoContainer}>
            <Text style={styles.displayName}>{displayName || 'Anon'}</Text>
            <Text style={styles.username}>@{username || 'Username'}</Text>
          </View>
          <View style={styles.followContainer}>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{followersCount || 0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{followingCount || 0}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconSection}>
          {[
            { icon: faUser, label: 'Profile', onPress: handleProfileClick },
            { icon: faBell, label: 'Notifications', onPress: handleNotificationsClick },
            { icon: faRibbon, label: 'Badges', onPress: handleBadgeClick },
            { icon: faHistory, label: 'History', onPress: handleFavoritesClick },
            { icon: faCog, label: 'Settings', onPress: handleSettingsClick },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.iconButton} onPress={item.onPress}>
              <FontAwesomeIcon icon={item.icon} style={styles.icon} size={24} />
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.signoutButton} onPress={handleSignOutClick}>
            <FontAwesomeIcon icon={faSignOutAlt} style={styles.signoutIcon} size={24} />
            <Text style={styles.signoutText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.darkModeContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#1bd40b" }}
              thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
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
      </Animated.View>
      {isVisible && (
        <TouchableOpacity style={styles.backdrop} onPress={closePanel} activeOpacity={1} />
      )}
      <LogoutModal visible={logoutModalVisible} onCancel={cancelSignOut} onConfirm={confirmSignOut} />
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
      {/* Add SettingsModal component here when implemented */}
    </>
  );
}

export default ProfilePanel;