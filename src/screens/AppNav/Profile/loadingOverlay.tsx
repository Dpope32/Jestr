import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface LoadingOverlayProps {
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={70} style={StyleSheet.absoluteFill} tint="dark">
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size="large" color="#1bd40b" />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingOverlay;
