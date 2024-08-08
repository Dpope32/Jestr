// CompleteProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { RootStackParamList } from '../../types/types';
import HeaderPicUpload from '../../components/Upload/HeaderPicUpload';
import ProfilePicUpload from '../../components/Upload/ProfilePicUpload';
import InputField from '../../components/shared/Input/InutField';
import { LinearGradient } from 'expo-linear-gradient';
import { handleCompleteProfile } from '../../services/authFunctions';
import { useUserStore, ProfileImage } from '../../screens/userStore'; // Ensure correct import
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CompleteProfileScreen'>>();
  const { headerPic, profilePic, bio, setBio } = useUserStore();

  const { email } = route.params;
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      }
    })();
  }, []);

  const handleImagePick = async (type: 'header' | 'profile') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'header' ? [16, 9] : [1, 1],
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets[0]) {
      useUserStore.getState().setUserDetails({
        [type === 'header' ? 'headerPic' : 'profilePic']: result.assets[0] as ProfileImage // Ensure the correct type
      });
    }
  };

  const handleCompleteProfileButton = async () => {
    setIsLoading(true);
    try {
      // Ensure the profilePic and headerPic are of type ProfileImage or null
      const validProfilePic = profilePic && typeof profilePic !== 'string' ? profilePic : null;
      const validHeaderPic = headerPic && typeof headerPic !== 'string' ? headerPic : null;
  
      await handleCompleteProfile(
        email,
        username,
        displayName,
        validProfilePic,
        validHeaderPic,
        bio,
        setSuccessModalVisible,
        navigation
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
    <View style={styles.container}>
      <HeaderPicUpload onHeaderPicChange={() => handleImagePick('header')} />
      <ProfilePicUpload onProfilePicChange={() => handleImagePick('profile')} />
      <View style={styles.inputsContainer}>
        <InputField
          label="Display Name"
          placeholder="Enter Display Name (Optional)"
          value={displayName}
          onChangeText={setDisplayName}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <InputField
          label="Username"
          placeholder="Enter Username (Required)"
          value={username}
          onChangeText={setUsername}
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
        />
        <InputField
          label="Bio"
          placeholder="Enter your bio"
          value={bio}
          onChangeText={setBio}
          containerStyle={styles.inputContainer}
          inputStyle={[styles.input, styles.bioInput]}
          multiline
          numberOfLines={4}
        />
      </View>
      <TouchableOpacity onPress={handleCompleteProfileButton} style={styles.button}>
        <LinearGradient
          colors={['#002400', '#00e100']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        >
          {error && <Text style={styles.errorText}>{error}</Text>}
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    padding: 20,
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
  inputsContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    width: width - 40, // Adjust width based on screen size
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;
