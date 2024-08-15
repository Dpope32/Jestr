import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Dimensions, Platform, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faSave, faShare, faFlag, faUser, faDownload } from '@fortawesome/free-solid-svg-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';

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
    onClose();
  };

  const saveToGallery = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const asset = await MediaLibrary.createAssetAsync(meme.url);
      await MediaLibrary.createAlbumAsync('Jestr', asset, false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  const handleSaveToProfile = () => {
    onSaveToProfile();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <BlurView intensity={100} style={StyleSheet.absoluteFill}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
    zIndex: 4
  },
  modalContainer: {
    width: width * 0.75,
    maxHeight: height ,
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
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