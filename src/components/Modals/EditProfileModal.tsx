import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { User } from '../../types/types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCamera } from '@fortawesome/free-solid-svg-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateProfileImage } from '../../services/userService';
import Toast from 'react-native-toast-message';
import styles from './ModalStyles/EditProfileModalStyles';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isVisible, onClose, user, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.Bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [headerPic, setHeaderPic] = useState(user?.headerPic || null);

  console.log('headerPic state value:', headerPic); // Log current headerPic state
  console.log('profilePic state value:', profilePic); // Log current profilePic state

  const handleImagePick = async (type: 'profile' | 'header') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0] && user) {
      try {
        console.log('Selected Image URI:', result.assets[0].uri); // Log selected image URI
        const response = await updateProfileImage(user.email, type, result.assets[0].uri);
        if (type === 'profile') {
          setProfilePic(response.data.profilePic);
          console.log('Profile image updated:', response.data.profilePic);
          console.log(profilePic)
          Toast.show({ type: 'success', text1: 'Profile image updated!' });
        } else {
          setHeaderPic(response.data.headerPic);
          Toast.show({ type: 'success', text1: 'Header image updated!' });
        }
        onClose(); // Close the modal after updating
      } catch (error) {
        console.error('Failed to update image:', error);
        Toast.show({ type: 'error', text1: 'Failed to update image.' });
      }
    }
  };

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, displayName, bio, location, website, birthDate, profilePic, headerPic };
      onUpdateUser(updatedUser);
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={() => handleImagePick('header')}>
                <Image
                  source={{
                    uri: headerPic && typeof headerPic === 'string' ? headerPic : undefined,
                  }}
                  style={styles.modalHeaderImage}
                  onError={() => console.error('Failed to load header image.')}
                  onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    console.log('Header Image Dimensions:', { width, height });
                  }}
                />
              </TouchableOpacity>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={() => handleImagePick('profile')}>
                  <Image
                    source={{ uri: typeof profilePic === 'string' ? profilePic : undefined }}
                    style={styles.modalProfileImage}
                    onError={() => console.error('Failed to load profile image.')}
                    onLayout={(event) => {
                      const { width, height } = event.nativeEvent.layout;
                      console.log('Profile Image Dimensions:', { width, height });
                    }}
                  />
                  <View style={styles.cameraIconContainer}>
                    <FontAwesomeIcon icon={faCamera} size={20} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              placeholderTextColor="#888"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a short bio"
              placeholderTextColor="#888"
              value={bio}
              onChangeText={setBio}
              multiline
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your location"
              placeholderTextColor="#888"
              value={location}
              onChangeText={setLocation}
            />
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your website"
              placeholderTextColor="#888"
              value={website}
              onChangeText={setWebsite}
            />
            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your birth date"
              placeholderTextColor="#888"
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
