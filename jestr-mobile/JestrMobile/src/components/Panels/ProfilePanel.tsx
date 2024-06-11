import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import styles  from './ProfilePanel.styles'; // Import styles
import {
  faUser,
  faHistory,
  faBox,
  faCog,
  faMoon,
  faTimes,
  faHeart,
  faBell,
  faSignOutAlt,
  faLock,
  faUserShield,
  faBell as faBellSolid,
  faPalette,
  faEdit,
  faAd,
} from '@fortawesome/free-solid-svg-icons';
import Anon1Image from '../../assets/images/Jestr5.jpg';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../Modals/LogoutModal'; 
import { CommonActions } from '@react-navigation/native';

type ProfilePanelProps = {
  isVisible: boolean;
  onClose: () => void;
  profilePicUrl: string;
  username: string;
  displayName: string;
  followersCount: string;
  followingCount: string;
  onDarkModeToggle: () => void;
  user: any; // Replace with the appropriate type for the user object
  navigation: any; // Replace with the appropriate type for the navigation object
};

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isVisible,
  onClose,
  profilePicUrl,
  username,
  displayName,
  followersCount,
  followingCount,
  onDarkModeToggle,
  user,
  navigation,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [panelTranslateX] = useState(new Animated.Value(-300)); // Initial position off-screen
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(panelTranslateX, {
        toValue: 0, // Slide in to the visible position
        duration: 300, // Animation duration
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panelTranslateX, {
        toValue: -300, // Slide back off-screen
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, panelTranslateX]);

  const getProfilePic = () => {
    if (profilePicUrl) {
      if (profilePicUrl.startsWith('data:image')) {
        return { uri: profilePicUrl };
      } else {
        return { uri: profilePicUrl };
      }
    } else {
      console.log('Profile picture URL not available');
      return Anon1Image;
    }
  };

  const handleProfileClick = () => {
    navigation.navigate('Profile', { user });
  };

  const handleStorageClick = () => {
    console.log('Storage clicked');
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleDarkModeClick = () => {
    setIsDarkMode(!isDarkMode);
    onDarkModeToggle();
  };

  const handleFavoritesClick = () => {
    console.log('Favorites clicked');
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };

  const handleSignOut = () => {
    setLogoutModalVisible(true);
  };

  const confirmSignOut = async () => {
    try {
      console.log('Confirming sign-out...');
      // Clear local storage
      await AsyncStorage.removeItem('user');
      console.log('User data cleared from AsyncStorage');
      
      // Navigate to the InitialScreen and clear the navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LandingPage' }],
        })
      );
      console.log('Navigated to InitialScreen');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  const cancelSignOut = () => {
    setLogoutModalVisible(false);
  };

  const closeModal = () => {
    setShowSettingsModal(false);
  };

  const getDarkModeIconStyle = () => {
    return isDarkMode ? styles.activeDarkIcon : null;
  };

  return (
    <Animated.View
      style={[
        styles.profilePanel,
        { transform: [{ translateX: panelTranslateX }] },
      ]}
    >
    <Animated.View style={[styles.container, isDarkMode && styles.darkMode, isVisible && styles.dimBackground]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Image source={getProfilePic()} style={styles.profilePic} />
          <View style={styles.userInfoContainer}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}>{displayName || 'Anon'}</Text>
              <Text style={styles.infoLabel}>Display Name</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoValue}> @{username || 'Username'}</Text>
              <Text style={styles.infoLabel}>Username</Text>
            </View>
          </View>
          <View style={styles.followContainer}>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{followersCount || 0}</Text>
              <Text style={styles.infoLabel}>Followers</Text>
            </View>
            <View style={styles.followCount}>
              <Text style={styles.followValue}>{followingCount || 0}</Text>
              <Text style={styles.infoLabel}>Following</Text>
            </View>
          </View>
        </View>
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.iconButton} onPress={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} style={styles.icon} />
            <Text style={styles.iconLabel}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsClick}>
            <FontAwesomeIcon icon={faBell} style={styles.icon} />
            <Text style={styles.iconLabel}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleStorageClick}>
            <FontAwesomeIcon icon={faBox} style={styles.icon} />
            <Text style={styles.iconLabel}>Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleFavoritesClick}>
            <FontAwesomeIcon icon={faHistory} style={styles.icon} />
            <Text style={styles.iconLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} style={styles.icon} />
            <Text style={styles.iconLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signoutButton} onPress={handleSignOut}>
        <FontAwesomeIcon icon={faSignOutAlt} style={styles.icon} />
      </TouchableOpacity>
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={cancelSignOut}
        onConfirm={confirmSignOut}
      />
        <TouchableOpacity style={styles.darkModeButton} onPress={handleDarkModeClick}>
          <FontAwesomeIcon icon={faMoon} style={[styles.icon, getDarkModeIconStyle()]} />
        </TouchableOpacity>
        {showSettingsModal && (
          <View style={styles.settingsModal}>
            <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
              <FontAwesomeIcon icon={faTimes} style={styles.closeModalIcon} />
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Settings</Text>
            </View>
            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faUserShield} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Privacy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faBellSolid} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faPalette} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Content Preferences</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faEdit} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faLock} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionItem}>
                <FontAwesomeIcon icon={faAd} style={styles.optionIcon} />
                <Text style={styles.optionLabel}>Ad Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
      <TouchableOpacity style={styles.dimBackground} onPress={onClose} />
    </Animated.View>
  );
};

export default ProfilePanel;