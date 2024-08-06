import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface HeaderPicUploadProps {
  onHeaderPicChange: (file: string | null) => void;
}

const HeaderPicUpload = ({ onHeaderPicChange }: HeaderPicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleHeaderPicChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setPreviewUrl(result.assets[0].uri);
      onHeaderPicChange(result.assets[0].uri);
      setErrorMessage('');
    } else {
      console.log('No image selected');
      setPreviewUrl(null);
      onHeaderPicChange(null);
      setErrorMessage('');
    }
  };

  return (
    <TouchableOpacity style={styles.headerPicUpload} onPress={handleHeaderPicChange}>
      {previewUrl ? (
        <Image style={styles.headerPreview} source={{ uri: previewUrl }} />
      ) : (
        <Text style={styles.headerPicLabel}>Click here to upload a header</Text>
      )}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerPicUpload: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    height: 250,
    marginTop: 50,
    width: '100%',
    borderTopLeftRadius: 20,  // Add rounded corners on the top left
    borderTopRightRadius: 20, // Add rounded corners on the top right
  },
  headerPreview: {
    width: '100%',
    height: '110%',
    resizeMode: 'cover',
    borderTopLeftRadius: 20,  // Add rounded corners on the top left
    borderTopRightRadius: 20, // Add rounded corners on the top right
  },
  headerPicLabel: {
    fontSize: 16,
    color: 'gray',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
});

export default HeaderPicUpload;
