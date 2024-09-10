import React, {useState, useEffect, useRef} from 'react';
import {View,Text,Image,TouchableOpacity,Animated,PanResponder,Dimensions, Easing} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import styles from './ProfilePanel.styles';
import {faUser,faRibbon,faBell,faCog,faMoon,faTimes,} from '@fortawesome/free-solid-svg-icons';
import Anon1Image from '../../assets/images/Jestr5.jpg';
import {useTheme} from '../../theme/ThemeContext'; 
import {User, ProfilePanelProps} from '../../types/types';
import NotificationsPanel from './NotificationsPanel';
import {Switch} from 'react-native';
import {useUserStore} from '../../stores/userStore';

const {width} = Dimensions.get('window');

const ProfilePanel: React.FC<ProfilePanelProps> = ({isVisible,onClose,profilePicUrl,username,displayName,followersCount: initialFollowersCount,followingCount: initialFollowingCount,user,navigation}) => {
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const followersCount = useUserStore(state => state.followersCount);
  const followingCount = useUserStore(
    state => state.FollowingCount || state.followingCount,
  );
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [showNotifications, setShowNotifications] = useState(false);
  const bio = localUser?.Bio || localUser?.bio || 'Default bio';
  const panelTranslateX = useRef(new Animated.Value(-width)).current;
  const {isDarkMode, toggleDarkMode} = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;


  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });


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
    }),
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

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    Animated.timing(spinValue, {
      toValue: isDarkMode ? 0 : 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true
    }).start();
  };

  const getProfilePic = () => {
    if (profilePicUrl) {
      return {uri: profilePicUrl};
    } else {
      console.log('Profile picture URL not available');
      return Anon1Image;
    }
  };

  const handleProfileClick = () => {
    navigation.navigate('Profile', {
      userEmail: localUser?.email,
    });
    closePanel();
  };
  const handleSettingsClick = () => {
    navigation.navigate('Settings');
  };

  const handleBadgeClick = () => {
    setShowBadgeModal(true);
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
    setShowNotifications(true);
    closePanel();
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.profilePanel,
          {
            transform: [{translateX: panelTranslateX}],
            backgroundColor: isDarkMode ? '#1e1e1e' : '#494949',
          },
        ]}>
        <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
          <FontAwesomeIcon
            icon={faTimes}
            style={styles.closeButtonIcon}
            size={24}
          />
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
            {icon: faUser, label: 'Profile', onPress: handleProfileClick},
            {
              icon: faBell,
              label: 'Notifications',
              onPress: handleNotificationsClick,
            },
            {icon: faRibbon, label: 'Badges', onPress: handleBadgeClick},
            {icon: faCog, label: 'Settings', onPress: handleSettingsClick},
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButton}
              onPress={item.onPress}>
              <FontAwesomeIcon icon={item.icon} style={styles.icon} size={24} />
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
      </Animated.View>
      {isVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={closePanel}
          activeOpacity={1}
        />
      )}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};

export default ProfilePanel;
