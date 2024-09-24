import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCheck } from '@fortawesome/free-solid-svg-icons';

import styles from './MemeUpload.styles';
import VideoEditor from './VideoEditor';
import { uploadMeme } from '../../services/memeService';

interface MemeUploadProps {
  userEmail: string;
  username: string;
  onUploadSuccess: (url: string) => void;
  onImageSelect: (selected: boolean) => void;
  isDarkMode: boolean;
  creationDate: string;
}

interface MediaState {
  uri: string;
  type: 'image' | 'video';
}

const MemeUpload: React.FC<MemeUploadProps> = ({
  userEmail,
  username,
  onUploadSuccess,
  onImageSelect,
  isDarkMode,
  creationDate,
}) => {
  const [media, setMedia] = useState<MediaState | null>(null);
  const [caption, setCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const videoRef = useRef<Video>(null);

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setMedia({
        uri: result.assets[0].uri,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
      });
      onImageSelect(true);
      if (result.assets[0].type === 'video') {
        setIsEditing(true);
      }
    }
  }, [onImageSelect]);

  const handleUpload = async () => {
    if (!media) {
      Alert.alert('Error', 'Please select a media file first');
      return;
    }

    try {
      const result = await uploadMeme(
        media.uri,
        userEmail,
        username,
        caption,
        [], // Empty array for tags, will be generated on the server
        media.type,
      );
      onUploadSuccess(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again later.');
    }
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    switch (media.type) {
      case 'image':
        return <Image source={{ uri: media.uri }} style={styles.media} />;
      case 'video':
        return (
          <Video
            ref={videoRef}
            source={{ uri: media.uri }}
            style={styles.media}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={false}
            isMuted={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {isEditing && media?.type === 'video' ? (
        <VideoEditor
          videoUri={media.uri}
          onComplete={(editedUri: string) => {
            setMedia({ ...media, uri: editedUri });
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <TouchableOpacity style={styles.mediaContainer} onPress={pickMedia}>
            {media ? (
              renderMediaPreview()
            ) : (
              <View style={styles.uploadPrompt}>
                <FontAwesomeIcon icon={faUpload} size={50} color="#1bd40b" />
                <Text style={styles.uploadText}>Tap to upload</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Add a caption..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
          />

          <TouchableOpacity
            style={[styles.uploadButton, !media && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={!media}
          >
            <FontAwesomeIcon
              icon={faCheck}
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Upload Meme</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAwareScrollView>
  );
};

export default MemeUpload;