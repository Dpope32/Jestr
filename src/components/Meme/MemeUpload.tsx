import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCamera, faSyncAlt, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ImageLabeling from '@react-native-ml-kit/image-labeling';
import * as VideoThumbnails from 'expo-video-thumbnails';

import MediaEditor from './MediaEditor';
import { uploadMeme } from '../../services/memeService';
import { useBadgeStore } from '../../stores/badgeStore';
import VideoScanner from './VideoScanner';
import { useTabBarStore } from '../../stores/tabBarStore';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

interface MemeUploadProps {
  userEmail: string;
  username: string;
  onUploadSuccess: (url: string) => void;
  onImageSelect: (selected: boolean) => void;
  isDarkMode: boolean;
  creationDate: string;
  setIsUploading: (isUploading: boolean) => void;
  navigation: any;
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
  navigation,
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
  const [mediaContainerHeight, setMediaContainerHeight] = useState(0);

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
  
    if (media.type === 'image') {
      // For images, we handle the upload synchronously
      try {
        setIsUploading(true);
  
        const result = await uploadMeme(
          media.uri,       // The URI of the image
          userEmail,       // User's email
          username,        // User's username
          caption,         // Caption entered by the user
          [],              // Empty tags array for images
          'image',         // Media type is 'image'
          (progress: number) => {
            console.log(`Upload progress: ${progress}%`);
          }
        );
  
        setIsUploading(false);
  
        Toast.show({
          type: 'success',
          text1: 'Meme Uploaded',
          text2: 'Your meme has been uploaded successfully!',
        });
  
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
        });
      }
    } else if (media.type === 'video') {
      // For videos, we start the laser animation and upload in the background
      setIsScanning(true);
  
      // Start processing and uploading in the background
      (async () => {
        try {
          // Process the video to get labels
          await processVideoWithMLKit(media.uri, videoDuration || 0);
  
          const tags = mlKitResult?.labels || [];
  
          // Upload the meme with the obtained tags
          await uploadMeme(
            media.uri,       // The URI of the video
            userEmail,       // User's email
            username,        // User's username
            caption,         // Caption entered by the user
            tags,            // Tags obtained from ML Kit
            'video',         // Media type is 'video'
            (progress: number) => {
              console.log(`Upload progress: ${progress}%`);
            }
          );
  
          console.log('Video upload successful');
  
          // Increment Badge Counts
          badgeStore.incrementCount('memeCreationCount', userEmail);
          badgeStore.incrementCount('memeUploadCount', userEmail);
        } catch (error) {
          console.error('Upload failed:', error);
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: 'Please try again later.',
          });
        }
      })();
  
      // Do not await the above async function; let it run in the background
    }
  };
  

  const handleScanComplete = () => {
    setIsScanning(false);
    Toast.show({
      type: 'success',
      text1: 'Meme Uploaded',
      text2: 'Your meme is being processed and will be available shortly.',
    });
    navigation.goBack(); // Navigate away immediately
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    switch (media.type) {
      case 'image':
        return (
          <View
            style={styles.mediaContainer}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setMediaContainerHeight(height);
            }}
          >
            <Image source={{ uri: media.uri }} style={styles.media} resizeMode="contain" />
            {isScanning && (
              <VideoScanner
                isScanning={isScanning}
                containerHeight={mediaContainerHeight}
                onScanComplete={handleScanComplete} // Pass the callback
              />
            )}
          </View>
        );
        case 'video':
          return (
            <View
              style={styles.mediaContainer}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setMediaContainerHeight(height);
              }}
            >
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
              {isScanning && (
                <VideoScanner
                  isScanning={isScanning}
                  containerHeight={mediaContainerHeight}
                  onScanComplete={handleScanComplete} // Pass the callback
                />
              )}
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

  const toggleAIMode = () => {
    // Placeholder function for toggleAIMode
    console.log('toggleAIMode function called');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1C1C1C' : '#494949' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
              isDarkMode={isDarkMode}
            />
          ) : (
            <View style={{ flex: 1 }}>
              {media ? (
                <>
                  {renderMediaPreview()}
                  <TouchableOpacity style={styles.clearButton} onPress={clearMedia}>
                    <FontAwesomeIcon icon={faTimes} size={20} color="#fff" />
                  </TouchableOpacity>
                  {isScanning && (
                    <View style={styles.scanningOverlay}>
                      <ActivityIndicator size="large" color="#1bd40b" />
                      <Text style={styles.scanningText}>Processing video...</Text>
                    </View>
                  )}
                  <View style={styles.captionContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Add a caption (optional)"
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
                      disabled={!media || isScanning}
                    >
                      <Text style={styles.buttonText}>Upload Meme</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Selection options
                <View style={styles.selectionContainer}>
                  <Text style={styles.selectionTitle}>This better be funny!</Text>
                  <View style={styles.optionGrid}>
                    <TouchableOpacity onPress={pickMedia} style={styles.optionCard}>
                      <FontAwesomeIcon icon={faUpload} size={40} color="#1bd40b" />
                      <Text style={styles.optionText}>Upload Media</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleCameraMode} style={styles.optionCard}>
                      <FontAwesomeIcon icon={faCamera} size={40} color="#1bd40b" />
                      <Text style={styles.optionText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleAIMode} style={styles.optionCard}>
                      <FontAwesomeIcon icon={faSearch} size={40} color="#00FF00" />
                      <Text style={styles.optionText}>Find Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={true}
                      style={[styles.optionCard]}
                    >
                      <FontAwesomeIcon icon={faUpload} size={40} color="#555" />
                      <Text style={styles.optionTextDisabled}>Paste Link</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({

  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  scanningText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  selectionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  selectionTitle: {
    fontSize: 28,
    color: '#FFF',
    marginTop: -60,
    marginBottom: 50,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    textAlign: 'center',
  },
  optionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 24,
  },
  optionCard: {
    width: '45%',
    backgroundColor: '#333333',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  optionText: {
    marginTop: 10,
    color: '#999999',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionTextDisabled: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mediaContainer: {
    width: '100%',
    height: windowHeight * 0.62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 25,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  fullScreenCameraContainer: {
    width: windowWidth,
    height: windowHeight,
    position: 'absolute',
    top: -100,
    left: 0,
    backgroundColor: '#000',
  },
  fullScreenCamera: {
    width: windowWidth,
    height: windowHeight,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  captionContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    width: '100%',
    borderBottomWidth: 3,
    borderColor: '#1bd40b',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#1bd40b',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  overlayText: {
    position: 'absolute',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MemeUpload;
