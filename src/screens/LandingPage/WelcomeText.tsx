import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';

const WelcomeText = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 3,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.delay(2000),
      ])
    ).start();
  }, [animatedValue]);

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['rgba(255, 255, 255, 1)', 'rgba(0, 255, 0, 1)', 'rgba(128, 128, 128, 1)', 'rgba(255, 255, 255, 1)'],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1.1, 1, 1.1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 0.8, 1, 0.8],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -10, 0, -10],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 5, 0, -5],
  });

  const textShadowRadius = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [4, 8, 4, 8],
  });

  const textStyle: Animated.WithAnimatedObject<TextStyle> = {
    fontSize: 48,
    fontWeight: 'bold',
    color: textColor,
    textShadowColor: 'rgba(0, 255, 0, 0.5)',
    marginBottom: 40,
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius,
    transform: [{ scale }, { translateY }, { translateX }],
    opacity,
  };

  return (
    <Animated.Text style={textStyle}>
      Jestr
    </Animated.Text>
  );
};

export default React.memo(WelcomeText);
