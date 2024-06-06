import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface HeaderPicUploadProps {
  onHeaderPicChange: (file: File | null) => void;
}

const HeaderPicUpload = ({ onHeaderPicChange }: HeaderPicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleHeaderPicChange = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      if (file.uri && file.type?.startsWith('image/')) {
        setPreviewUrl(file.uri);
        onHeaderPicChange(file as unknown as File);
        setErrorMessage('');
      } else {
        setErrorMessage('Only image files are allowed.');
        setPreviewUrl(null);
        onHeaderPicChange(null);
      }
    } else {
      console.log('No file selected');
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
    height: 170,
    width: '132%',
    borderTopLeftRadius: 20,  // Add rounded corners on the top left
    borderTopRightRadius: 20, // Add rounded corners on the top right
  },
  headerPreview: {
    width: '132%',
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
