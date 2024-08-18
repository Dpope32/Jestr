import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faSave, faShare, faFlag, faUser, faDownload } from '@fortawesome/free-solid-svg-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Toast, {BaseToast, BaseToastProps, ErrorToast , ToastConfig, ToastConfigParams } from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface LongPressModalProps {
    isVisible: boolean;
    onClose: () => void;
    meme: {
      id: string;
      url: string;
      caption: string;
    };
    onSaveToProfile: () => Promise<void>;
    onShare: () => void;
    onReport: () => void;
    user: any; // Replace 'any' with your User type
    memeID: string;
    isSaved: boolean;
    setIsSaved: React.Dispatch<React.SetStateAction<boolean>>;
    setCounts: React.Dispatch<React.SetStateAction<{
      likes: number;
      downloads: number;
      shares: number;
      comments: number;
    }>>;
  }

export const LongPressModal: React.FC<LongPressModalProps> = ({ 
  isVisible, 
  onClose, 
  meme, 
  onSaveToProfile,
  onShare,
  onReport
}) => {
  const scale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start(() => {
        // This callback ensures the modal is fully closed before resetting
        onClose();
      });
    }
  }, [isVisible, scale, onClose]);

  const copyLink = async () => {
    await Clipboard.setStringAsync(`https://jestr.com/meme/${meme.id}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({
      type: 'success',
      text1: 'Link Copied',
      text2: 'Meme link copied to clipboard',
    });
    onClose();
  };

  const saveToGallery = async () => {
    try {
      if (Platform.OS === 'android' && Platform.isTV) {
        console.log('Saving to gallery not supported on Android TV or emulators');
        Toast.show({
          type: 'info',
          text1: 'Gallery Save',
          text2: 'Saving to gallery is not supported on this device.',
        });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(meme.url);
          await MediaLibrary.createAlbumAsync('Jestr', asset, false);
          Toast.show({
            type: 'success',
            text1: 'Image Saved',
            text2: 'Successfully saved image to gallery!',
          });
        }
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save image to gallery.',
      });
    }
    onClose();
  };

  const handleSaveToProfile = () => {
    try {
      onSaveToProfile();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Toast.show({
        type: 'success',
        text1: 'Meme Saved',
        text2: 'Saved image to your gallery inside your profile',
      });
    } catch (error) {
      console.error('Error updating meme reaction:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save meme to profile',
      });
    }
    onClose();
  };

  
  

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.container}>
            <Animated.View style={[styles.modalContainer, { transform: [{ scale }] }]}>
            <TouchableWithoutFeedback onPress={onClose}>
              <View style={styles.memePreview}>
                <Image source={{ uri: meme.url }} style={styles.memeImage} resizeMode="contain" />
                {meme.caption && <Text style={styles.caption}>{meme.caption}</Text>}
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.optionsContainer}>
              {[
                { icon: faLink, text: 'Copy Link', onPress: copyLink, color: '#4A90E2' },
                { icon: faUser, text: 'Save to Profile', onPress: handleSaveToProfile, color: '#9370DB' },
                { icon: faSave, text: 'Save to Gallery', onPress: saveToGallery, color: '#50C878' },
                { icon: faShare, text: 'Share', onPress: onShare, color: '#FF69B4' },
                { icon: faFlag, text: 'Report', onPress: onReport, color: '#FF6347' },
              ].map((option, index) => (
                <TouchableOpacity key={index} style={styles.option} onPress={option.onPress}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                    <FontAwesomeIcon icon={option.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -200,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, 
    elevation: 999, // For Android
  },
  modalContainer: {
    width: width * 0.75,
    maxHeight: height,
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    zIndex: 10000,
    elevation: 1000,
    
  },
  memePreview: {
    width: '100%',
    height: height * 0.3,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 20,
  },
  memeImage: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    padding: 10,
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
