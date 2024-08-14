// CompleteProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, ScrollView ,Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { RootStackParamList } from '../../types/types';
import HeaderPicUpload from '../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../components/Upload/ProfilePicUpload';
import InputField from '../../components/shared/Input/InutField';
import { LinearGradient } from 'expo-linear-gradient';
import { handleCompleteProfile } from '../../services/authFunctions';
import { useUserStore, ProfileImage } from '../../utils/userStore'; // Ensure correct import
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMoon, faLanguage, faHeart, faBell } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../ThemeContext';

const { width } = Dimensions.get('window');

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CompleteProfileScreen'>>();
  const { headerPic, profilePic, bio, setBio, setLikesPublic, setNotificationsEnabled } = useUserStore();
  const { email } = route.params;
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { setDarkMode } = useUserStore();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkModeLocal] = useState(false);
  const [likesPublic, setLikesPublicLocal] = useState(true);
  const [notificationsEnabled, setNotificationsEnabledLocal] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      }
    })();
  }, []);

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    setDarkMode(!isDarkMode);
  };

  const handleImagePick = async (type: 'header' | 'profile') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos.');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'header' ? [16, 9] : [1, 1],
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageAsset = result.assets[0];
        const profileImage: ProfileImage = {
          uri: imageAsset.uri,
          width: imageAsset.width,
          height: imageAsset.height,
          type: imageAsset.type,
          fileName: imageAsset.fileName,
          fileSize: imageAsset.fileSize,
        };
  
        if (type === 'header') {
          useUserStore.getState().setHeaderPic(profileImage);
        } else {
          useUserStore.getState().setProfilePic(profileImage);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCompleteProfileButton = async () => {
    setIsLoading(true);
    try {
      // Ensure the profilePic and headerPic are of type ProfileImage or null
      const validProfilePic = profilePic && typeof profilePic !== 'string' ? profilePic : null;
      const validHeaderPic = headerPic && typeof headerPic !== 'string' ? headerPic : null;
  
      // Update Zustand store with preferences
      setDarkMode(darkMode);
      setLikesPublic(likesPublic);
      setNotificationsEnabled(notificationsEnabled);

      await handleCompleteProfile(
        email,
        username,
        displayName,
        validProfilePic,
        validHeaderPic,
        bio,
        () => {}, // setSuccessModalVisible
        navigation,
        { darkMode, likesPublic, notificationsEnabled }
      );
  
      setError(null);
    } catch (error: unknown) {
      console.error('Error completing profile:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to complete profile. Please try again.');
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isLoading) {
    return (
      <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/animations/loading-animation.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>Creating Account...</Text>
        </View>
      </BlurView>
    );
  }

  return (
    <ScrollView style={styles.container}>
    <HeaderPicUpload onHeaderPicChange={() => handleImagePick('header')} />
    <ProfilePicUpload onProfilePicChange={() => handleImagePick('profile')} />
      <View style={styles.inputsContainer}>
        <InputField
          label="Display Name"
          placeholder="Enter Display Name"
          value={displayName}
          labelStyle={styles.whiteText}
          onChangeText={setDisplayName}
        />
        <InputField
          label="Username"
          placeholder="Enter Username"
          value={username}
          labelStyle={styles.whiteText}
          onChangeText={setUsername}
        />
        <InputField
          label="Bio"
          placeholder="Enter your bio"
          labelStyle={styles.whiteText}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.preferencesContainer}>
        <View style={styles.preferenceItem}>
          <FontAwesomeIcon icon={faMoon} size={24} color="#1bd40b" />
          <Text style={styles.preferenceText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: "#767577", true: "#1bd40b" }}
            thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
        <View style={styles.preferenceItem}>
          <FontAwesomeIcon icon={faLanguage} size={24} color="#1bd40b" />
          <Text style={styles.preferenceText}>Language: English</Text>
        </View>
        <View style={styles.preferenceItem}>
          <FontAwesomeIcon icon={faHeart} size={24} color="#1bd40b" />
          <Text style={styles.preferenceText}>Likes Public</Text>
          <Switch
            value={likesPublic}
            onValueChange={setLikesPublicLocal}
            trackColor={{ false: "#767577", true: "#1bd40b" }}
            thumbColor={likesPublic ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
        <View style={styles.preferenceItem}>
          <FontAwesomeIcon icon={faBell} size={24} color="#1bd40b" />
          <Text style={styles.preferenceText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabledLocal}
            trackColor={{ false: "#767577", true: "#1bd40b" }}
            thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleCompleteProfileButton} style={styles.button}>
        <LinearGradient
          colors={['#002400', '#00e100']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        >
          <Text style={styles.buttonText}>Complete Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    padding: 20,
  },
  preferencesContainer: {
    marginTop: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  preferenceText: {
    color: '#FFFFFF', // This makes the text white
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  whiteText: {
    color: '#FFF',
  },
  inputsContainer: {
    width: '100%',
    marginTop: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
  gradient: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 50
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;