import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import styles, { lottieStyle } from './componentData';

interface LikeAnimationProps {
  onAnimationFinish: () => void;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({ onAnimationFinish }) => {

  const androidAdjustment: ViewStyle = Platform.OS === 'android' ? { marginTop: 95, marginRight: -5 } : {};

  return (
    <View style={[styles.animationContainer, androidAdjustment]}>
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