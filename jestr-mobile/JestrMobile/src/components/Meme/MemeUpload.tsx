import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, Text, StyleSheet, Image, TextInput } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { uploadMeme } from './memeService';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCrop, faFilter } from '@fortawesome/free-solid-svg-icons';

type MemeUploadProps = {
  onUploadSuccess: (url: string) => void;
  userEmail: string;
};

const MemeUpload: React.FC<MemeUploadProps> = ({ onUploadSuccess, userEmail }) => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibrary({ mediaType: 'mixed' });
    if (result.assets && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
      // Allow for caption input after selecting an image
    }
  };

  const handleUpload = async () => {
    if (!image) return Alert.alert('Please select an image or video');

    try {
      const result = await uploadMeme(image, userEmail);
      onUploadSuccess(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload failed', 'Unable to upload the meme. Please try again.');
    }
  };

  const handleEdit = () => {
    Alert.alert('Edit', 'Image editing functionality coming soon.');
  };

 return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {image && (
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          placeholderTextColor="#999"
          onChangeText={setCaption}
          value={caption}
          multiline
          numberOfLines={3}
        />
      )}
      <View style={styles.actions}>
        {!image && (
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <FontAwesomeIcon icon={faUpload} style={styles.icon} />
            <Text style={styles.buttonText}>Upload</Text>
          </TouchableOpacity>
        )}
        {image && (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
              <FontAwesomeIcon icon={faCrop} style={styles.icon} />
              <Text style={styles.buttonText}>Crop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
              <FontAwesomeIcon icon={faFilter} style={styles.icon} />
              <Text style={styles.buttonText}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.uploadButtonText}>Finalize Upload</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
      borderRadius: 10,
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    image: {
      width: '100%',
      height: 300,
      marginBottom: 15,
      borderRadius: 15,
      borderColor: '#00a100',
      borderWidth: 2,
    },
    captionInput: {
      padding: 10,
      fontSize: 18,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 20,
      color: '#000',
      backgroundColor: '#fff',
      width: '100%',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
    },
    iconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#00a100',
      borderRadius: 8,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
    icon: {
      marginRight: 8,
      color: '#FFFFFF',
      fontSize: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    uploadButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#007700',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
    uploadButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });

export default MemeUpload;