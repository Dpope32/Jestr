import React, {useEffect, useRef} from 'react';
import {
  Animated,
  View,
  StyleSheet,
  TextStyle,
  useWindowDimensions,
} from 'react-native';

const letters = ['J', 'e', 's', 't', 'r'];

const AnimatedLetters = () => {
  const {width: windowWidth} = useWindowDimensions();

  const animatedValue = useRef(new Animated.Value(0)).current;
  const letterAnimations = useRef(letters.map(() => new Animated.Value(0)));

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#FFFFFF', '#00FF00', '#00FFFF', '#FFFFFF'],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 0.8, 1, 0.8],
  });

  const calculateFontSize = () => {
    const baseWidth = 375;
    return Math.min(60, (windowWidth / baseWidth) * 60);
  };

  const fontSize = calculateFontSize();

  const textStyle: Animated.AnimatedProps<TextStyle> = {
    fontSize,
    fontWeight: 'bold',
    color: textColor,
    textShadowColor: 'rgba(0, 255, 0, 1)',
    textShadowOffset: {width: -2, height: 2},
    backgroundColor: 'transparent',
    textShadowRadius: 10,
    opacity,
  };

  useEffect(() => {
    const letterAnimationConfigs = letterAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 200,
        useNativeDriver: true,
      }),
    );

    Animated.parallel([
      ...letterAnimationConfigs,
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 3,
          duration: 3000,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);

  return (
    <View style={styles.letterContainer}>
      {letters.map((letter, index) => {
        const letterAnimation = letterAnimations.current[index];

        const translateY = letterAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        });

        return (
          <Animated.Text
            key={index}
            style={[
              textStyle,
              {
                opacity: letterAnimation,
                transform: [{translateY}],
              },
            ]}>
            {letter}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  letterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default AnimatedLetters;
