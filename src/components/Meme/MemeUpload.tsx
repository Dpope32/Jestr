import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, ScrollView, Platform, Keyboard, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUpload, faCheck, faTags } from '@fortawesome/free-solid-svg-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { NavigationProp } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { Buffer } from 'buffer';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { uploadMeme } from '../../services/memeService';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import  styles  from './MemeUpload.styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Haptics from 'expo-haptics';

global.Buffer = global.Buffer || Buffer;

interface MemeUploadProps {
  userEmail: string;
  username: string;
  navigation: NavigationProp<any>;
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
  creationDate
}) => {
  const [media, setMedia] = useState<MediaState | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [profilePanelVisible, setProfilePanelVisible] = useState(false);
  const navigation = useNavigation();

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setMedia({ 
        uri: result.assets[0].uri, 
        type: result.assets[0].type === 'video' ? 'video' : 'image'
      });
      onImageSelect(true);
    }
  }, [onImageSelect]);

  const handleMediaTap = () => {
    if (media) {
      if (media.type === 'video') {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pauseAsync();
          } else {
            videoRef.current.playAsync();
          }
          setIsPlaying(!isPlaying);
        }
      } else {
        Alert.alert(
          "Replace Image",
          "Would you like to replace this image?",
          [
            { text: "No", style: "cancel" },
            { text: "Yes", onPress: pickMedia }
          ]
        );
      }
    } else {
      pickMedia();
    }
  };

  const handleUpload = async () => {
    if (!media) {
      Alert.alert("Error", "Please select a media file first");
      return;
    }
  
    setIsUploading(true);
    setUploadStage(0);
    
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim());
  
      const result = await uploadMeme(media.uri, userEmail, username, caption, tagsArray, media.type);
     // console.log('Upload result:', result);
  
      Toast.show({
        type: 'success',
        text1: 'Meme uploaded successfully!',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 100,
        bottomOffset: 40,
        props: { backgroundColor: '#333', textColor: '#00ff00' },
      });
      navigation.navigate('Feed' as never);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Upload Failed",
        "We couldn't upload your meme at this time. Please try again later.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    } finally {
      setIsUploading(false);
    }
  };
  
  const getUploadMessage = () => {
    switch (uploadStage) {
      case 0:
        return 'Uploading meme, please standby...';
      case 1:
        const creationDateObj = new Date(creationDate);
        const daysSinceCreation = Math.floor((new Date().getTime() - creationDateObj.getTime()) / (1000 * 60 * 60 * 24));
        return `Did you know you've been on Jestr for ${daysSinceCreation} days?`;
      case 2:
        return 'Almost there! Finalizing your meme...';
      default:
        return 'Upload complete!';
    }
  };

  const generateTags = () => {
    const words = caption.toLowerCase().split(' ');
    const generatedTags = words
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(', ');
    setTags(prevTags => prevTags ? `${prevTags}, ${generatedTags}` : generatedTags);
  };

  if (isUploading) {
    return (
      <>
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../../assets/animations/loading-animation.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.uploadingText}>{getUploadMessage()}</Text>
          </View>
        </BlurView>
      </>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === 'ios' ? 175 : 150}  // Adjust this value as needed
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="always"  // Ensure taps are handled properly
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <TouchableOpacity style={styles.mediaContainer} onPress={handleMediaTap}>
            {media ? (
              media.type === 'video' ? (
                <Video
                  ref={videoRef}
                  source={{ uri: media.uri }}
                  style={styles.media}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  shouldPlay={false}
                  onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                    if (status.isLoaded) {
                      setIsPlaying(status.isPlaying);
                    }
                  }}
                />
              ) : (
                <Image source={{ uri: media.uri }} style={styles.media} />
              )
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
            onFocus={() => {
              // Optional: Additional actions on focus if needed
            }}
          />
  
          <View style={styles.tagsContainer}>
            <TextInput
              style={[styles.input, styles.tagsInput]}
              placeholder="# (optional)"
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
              onFocus={() => {
                // Optional: Additional actions on focus if needed
              }}
            />
            <TouchableOpacity style={styles.generateTagsButton} onPress={generateTags}>
              <FontAwesomeIcon icon={faTags} size={20} color="#1bd40b" />
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity 
            style={[styles.uploadButton, !media && styles.uploadButtonDisabled]} 
            onPress={handleUpload} 
            disabled={!media || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Upload Meme</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
  
  
  
};

export default MemeUpload;
