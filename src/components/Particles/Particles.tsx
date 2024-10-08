// Particles.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface ParticleProps {
  startX: number;
  startY: number;
  size: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ startX, startY, size, color }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 4000 + Math.random() * 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const directionX = (Math.random() * 2 - 1) * 20;
  const directionY = (Math.random() * 2 - 1) * 20;

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [startX, startX + directionX]);
    const translateY = interpolate(progress.value, [0, 1], [startY, startY + directionY]);
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);

    return {
      transform: [{ translateX }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ParticlesProps {
  windowWidth?: number;
  windowHeight?: number;
  density?: number;
  color?: string;
}

const Particles: React.FC<ParticlesProps> = ({
  windowWidth = Dimensions.get('window').width,
  windowHeight = Dimensions.get('window').height,
  density = 0.00005, // Adjusted density
  color = 'rgba(128, 128, 128, 0.7)',
}) => {
  const numberOfParticles = Math.min(Math.floor(windowWidth * windowHeight * density), 30);

  const particles = Array.from({ length: numberOfParticles }).map(() => ({
    startX: Math.random() * windowWidth,
    startY: Math.random() * windowHeight,
    size: Math.random() * 4 + 1,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Particle
          key={index}
          startX={particle.startX}
          startY={particle.startY}
          size={particle.size}
          color={color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});

export default React.memo(Particles);
