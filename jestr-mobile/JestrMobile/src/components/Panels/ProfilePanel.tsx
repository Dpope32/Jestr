import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import styles from './ProfilePanel.styles';
import {
  faUser,
  faUserShield,
  faPalette,
  faEdit,
  faLock,
  faAd,
  faBell,
  faBox,
  faHistory,
  faCog,
  faMoon,
  faSignOutAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import Anon1Image from '../../assets/images/Jestr5.jpg';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../Modals/LogoutModal';
import { CommonActions } from '@react-navigation/native';
import { User } from '../../screens/Feed/Feed';

type ProfilePanelProps = {
  isVisible: boolean;
  onClose: () => void;
  profilePicUrl: string;
  username: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
  onDarkModeToggle: () => void;
  user: User | null;
  navigation: any;
};

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isVisible,
  onClose,
  profilePicUrl,
  username,
  displayName,
  followersCount: initialFollowersCount,
  followingCount: initialFollowingCount,
  onDarkModeToggle,
  user,
  navigation,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [panelTranslateX] = useState(new Animated.Value(-300));
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(panelTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      fetchUserData();
      console.log('fetching user data..')
    } else {
      Animated.timing(panelTranslateX, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, panelTranslateX]);

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operation: 'getUser', email: parsedUser.email }),
        });
  
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON response');
        }
  
        const responseData = await response.json();
        const updatedUser = responseData.data;
        
        console.log('Updated user data:', updatedUser);
        
        setLocalUser(updatedUser);
        setFollowersCount(updatedUser.FollowersCount);
        setFollowingCount(updatedUser.FollowingCount);
        
        console.log('Updated user following count:', updatedUser.FollowingCount);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
    navigation.navigate('Profile', { user: localUser });
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
      await AsyncStorage.removeItem('user');
      console.log('User data cleared from AsyncStorage');
      
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
    <Animated.View style={[styles.profilePanel, { transform: [{ translateX: panelTranslateX }] }]}>
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
        <LogoutModal visible={logoutModalVisible} onCancel={cancelSignOut} onConfirm={confirmSignOut} />
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
                <FontAwesomeIcon icon={faBell} style={styles.optionIcon} />
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
