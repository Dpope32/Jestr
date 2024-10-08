// src/components/Meme/MediaEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, PanResponder, Animated, Image, GestureResponderEvent, LayoutChangeEvent,} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme'; 
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
  const mediaRef = useRef<View>(null);
  const [mediaSize, setMediaSize] = useState({ width: width, height: height * 0.5 });
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

  // PanResponder for handling text overlay interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => overlayText !== '',
    onPanResponderGrant: (evt: GestureResponderEvent) => {
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
    onPanResponderMove: (evt: GestureResponderEvent, gestureState) => {
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

        // Expanded constraints (twice the media size, centered)
        const constrainedX = Math.max(
          -mediaSize.width / 2,
          Math.min(newX, mediaSize.width * 1.5 - textSize.width * lastScale.current)
        );
        const constrainedY = Math.max(
          -mediaSize.height / 2,
          Math.min(newY, mediaSize.height * 1.5 - textSize.height * lastScale.current)
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

  return (
    <View style={styles.container}>
      {/* Media Preview Section */}
      <View
        ref={mediaRef}
        style={styles.mediaPreview}
        onLayout={(event: LayoutChangeEvent) => {
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'flex-start',
  },
  mediaPreview: {
    width: '100%',
    height: height * 0.5, 
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 15, 
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
    backgroundColor: '#1C1C1C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, 
  },
  textInputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  textInput: {
    height: 50,
    borderColor: '#1bd40b',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
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
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1bd40b',
  },
  buttonText: {
    color: COLORS.primary, 
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MediaEditor;
