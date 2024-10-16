import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface VideoScannerProps {
  isScanning: boolean;
  containerHeight: number;
}

const VideoScanner: React.FC<VideoScannerProps> = ({ isScanning, containerHeight }) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: containerHeight,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [isScanning, containerHeight]);

  if (!isScanning) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY: scanLineAnim }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  scanLine: {
    height: 2,
    backgroundColor: 'red',
    width: '100%',
  },
});

export default VideoScanner;
