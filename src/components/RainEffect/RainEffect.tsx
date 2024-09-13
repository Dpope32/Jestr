import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, Dimensions} from 'react-native';
import {BlurView} from 'expo-blur';

const {width, height} = Dimensions.get('window');

const RainEffect = () => {
  const numDrops = 100;
  const animatedValues = useRef(
    [...Array(numDrops)].map(() => new Animated.Value(0)),
  ).current;
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    animationRefs.current = animatedValues.map(animatedValue => {
      const delay = Math.random() * 2000;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    });

    animationRefs.current.forEach(animation => animation.start());

    return () => {
      animationRefs.current.forEach(animation => animation.stop());
    };
  }, [animatedValues]);

  const drops = animatedValues.map((animatedValue, index) => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, height + 50],
    });

    const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [Math.random() * width, Math.random() * width],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.drop,
          {
            transform: [{translateY}, {translateX}],
          },
        ]}
      />
    );
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {drops}
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
