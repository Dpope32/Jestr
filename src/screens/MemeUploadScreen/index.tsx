import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, Animated, TouchableOpacity, Easing } from 'react-native';
import MemeUpload from '../../components/Meme/MemeUpload';
import TopPanel from '../../components/Panels/TopPanel';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { FONTS, COLORS } from '../../theme/theme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTheme } from '../../theme/ThemeContext';
import { useUserStore } from '../../stores/userStore';

type MemeUploadScreenProps = {
  navigation: any;
  route: any;
};

const MemeUploadScreen: React.FC<MemeUploadScreenProps> = ({ navigation }) => {
  const {isDarkMode} = useTheme();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);

  const user = useUserStore(state => state);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!user || !user.email) {
    Alert.alert('Error', 'User data is missing');
    navigation.goBack();
    return null;
  }

  const handleUploadSuccess = (url: string) => {
    console.log('Meme uploaded successfully:', url);
    setImageUploaded(true);
  };

  const handleImageSelect = (selected: boolean) => {
    setImageSelected(selected);
  };

  const handleHomeClick = () => {
    navigation.navigate('Home');
  };

  const toggleProfilePanel = () => {
    setProfilePanelVisible(!profilePanelVisible);
  };

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(shake, 2000);
      });
    };

    shake();
  }, [shakeAnim]);


  const shakeInterpolate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: shakeInterpolate }],
  };

  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(cardFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, cardFadeAnim]);

  return (
    <View style={[styles.background, isDarkMode && styles.darkBackground]}>
      <StatusBar barStyle="light-content" />
      <TopPanel
        onProfileClick={toggleProfilePanel}
        profilePicUrl={user.profilePic}
        username={user.username}
        enableDropdown={true}
        showLogo={true}
        isAdmin={false}
        onAdminClick={console.log}
        isUploading={isUploading}
      />
      {profilePanelVisible && (
        <View style={styles.overlay} />
      )}
      {profilePanelVisible && user && (
        <ProfilePanel
          isVisible={profilePanelVisible}
          onClose={() => setProfilePanelVisible(false)}
          profilePicUrl={user.profilePic}
          username={user.username}
          displayName={user.displayName || 'N/A'}
          followersCount={user.followersCount}
          followingCount={user.followingCount}
          user={user}
          navigation={navigation}
        />
      )}
      <Animated.View style={[styles.card, { opacity: cardFadeAnim }]}>
        <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="#1bd40b" />
        </TouchableOpacity>
          <Text style={styles.title}>This </Text>
          <Animated.Text style={[styles.title, styles.better, animatedStyle]}>BETTER</Animated.Text>
          <Text style={styles.title}> be funny!</Text>
        </View>
        <MemeUpload 
          userEmail={user.email}
          username={user.username}
          navigation={navigation}
          onUploadSuccess={handleUploadSuccess}
          onImageSelect={handleImageSelect}
          isDarkMode={isDarkMode}
          creationDate={user.creationDate} 
        />
      </Animated.View>
      {isUploading && (
        <View style={styles.fullScreenOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.7)']}
            style={styles.gradientBackground}
          >
            <View style={styles.uploadingContainer}>
              <LottieView
                source={require('../../assets/animations/loading-animation.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
              <Text style={styles.uploadingText}>Uploading meme, please standby...</Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  background: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  better: {
    color: COLORS.accent, 
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: FONTS.bold,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    marginRight: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 5,
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
    paddingVertical: 30,
    marginTop: 10,
  },
  profilePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONTS.regular,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
    zIndex: 11,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  profileContent: {
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONTS.regular,
  },
  profileText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.regular,
    fontWeight: 'bold',
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    fontFamily: FONTS.regular,
  },
  lottieAnimation: {
    width: 200,
    fontFamily: FONTS.regular,
    height: 200,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    marginTop: 20,
  },
});

export default MemeUploadScreen;
