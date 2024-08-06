import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePicUploadProps {
  onProfilePicChange: (file: string | null) => void;
  style?: ViewStyle;
}

const ProfilePicUpload = ({ onProfilePicChange }: ProfilePicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProfilePicChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setPreviewUrl(result.assets[0].uri);
      onProfilePicChange(result.assets[0].uri);
      setErrorMessage('');
    } else {
      console.log('No image selected');
      setPreviewUrl(null);
      onProfilePicChange(null);
      setErrorMessage('');
    }
  };

  return (
    <TouchableOpacity style={styles.profilePicBtn} onPress={handleProfilePicChange}>
      {previewUrl ? (
        <Image style={styles.profilePreview} source={{ uri: previewUrl }} />
      ) : (
        <Text style={styles.plusIcon}>+</Text>
      )}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profilePicBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    top: '22%',
    zIndex: 4,
    left: '5%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  plusIcon: {
    fontSize: 40,
    color: 'gray',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default ProfilePicUpload;
