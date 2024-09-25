import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput,Alert, Animated} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import * as MediaLibrary from 'expo-media-library'

import styles from './MemeUpload.styles';
import MediaEditor from './MediaEditor';
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
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(24);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [shouldPlay, setShouldPlay] = useState(true);

  const videoRef = useRef<Video>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Reset state when screen loses focus
        setMedia(null);
        setCaption('');
        setIsEditing(false);
        setOverlayText('');
        setTextColor('#FFFFFF');
        setTextSize(24);
        setTextPosition({ x: 0, y: 0 });
        onImageSelect(false);
      };
    }, [])
  );


// Add this function to your component
const requestPermissions = async () => {
  const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
  const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (mediaLibraryStatus !== 'granted' || cameraRollStatus !== 'granted') {
    Alert.alert('Permission required', 'Please allow access to your media library to use this feature.');
    return false;
  }
  return true;
};

const pickMedia = useCallback(async () => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true, // Enable editing (video trimming)
    videoMaxDuration: 120,
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets[0]) {
    const asset = result.assets[0];

    if (asset.type === 'video') {
      const durationInSeconds = asset.duration ? asset.duration / 1000 : 0;

      if (durationInSeconds > 90) {
        Alert.alert('Error', 'Videos cannot be longer than 90 seconds.');
        return;
      }
    }

    setMedia({
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
    });
    onImageSelect(true);
    setIsEditing(true);
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
        [],
        media.type
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
        return (
          <View>
            <Image source={{ uri: media.uri }} style={styles.media} />
            {/* No need to render overlayText here since it's part of the image */}
          </View>
        );
      case 'video':
        return (
          <TouchableOpacity
            onPress={() => {
              setShouldPlay((prev) => !prev);
            }}
          >
            <Video
              ref={videoRef}
              source={{ uri: media.uri }}
              style={styles.media}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay={shouldPlay}
              isMuted={false}
            />
            {overlayText !== '' && (
              <Animated.Text
                style={[
                  styles.overlayText,
                  {
                    color: textColor,
                    fontSize: textSize,
                    top: textPosition.y,
                    left: textPosition.x,
                  },
                ]}
              >
                {overlayText}
              </Animated.Text>
            )}
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };
  

  const clearMedia = () => {
    setMedia(null);
    setCaption('');
    setOverlayText('');
    setTextColor('#FFFFFF');
    setTextSize(24);
    setTextPosition({ x: 0, y: 0 });
    onImageSelect(false);
  };

  return (
    <View style={styles.container}>
      {isEditing && media ? (
        <MediaEditor
          media={media}
          onComplete={(
            editedUri: string,
            text: string,
            position: { x: number; y: number },
            size: number,
            color: string
          ) => {
            setMedia({ ...media, uri: editedUri });
            setOverlayText(text);
            setTextPosition(position);
            setTextSize(size);
            setTextColor(color);
            setIsEditing(false);
          }}
        />

      ) : (
        <>
          <TouchableOpacity style={styles.mediaContainer} onPress={pickMedia}>
            {media ? (
              <>
                {renderMediaPreview()}
                <TouchableOpacity style={styles.clearButton} onPress={clearMedia}>
                  <FontAwesomeIcon icon={faTimes} size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.uploadPrompt}>
                <FontAwesomeIcon icon={faUpload} size={50} color="#1bd40b" />
                <Text style={styles.uploadText}>Upload media to get started</Text>
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
            <FontAwesomeIcon icon={faCheck} size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Upload Meme</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default MemeUpload;
