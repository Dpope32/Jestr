import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoScannerProps {
  isScanning: boolean;
  containerHeight: number;
  onScanComplete: () => void; // Add a callback prop
}

const VideoScanner: React.FC<VideoScannerProps> = ({ isScanning, containerHeight, onScanComplete }) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning && containerHeight > 0) {
      scanLineAnim.setValue(0);
      Animated.timing(scanLineAnim, {
        toValue: containerHeight - 8, // Adjusted for laser height
        duration: 6000, // Doubled duration
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Animation finished, trigger the callback
        if (onScanComplete) {
          onScanComplete();
        }
      });
    } else {
      scanLineAnim.stopAnimation();
      scanLineAnim.setValue(0);
    }
  }, [isScanning, containerHeight]);

  if (!isScanning || containerHeight === 0) return null;

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <Animated.View
        style={[
          styles.scanLineContainer,
          {
            transform: [{ translateY: scanLineAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 0)']}
          style={styles.scanLine}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scanLineContainer: {
    width: '100%',
  },
  scanLine: {
    width: '100%',
    height: 8, 
  },
});

export default VideoScanner;
