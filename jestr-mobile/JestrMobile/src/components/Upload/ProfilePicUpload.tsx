// ProfilePicUpload.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface ProfilePicUploadProps {
  onProfilePicChange: (file: File | null) => void;
  style?: ViewStyle; // Add this line to include a style prop
}

const ProfilePicUpload = ({ onProfilePicChange }: ProfilePicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProfilePicChange = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      if (file.type === 'image/jpeg' && file.uri) {
        setPreviewUrl(file.uri);
        onProfilePicChange(file as unknown as File);
        setErrorMessage('');
      } else {
        setErrorMessage('Only JPEG files are allowed.');
        setPreviewUrl(null);
        onProfilePicChange(null);
      }
    } else {
      console.log('No file selected');
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  
  profilePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  plusIcon: {
    fontSize: 24,
    color: 'gray',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default ProfilePicUpload;