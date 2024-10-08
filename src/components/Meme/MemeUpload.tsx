import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as MediaLibrary from 'expo-media-library';

import styles from './MemeUpload.styles';
import MediaEditor from './MediaEditor';
import { uploadMeme } from '../../services/memeService';
import { useBadgeStore } from '../../stores/badgeStore';

interface MemeUploadProps {
  userEmail: string;
  username: string;
  onUploadSuccess: (url: string) => void;
  onImageSelect: (selected: boolean) => void;
  isDarkMode: boolean;
  creationDate: string;
  setIsUploading: (isUploading: boolean) => void;
}

interface MediaState { uri: string; type: 'image' | 'video';}

const MemeUpload: React.FC<MemeUploadProps> = ({
  userEmail,
  username,
  onUploadSuccess,
  onImageSelect,
  setIsUploading,
}) => {
  const [media, setMedia] = useState<MediaState | null>(null);
  const [caption, setCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(24);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [shouldPlay, setShouldPlay] = useState(true);
  const badgeStore = useBadgeStore();
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
      allowsEditing: true,
      videoMaxDuration: 120,
      quality: 1,
    });

  //  console.log('Image picker result:', JSON.stringify(result, null, 2));

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('Selected asset:', JSON.stringify(asset, null, 2));

      if (asset.type === 'video') {
        const durationInMilliseconds = asset.duration ? asset.duration : 0;
    //    console.log('Video duration (milliseconds):', durationInMilliseconds);

        if (durationInMilliseconds > 120000) {
     //     console.log('Video duration exceeds limit');
          Alert.alert('Error', 'Videos cannot be longer than 120 seconds.');
          return;
        } else {
     //     console.log('Video duration within limit');
        }
      }

      setMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
      });
      onImageSelect(true);
      setIsEditing(true);
    } else {
   //   console.log('Media selection cancelled or failed');
    }
  }, [onImageSelect]);

  const handleUpload = async () => {
    if (!media) {
      Alert.alert('Error', 'Please select a media file first');
      return;
    }
  
    try {
      setIsUploading(true);
      const result = await uploadMeme(
        media.uri,
        userEmail,
        username,
        caption,
        [],
        media.type
      );
      setIsUploading(false);
      onUploadSuccess(result.url);
      await badgeStore.checkMemeMasterBadge(userEmail);
      await badgeStore.checkMemeCreatorBadge(userEmail);
    } catch (error) {
      setIsUploading(false);
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again later.');
    }
  };

  const renderMediaPreview = () => {
    if (!media) return null;
    console.log('Rendering media preview:', media);

    switch (media.type) {
      case 'image':
        return (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: media.uri }} style={styles.media} resizeMode="contain" />
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
          </View>
        );
      case 'video':
        return (
          <View style={styles.mediaContainer}>
            <TouchableOpacity
              onPress={() => {
                setShouldPlay((prev) => !prev);
              }}
              style={styles.media}
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
          </View>
        );
      default:
        return null;
    }
  };

  const handleMediaEditorComplete = (
    editedUri: string,
    text: string,
    position: { x: number; y: number },
    scale: number,
    color: string
  ) => {
    console.log('onComplete called with:', {
      editedUri,
      text,
      position,
      scale,
      color,
    });
    setMedia({ ...media!, uri: editedUri });
    setOverlayText(text);
    setTextPosition(position);
    setTextSize(24 * scale); 
    setTextColor(color);
    setIsEditing(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {isEditing && media ? (
            <MediaEditor media={media} onComplete={handleMediaEditorComplete} />
          ) : (
            <>
              <View style={styles.mediaContainer}>
                {media ? (
                  <>
                    {renderMediaPreview()}
                    <TouchableOpacity style={styles.clearButton} onPress={clearMedia}>
                      <FontAwesomeIcon icon={faTimes} size={20} color="#fff" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={pickMedia} style={styles.uploadPrompt}>
                    <FontAwesomeIcon icon={faUpload} size={50} color="#1bd40b" />
                    <Text style={styles.uploadText}>Upload media to get started</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Add a caption..."
                placeholderTextColor="#999"
                value={caption}
                onChangeText={setCaption}
                multiline
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                style={[styles.uploadButton, !media && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={!media}
              >
                <Text style={[styles.buttonText, !media && styles.buttonTextDisabled]}>
                  Upload Meme
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default MemeUpload;
