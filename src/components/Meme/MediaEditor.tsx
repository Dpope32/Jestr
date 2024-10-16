// src/components/Meme/MediaEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { captureRef } from 'react-native-view-shot';

interface MediaState {
  uri: string;
  type: 'image' | 'video';
}

interface MediaEditorProps {
  media: {
    uri: string;
    type: 'image' | 'video';
  };
  setMedia: React.Dispatch<React.SetStateAction<MediaState | null>>; // Add this line
  onComplete: (
    editedUri: string,
    overlayText: string,
    textPosition: { x: number; y: number },
    textScale: number,
    textColor: string
  ) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');

const MediaEditor: React.FC<MediaEditorProps> = ({ media, onComplete, onCancel }) => {
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(true);
  const [isCropping, setIsCropping] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const mediaRef = useRef<View>(null);
  const [mediaSize, setMediaSize] = useState({ width: width, height: height * 0.7 });
  const [textSize, setTextSize] = useState({ width: 0, height: 0 });

  const lastScale = useRef(1);
  const currentPosition = useRef({ x: 0, y: 0 });

  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  // Center the text overlay when media and text sizes are known
  useEffect(() => {
    if (
      mediaSize.width > 0 &&
      mediaSize.height > 0 &&
      textSize.width > 0 &&
      textSize.height > 0
    ) {
      const centerX = (mediaSize.width - textSize.width * lastScale.current) / 2;
      const centerY = (mediaSize.height - textSize.height * lastScale.current) / 2;
      pan.setValue({ x: centerX, y: centerY });
    }
  }, [mediaSize, textSize]);

  // Listeners for pan and scale values
  useEffect(() => {
    const xListenerId = pan.x.addListener(({ value }) => {
      currentPosition.current.x = value;
    });
    const yListenerId = pan.y.addListener(({ value }) => {
      currentPosition.current.y = value;
    });

    const scaleListenerId = scale.addListener(({ value }) => {
      lastScale.current = value;
    });

    return () => {
      pan.x.removeListener(xListenerId);
      pan.y.removeListener(yListenerId);
      scale.removeListener(scaleListenerId);
    };
  }, [pan.x, pan.y, scale]);

  const handleCropPress = async () => {
    try {
   //   const croppedImage = await ImagePicker.openCropper({
    //    path: media.uri,
   //     width: 300,
   //     height: 400,
   //   });
      console.log('need to implement');
    //  setMedia({ uri: croppedImage.path, type: 'image' });
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image.');
    }
  };

  // PanResponder for handling text overlay interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => overlayText !== '',
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => overlayText !== '',
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (evt) => {
      pan.setOffset({
        x: currentPosition.current.x,
        y: currentPosition.current.y,
      });
      pan.setValue({ x: 0, y: 0 });

      if (evt.nativeEvent.touches.length === 2) {
        const touches = evt.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        initialDistance.current = Math.sqrt(dx * dx + dy * dy);
        initialScale.current = lastScale.current;
      } else {
        initialDistance.current = null;
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.touches.length === 2 && initialDistance.current) {
        const touches = evt.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scaleFactor = (distance / initialDistance.current) * initialScale.current;
        scale.setValue(scaleFactor);
      } else if (evt.nativeEvent.touches.length === 1) {
        const newX = gestureState.dx + currentPosition.current.x;
        const newY = gestureState.dy + currentPosition.current.y;

        // Constrain the text within the media bounds
        const constrainedX = Math.max(
          0,
          Math.min(newX, mediaSize.width - textSize.width * lastScale.current)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, mediaSize.height - textSize.height * lastScale.current)
        );

        pan.x.setValue(constrainedX - currentPosition.current.x);
        pan.y.setValue(constrainedY - currentPosition.current.y);
      }
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
      initialDistance.current = null;
    },
  });

  // Cycle through predefined text colors
  const cycleTextColor = () => {
    Haptics.selectionAsync();
    const colors = ['#FFFFFF', '#FF5733', '#33FF57', '#3357FF', '#F1C40F'];
    const currentIndex = colors.indexOf(textColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setTextColor(colors[nextIndex]);
  };

  // Toggle visibility of text input
  const toggleTextInput = () => {
    setIsTextInputVisible(!isTextInputVisible);
  };

  // Handle completion of editing
  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (media.type === 'image') {
      const result = await captureRef(mediaRef, {
        format: 'png',
        quality: 1,
      });

      const editedUri = result;

      onComplete(
        editedUri,
        overlayText,
        { x: currentPosition.current.x, y: currentPosition.current.y },
        lastScale.current,
        textColor
      );
    } else {
      onComplete(
        media.uri,
        overlayText,
        { x: currentPosition.current.x, y: currentPosition.current.y },
        lastScale.current,
        textColor
      );
    }
  };

  // Handle keyboard visibility
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Media Preview Section */}
          <View
            ref={mediaRef}
            style={styles.mediaPreview}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setMediaSize({ width, height });
            }}
          >
            {media.type === 'video' ? (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  setShouldPlay((prev) => !prev);
                }}
              >
                <Video
                  source={{ uri: media.uri }}
                  style={styles.media}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={shouldPlay}
                  isLooping
                  useNativeControls={false}
                  isMuted={false}
                  volume={1}
                />
              </TouchableOpacity>
            ) : (
              <Image source={{ uri: media.uri }} style={styles.media} />
            )}
            {overlayText !== '' && (
              <Animated.Text
                style={[
                  styles.overlayText,
                  {
                    color: textColor,
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: scale },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setTextSize({ width, height });
                }}
              >
                {overlayText}
              </Animated.Text>
            )}
          </View>

          {/* Controls Section */}
          <View style={styles.controlsContainer}>
            {/* Text Input Toggle Button */}
            <TouchableOpacity onPress={toggleTextInput} style={styles.iconButton}>
              <Ionicons name="text" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Text Color Cycle Button */}
            <TouchableOpacity onPress={cycleTextColor} style={styles.iconButton}>
              <Ionicons name="color-palette" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Crop Image Button */}
            {media.type === 'image' && (
              <TouchableOpacity onPress={handleCropPress} style={styles.iconButton} disabled={true}>
                <Ionicons name="crop" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Future Feature Button */}
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="happy-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Text Input Section */}
          {isTextInputVisible && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Add overlay text"
                placeholderTextColor="#999"
                value={overlayText}
                onChangeText={setOverlayText}
                onSubmitEditing={() => setIsTextInputVisible(false)}
                autoFocus
              />
            </View>
          )}

          {/* "Done Editing" Button */}
          <View
            style={[
              styles.doneButtonContainer,
              { marginTop: isTextInputVisible ? 20 : 10 },
            ]}
          >
            <TouchableOpacity style={styles.doneButton} onPress={handleComplete}>
              <Text style={styles.buttonText}>Done Editing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  cancelButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  mediaPreview: {
    width: '100%',
    height: height * 0.62,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  textInputContainer: {
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 15
  },
  textInput: {
    height: 50,
    borderColor: '#1bd40b',
    borderWidth: 2,
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#3a3a3a',
  },
  overlayText: {
    position: 'absolute',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  doneButtonContainer: {
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1bd40b',
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MediaEditor;
