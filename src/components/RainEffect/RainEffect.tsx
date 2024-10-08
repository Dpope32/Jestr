// RainEffect.tsx
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface DropProps {
  delay: number;
  startX: number;
}

const Drop: React.FC<DropProps> = ({ delay, startX }) => {
  const translateY = useSharedValue(-50);

  translateY.value = withDelay(
    delay,
    withRepeat(
      withTiming(height + 50, {
        duration: 2000,
      }),
      -1,
      false,
      (isFinished) => {
        if (isFinished) {
          translateY.value = -50;
        }
      }
    )
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: startX }],
  }));

  return <Animated.View style={[styles.drop, animatedStyle]} />;
};

const RainEffect = () => {
  const numDrops = 50; // Reduced number of drops
  const drops = Array.from({ length: numDrops }).map((_, index) => ({
    delay: Math.random() * 2000,
    startX: Math.random() * width,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {drops.map((drop, index) => (
        <Drop key={index} delay={drop.delay} startX={drop.startX} />
      ))}
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  drop: {
    position: 'absolute',
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
  },
});

export default RainEffect;
