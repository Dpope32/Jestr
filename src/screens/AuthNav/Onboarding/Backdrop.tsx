import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {slides} from './componentData';

interface BackdropProps {
  scrollX: Animated.Value;
  windowWidth: number;
}

const Backdrop: React.FC<BackdropProps> = ({scrollX, windowWidth}) => {
  const backgroundColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * windowWidth),
    outputRange: slides.map(slide => slide.colors[0]),
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, {backgroundColor}]} />
  );
};

export default Backdrop;
