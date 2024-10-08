import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';
import {BlurView} from 'expo-blur';
import LottieView from 'lottie-react-native';
import styles, {lottieStyle} from './componentData';

interface LikeAnimationProps {
  onAnimationFinish: React.Dispatch<React.SetStateAction<boolean>>;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({onAnimationFinish}) => {
  return (
    <View style={styles.overlayContainer}>
      <BlurView intensity={50} style={StyleSheet.absoluteFill} />
      <LottieView
        source={require('../../../assets/animations/lottie-liked.json')}
        style={lottieStyle as ViewStyle}
        autoPlay
        loop={false}
        speed={5}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

export default LikeAnimation;
