import { useRef, useMemo } from 'react';
import { PanResponder, Animated, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.1;

interface PanResponderProps {
  nextMedia: string | null;
  prevMedia: string | null;
  goToNextMedia: () => void;
  goToPrevMedia: () => void;
}

export const usePanResponder = ({
  nextMedia,
  prevMedia,
  goToNextMedia,
  goToPrevMedia,
}: PanResponderProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const animatedBlurIntensity = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dx) < 10;
        },
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(gestureState.dy);
          const newBlurIntensity = Math.min(100, Math.abs(gestureState.dy) / 1.5);
          animatedBlurIntensity.setValue(newBlurIntensity);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
            if (gestureState.dy < 0 && nextMedia) {
              goToNextMedia();
            } else if (gestureState.dy > 0 && prevMedia) {
              goToPrevMedia();
            }
          }
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(animatedBlurIntensity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        },
      }),
    [nextMedia, prevMedia, goToNextMedia, goToPrevMedia, translateY, animatedBlurIntensity]
  );

  return {
    panHandlers: panResponder.panHandlers,
    translateY,
    animatedBlurIntensity,
  };
};