import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface VideoEditorProps {
  videoUri: string;
  onComplete: (editedUri: string, overlayText: string, textPosition: { x: number, y: number }, textSize: number, textColor: string, trimStart: number, trimEnd: number) => void;
}

const { width, height } = Dimensions.get('window');

const VideoEditor: React.FC<VideoEditorProps> = ({ videoUri, onComplete }) => {
  const [overlayText, setOverlayText] = useState('');
  const [textSize, setTextSize] = useState(20);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textPosition, setTextPosition] = useState({ x: width / 2, y: height * 0.3 });
  const [videoDuration, setVideoDuration] = useState(0);
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const videoRef = useRef<Video>(null);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: () => {
      setTextPosition({
        x: textPosition.x + (pan.x as any).__getValue(),
        y: textPosition.y + (pan.y as any).__getValue(),
      });
      pan.setOffset({ x: (pan.x as any).__getValue(), y: (pan.y as any).__getValue() });
      pan.setValue({ x: 0, y: 0 });
    },
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loadAsync({ uri: videoUri }, {}, false);
    }
  }, [videoUri]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !status.isPlaying) {
      setVideoDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setTrimEnd(status.durationMillis ? status.durationMillis / 1000 : 0);
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(videoUri, overlayText, textPosition, textSize, textColor, trimStart, trimEnd);
  };

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

  const toggleTrimMode = () => {
    setIsTrimMode(!isTrimMode);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.videoPreview}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={toggleTextInput} style={styles.iconButton}>
          <Ionicons name="text" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={cycleTextColor} style={styles.iconButton}>
          <Ionicons name="color-palette" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTrimMode} style={styles.iconButton}>
          <Ionicons name="cut" size={24} color="#FFFFFF" />
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

      {isTrimMode && (
        <View style={styles.trimContainer}>
          <Text style={styles.trimText}>{`Start: ${trimStart.toFixed(2)}s`}</Text>
          <Slider
            style={styles.trimSlider}
            minimumValue={0}
            maximumValue={videoDuration}
            value={trimStart}
            onValueChange={setTrimStart}
          />
          <Text style={styles.trimText}>{`End: ${trimEnd.toFixed(2)}s`}</Text>
          <Slider
            style={styles.trimSlider}
            minimumValue={0}
            maximumValue={videoDuration}
            value={trimEnd}
            onValueChange={setTrimEnd}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.overlayTextContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
            top: textPosition.y,
            left: textPosition.x,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={[styles.overlayText, { fontSize: textSize, color: textColor }]}>
          {overlayText}
        </Text>
      </Animated.View>

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
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  videoPreview: {
    width: '100%',
    height: height * 0.5, // Increased size to 50% of screen height
    borderRadius: 10,
    marginBottom: 20,
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
  trimContainer: {
    marginBottom: 20,
  },
  trimText: {
    color: '#fff',
    marginBottom: 5,
  },
  trimSlider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  overlayTextContainer: {
    position: 'absolute',
    padding: 10,
  },
  overlayText: {
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoEditor;