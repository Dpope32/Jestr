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
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';


interface MediaEditorProps {
  media: {
    uri: string;
    type: 'image' | 'video';
  };
  onComplete: (
    editedUri: string,
    overlayText: string,
    textPosition: { x: number; y: number },
    textScale: number,
    textColor: string
  ) => void;
}

const { width, height } = Dimensions.get('window');

const MediaEditor: React.FC<MediaEditorProps> = ({ media, onComplete }) => {
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(true);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const mediaRef = useRef(null);


  const lastScale = useRef(1);
  const currentPosition = useRef({ x: 0, y: 0 });

  // Refs to store initial pinch distance and scale
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => overlayText !== '',
    onPanResponderGrant: (evt: GestureResponderEvent, gestureState) => {
      pan.setOffset({
        x: currentPosition.current.x,
        y: currentPosition.current.y,
      });
      pan.setValue({ x: 0, y: 0 });

      if (gestureState.numberActiveTouches === 2) {
        const touches = evt.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        initialDistance.current = Math.sqrt(dx * dx + dy * dy);
        initialScale.current = lastScale.current;
      } else {
        initialDistance.current = null;
      }
    },
    onPanResponderMove: (evt: GestureResponderEvent, gestureState) => {
      if (gestureState.numberActiveTouches === 2 && initialDistance.current) {
        // Handle pinch-to-zoom
        const touches = evt.nativeEvent.touches;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scaleFactor = (distance / initialDistance.current) * initialScale.current;
        scale.setValue(scaleFactor);
      } else if (gestureState.numberActiveTouches === 1) {
        // Handle drag
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState);
      }
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
      initialDistance.current = null;
    },
  });

  const cycleTextColor = () => {
    Haptics.selectionAsync();
    const colors = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    const currentIndex = colors.indexOf(textColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setTextColor(colors[nextIndex]);
  };

  const toggleTextInput = () => {
    setIsTextInputVisible(!isTextInputVisible);
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
        '', // Overlay text is now part of the image
        { x: 0, y: 0 },
        1,
        ''
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
  

  return (
    <View style={styles.container}>
        <View ref={mediaRef} style={styles.mediaPreview}>
        {media.type === 'video' ? (
          <TouchableOpacity
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
                  ...pan.getTranslateTransform(),
                  { scale: scale },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {overlayText}
          </Animated.Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleTextInput} style={styles.iconButton}>
          <Ionicons name="text" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={cycleTextColor} style={styles.iconButton}>
          <Ionicons name="color-palette" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        {/* Additional feature icon */}
        <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isTextInputVisible && (
        <TextInput
          style={styles.textInput}
          placeholder="Add overlay text"
          placeholderTextColor="#999"
          value={overlayText}
          onChangeText={setOverlayText}
          onEndEditing={() => setIsTextInputVisible(false)}
        />
      )}

      <TouchableOpacity style={styles.doneButton} onPress={handleComplete}>
        <Text style={styles.buttonText}>Done Editing</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mediaPreview: {
    width: '100%',
    height: height * 0.5, // Increased height to take up more screen
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconButton: {
    marginHorizontal: 15,
  },
  textInput: {
    height: 40,
    borderColor: '#1bd40b',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    color: '#fff',
  },
  overlayText: {
    position: 'absolute',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 30,
    left:  Dimensions.get('window').width * 0.22, // 50% of screen height
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
    width: '50%',
    borderWidth: 2,
    borderColor: '#1bd40b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MediaEditor;
