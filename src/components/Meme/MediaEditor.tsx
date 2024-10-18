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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { COLORS } from '../../theme/theme';
import { captureRef } from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import { useUserStore } from 'stores/userStore';

interface MediaState {
  uri: string;
  type: 'image' | 'video';
}

interface MediaEditorProps {
  media: MediaState;
  setMedia: React.Dispatch<React.SetStateAction<MediaState | null>>;
  onComplete: (
    editedUri: string,
    overlayText: string,
    textPosition: { x: number; y: number },
    textScale: number,
    textColor: string
  ) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

const { width, height } = Dimensions.get('window');

const MediaEditor: React.FC<MediaEditorProps> = ({
  media,
  onComplete,
  onCancel,
  isDarkMode,
}) => {
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [isColorSliderVisible, setIsColorSliderVisible] = useState(false);
  const [isCcOverlay, setIsCcOverlay] = useState(false);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const mediaRef = useRef<View>(null);
  const [mediaSize, setMediaSize] = useState({
    width: width,
    height: height * 0.67,
  });
  const [textSize, setTextSize] = useState({ width: 0, height: 0 });

  const lastScale = useRef(1);
  const currentPosition = useRef({ x: 0, y: 0 });

  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  const username = useUserStore((state) => state.username);

  useEffect(() => {
    if (
      mediaSize.width > 0 &&
      mediaSize.height > 0 &&
      textSize.width > 0 &&
      textSize.height > 0 &&
      !isCcOverlay
    ) {
      const centerX =
        (mediaSize.width - textSize.width * lastScale.current) / 2;
      const centerY =
        (mediaSize.height - textSize.height * lastScale.current) / 2;
      pan.setValue({ x: centerX, y: centerY });
    }
  }, [mediaSize, textSize, isCcOverlay]);

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
      console.log('Crop functionality not implemented yet.');
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image.');
    }
  };

  // HSV to RGB conversion
  const hsvToRgb = (h: number, s: number, v: number): string => {
    let r: number, g: number, b: number;
    let i = Math.floor(h / 60) % 6;
    let f = h / 60 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
      default:
        r = v;
        g = p;
        b = q;
        break;
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Updated handleColorChange function
  const handleColorChange = (value: number) => {
    let color;

    if (value <= 0.1) {
      const t = value / 0.1;
      const v = t;
      color = hsvToRgb(0, 1, v);
    } else if (value >= 0.9) {
      const t = (value - 0.9) / 0.1;
      const s = 1 - t;
      color = hsvToRgb(360, s, 1);
    } else {
      const t = (value - 0.1) / 0.8;
      const h = t * 360;
      color = hsvToRgb(h, 1, 1);
    }

    setTextColor(color);
  };

  const toggleColorSlider = () => {
    setIsColorSliderVisible(!isColorSliderVisible);
  };

  const toggleTextInput = () => {
    setIsTextInputVisible(!isTextInputVisible);
    if (isCcOverlay) {
      setIsCcOverlay(false);
    }
  };

  const handleCcPress = () => {
    if (!username) {
      Alert.alert('Error', 'Username not found.');
      return;
    }
    const ccText = `cc: ${username} @jextr`;
    setOverlayText(ccText);
    setIsCcOverlay(true);
    setIsColorSliderVisible(false);
    setIsTextInputVisible(false);
    const x = -40;
    const y = mediaSize.height - 40;
    pan.setValue({ x, y });
    scale.setValue(0.5);
  };

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

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => overlayText !== '',
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => overlayText !== '',
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      if (isCcOverlay) return;
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
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
      if (isCcOverlay) return;
  
      if (evt.nativeEvent.touches.length === 2 && initialDistance.current) {
        const touches = evt.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        const scaleFactor =
          (distance / initialDistance.current) * initialScale.current;
        scale.setValue(scaleFactor);
      } else if (evt.nativeEvent.touches.length === 1) {
        const layout = pan.getLayout();
        let newX = gestureState.dx + (layout.left as any)._value;
        let newY = gestureState.dy + (layout.top as any)._value;
  
        const maxX =
          mediaSize.width - textSize.width * lastScale.current;
        const maxY =
          mediaSize.height - textSize.height * lastScale.current;
  
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
  
        pan.x.setValue(newX - (layout.left as any)._value);
        pan.y.setValue(newY - (layout.top as any)._value);
      }
    },
    onPanResponderRelease: () => {
      if (isCcOverlay) return;
      pan.flattenOffset();
      initialDistance.current = null;
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={[styles.innerContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : '#494949' }]}>
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
              if (isCcOverlay) {
                const x = 10;
                const y = height - 40;
                pan.setValue({ x, y });
              }
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
                {...(isCcOverlay ? {} : panResponder.panHandlers)}
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

            {/* Text Color Slider Toggle Button */}
            <TouchableOpacity onPress={toggleColorSlider} style={styles.iconButton}>
              <Ionicons name="color-palette" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Crop Image Button */}
            {media.type === 'image' && (
              <TouchableOpacity
                onPress={handleCropPress}
                style={styles.iconButton}
                disabled={true}
              >
                <Ionicons name="crop" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Cc Button */}
            <TouchableOpacity onPress={handleCcPress} style={styles.iconButton}>
              <FontAwesome5 name="copyright" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Color Slider */}
          {isColorSliderVisible && (
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: '80%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                thumbTintColor={textColor}
                onValueChange={handleColorChange}
                value={0}
              />
              <TouchableOpacity onPress={toggleColorSlider}>
                <Ionicons name="checkmark-circle" size={32} color="#1bd40b" />
              </TouchableOpacity>
            </View>
          )}

          {/* Text Input Section */}
          {isTextInputVisible && (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Add overlay text"
                placeholderTextColor="#999"
                value={overlayText}
                onChangeText={(text) => {
                  setOverlayText(text);
                  if (isCcOverlay) {
                    setIsCcOverlay(false);
                  }
                }}
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
              <Text style={styles.buttonText}>Next</Text>
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
  },
  cancelButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  mediaPreview: {
    width: '100%',
    height: height * 0.6,
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
    paddingVertical: 10,
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
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  textInputContainer: {
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 15,
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
