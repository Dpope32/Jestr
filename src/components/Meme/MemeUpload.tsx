import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCamera, faSyncAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ImageLabeling from '@react-native-ml-kit/image-labeling';
import VideoThumbnails from 'expo-video-thumbnails';

import { TOAST_TOP_POSITION } from '../../config/toastConfig';
import styles from './MemeUpload.styles';
import MediaEditor from './MediaEditor';
import { uploadMeme } from '../../services/memeService';
import { useBadgeStore } from '../../stores/badgeStore';
import VideoScanner from './VideoScanner';
import { useTabBarStore } from '../../stores/tabBarStore';

interface MemeUploadProps {
  userEmail: string;
  username: string;
  onUploadSuccess: (url: string) => void;
  onImageSelect: (selected: boolean) => void;
  isDarkMode: boolean;
  creationDate: string;
  setIsUploading: (isUploading: boolean) => void;
}

type MLKitResult = {
  labels: string[];
  text: string;
};

interface MediaState {
  uri: string;
  type: 'image' | 'video';
}

const MemeUpload: React.FC<MemeUploadProps> = ({
  userEmail,
  username,
  onUploadSuccess,
  onImageSelect,
  setIsUploading,
  isDarkMode,
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
  const [mlKitResult, setMlKitResult] = useState<MLKitResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef<Camera>(null);
  const setTabBarVisible = useTabBarStore((state) => state.setTabBarVisible);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

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

        // Ensure tab bar is visible when screen loses focus
        setTabBarVisible(true);
      };
    }, [])
  );

  useEffect(() => {
    // Sync tab bar visibility with camera mode
    setTabBarVisible(!isCameraMode);
  }, [isCameraMode]);

  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    const cameraPermission = await Camera.requestCameraPermission();

    if (mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your media library and camera to use this feature.'
      );
      return false;
    }
    return true;
  };

  const pickMedia = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      videoMaxDuration: 120,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('Selected asset:', JSON.stringify(asset, null, 2));

      if (asset.type === 'video') {
        const durationInMilliseconds = asset.duration ? asset.duration : 0;
        setVideoDuration(durationInMilliseconds);

        if (durationInMilliseconds > 120000) {
          Alert.alert('Error', 'Videos cannot be longer than 120 seconds.');
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

  const processVideoWithMLKit = async (uri: string, durationInMilliseconds: number) => {
    setIsScanning(true);
    try {
      console.log('Processing video with MLKit...');
      // Extract frames from the video
      const frames = await extractFramesFromVideo(uri, durationInMilliseconds);

      const labelsSet = new Set<string>();

      for (const frame of frames) {
        const result = await ImageLabeling.label(frame);
        result.forEach((label: any) => labelsSet.add(label.text));
        console.log('Labels for frame:', result.map((label: any) => label.text));
      }

      setMlKitResult({
        labels: Array.from(labelsSet),
        text: '',
      });

      console.log('Video labels:', Array.from(labelsSet));
    } catch (error) {
      console.error('Error processing video with ML Kit:', error);
      Alert.alert('Error', 'Failed to process video. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Function to extract frames from the video
  const extractFramesFromVideo = async (
    uri: string,
    durationInMilliseconds: number
  ): Promise<string[]> => {
    try {
      const frameCount = 5;
      const frameUris: string[] = [];
      for (let i = 1; i <= frameCount; i++) {
        const time = (durationInMilliseconds / (frameCount + 1)) * i;
        const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(uri, {
          time,
          quality: 0.5,
        });
        frameUris.push(frameUri);
      }
      return frameUris;
    } catch (error) {
      console.error('Error extracting frames:', error);
      return [];
    }
  };

  const toggleCameraMode = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsCameraMode(!isCameraMode);
  };

  const flipCamera = () => {
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });

        setMedia({
          uri: 'file://' + photo.path,
          type: 'image',
        });
        onImageSelect(true);
        setIsCameraMode(false);
        setIsEditing(true);
      } catch (error) {
        console.error('Failed to take photo:', error);
        Alert.alert('Error', 'Failed to take photo');
      }
    } else {
      Alert.alert('Error', 'Camera not ready');
    }
  };

  const handleUpload = async () => {
    if (!media) {
      Alert.alert('Error', 'Please select a media file first');
      return;
    }
    try {
      setIsUploading(true);

      let tags: string[] = [];

      if (media.type === 'video') {
        if (videoDuration) {
          await processVideoWithMLKit(media.uri, videoDuration);
          tags = mlKitResult?.labels || [];
        } else {
          console.error('Video duration is not available');
        }
      }

      const result = await uploadMeme(
        media.uri,
        userEmail,
        username,
        caption,
        tags,
        media.type,
        (progress: number) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );
      setIsUploading(false);
      if (result.status === 'processing') {
        Toast.show({
          type: 'success',
          text1: 'Meme Uploaded',
          text2: 'Your meme is being processed and will be available shortly.',
          position: 'top',
          visibilityTime: 3000,
          topOffset: TOAST_TOP_POSITION,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Meme Uploaded',
          text2: 'Your meme has been uploaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          topOffset: TOAST_TOP_POSITION,
        });
      }
      onUploadSuccess(result.url);

      // Increment Badge Counts
      badgeStore.incrementCount('memeCreationCount', userEmail);
      badgeStore.incrementCount('memeUploadCount', userEmail);
    } catch (error) {
      setIsUploading(false);
      console.error('Upload failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Please try again later.',
        position: 'top',
        visibilityTime: 3000,
        topOffset: TOAST_TOP_POSITION,
      });
    }
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    switch (media.type) {
      case 'image':
        return (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: media.uri }} style={styles.media} resizeMode="contain" />
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
                volume={1}
              />
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
    setOverlayText(''); // Clear overlayText to prevent double rendering
    setTextPosition(position);
    setTextSize(24 * scale);
    setTextColor(color);
    setIsEditing(false);
  };

  const handleMediaEditorCancel = () => {
    setIsEditing(false);
    setMedia(null);
    onImageSelect(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1e1e1e' : '#494949' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {isCameraMode ? (
          device ? (
            <View style={styles.fullScreenCameraContainer}>
              <Camera
                style={styles.fullScreenCamera}
                device={device}
                isActive={true}
                ref={cameraRef}
                photo={true}
              />
              <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
                <FontAwesomeIcon icon={faSyncAlt} size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={captureImage} />
              <TouchableOpacity style={styles.closeButton} onPress={toggleCameraMode}>
                <FontAwesomeIcon icon={faTimes} size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text>Loading camera...</Text>
          )
        ) : isEditing && media ? (
          <MediaEditor
            media={media}
            setMedia={setMedia}
            onComplete={handleMediaEditorComplete}
            onCancel={handleMediaEditorCancel}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {media ? (
              <>
                {renderMediaPreview()}
                <TouchableOpacity style={styles.clearButton} onPress={clearMedia}>
                  <FontAwesomeIcon icon={faTimes} size={20} color="#fff" />
                </TouchableOpacity>
                {media.type === 'video' && (
                  <VideoScanner
                    isScanning={isScanning}
                    containerHeight={styles.mediaContainer.height}
                  />
                )}
                <View style={styles.captionContainer}>
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
                    style={styles.uploadButton}
                    onPress={handleUpload}
                    disabled={!media}
                  >
                    <Text style={styles.buttonText}>Upload Meme</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>Select an Option</Text>
                <View style={styles.optionGrid}>
                  <TouchableOpacity onPress={pickMedia} style={styles.optionCard}>
                    <FontAwesomeIcon icon={faUpload} size={40} color="#1bd40b" />
                    <Text style={styles.optionText}>Upload Media</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleCameraMode} style={styles.optionCard}>
                    <FontAwesomeIcon icon={faCamera} size={40} color="#1bd40b" />
                    <Text style={styles.optionText}>Take Photo</Text>
                  </TouchableOpacity>
                  {/* Future option for pasting a link */}
                  <TouchableOpacity
                    disabled={true}
                    style={[styles.optionCard, styles.disabledCard]}
                  >
                    <FontAwesomeIcon icon={faUpload} size={40} color="#555" />
                    <Text style={styles.optionTextDisabled}>Paste Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default MemeUpload;
