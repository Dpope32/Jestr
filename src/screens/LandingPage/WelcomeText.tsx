import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Dimensions, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Particle {
  left: number;
  top: number;
  size: number;
  animated: Animated.Value;
}

const WelcomeText = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.timing(rotateY, {
            toValue: 360,
            duration: 8000,
            useNativeDriver: true,
          })
        ),
      ])
    );

    animation.start();

    const newParticles: Particle[] = Array(20).fill(0).map(() => ({
      left: Math.random() * width,
      top: Math.random() * height,
      size: Math.random() * 5 + 2,
      animated: new Animated.Value(0),
    }));

    setParticles(newParticles);

    newParticles.forEach(particle => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.animated, {
            toValue: 1,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.animated, {
            toValue: 0,
            duration: 2000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => animation.stop();
  }, [animatedValue, rotateY]);

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#FFFFFF', '#00FF00', '#00FFFF', '#FF00FF'],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1.2, 1, 1.2],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 0.8, 1, 0.8],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -20, 0, -20],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 10, 0, -10],
  });

  const rotateYDeg = rotateY.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const textStyle: Animated.WithAnimatedObject<TextStyle> = {
    fontSize: 88,
    fontWeight: 'bold',
    color: textColor,
    textShadowColor: 'rgba(0, 255, 0, 0.7)',
    marginTop: -20,
    textShadowOffset: { width: -2, height: 2 },
    transform: [
      { scale },
      { translateY },
      { translateX },
      { rotateY: rotateYDeg },
      { perspective: 1000 },
    ],
    opacity,
  };

  return (
    <View style={styles.container}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: particle.animated,
              transform: [
                {
                  translateY: particle.animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      <Animated.View style={styles.textContainer}>
        <LinearGradient
          colors={['rgba(0,255,0,0.3)', 'rgba(0,255,255,0.3)']}
          style={styles.gradient}
        >
          <Animated.Text style={textStyle}>Jestr</Animated.Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: -50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    borderColor: '#00FF00',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    width: '120%',  // Increased the width of the text container
  },
  gradient: {
    padding: 20,
    borderRadius: 20,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#00FF00',
    borderRadius: 50,
  },
});

export default React.memo(WelcomeText);
