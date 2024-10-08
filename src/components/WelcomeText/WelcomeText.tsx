import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import AnimatedLetters from './AnimatedLetters';

const colors = ['rgba(0,255,0,0.3)', 'rgba(0,255,255,0)'];

const WelcomeText = () => {
  return (
    <View style={styles.container}>

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
    padding: 30,
    borderRadius: 20,
  },
});

export default React.memo(WelcomeText);
