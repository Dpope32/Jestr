import React from 'react';
import {Animated, StyleSheet, View, useWindowDimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import Particles from '../Particles/Particles';
import AnimatedLetters from './AnimatedLetters';

const colors = ['rgba(0,255,0,0.3)', 'rgba(0,255,255,0.3)'];

const WelcomeText = () => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Particles windowWidth={windowWidth} windowHeight={windowHeight} />

      <Animated.View style={styles.textContainer}>
        <LinearGradient colors={colors} style={styles.gradient}>
          <AnimatedLetters />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  textContainer: {
    borderColor: '#00FF00',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
  },
  gradient: {
    padding: 20,
    borderRadius: 20,
  },
  // particle: {
  //   position: 'absolute',
  //   backgroundColor: '#00FF00',
  //   borderRadius: 50,
  // },
});

export default React.memo(WelcomeText);
