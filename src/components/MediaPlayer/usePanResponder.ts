import { useRef, useMemo } from 'react';
import { PanResponder, Animated, Dimensions, GestureResponderEvent } from 'react-native';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.09; // Reduced from 0.2 to 0.15
const LONG_PRESS_DURATION = 800;

interface PanResponderProps {
  nextMedia: string | null;
  prevMedia: string | null;
  goToNextMedia: () => void;
  goToPrevMedia: () => void;
  handleTap: (event: GestureResponderEvent) => void;
  handleLongPress: () => void; 
}

export const usePanResponder = ({
  nextMedia,
  prevMedia,
  goToNextMedia,
  goToPrevMedia,
  handleLongPress,
  handleTap,
}: PanResponderProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const animatedBlurIntensity = useRef(new Animated.Value(0)).current;
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isResponding = useRef(false);
const startTime = useRef(0);
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && !isResponding.current;
      },
      onPanResponderMove: (_, gestureState) => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        console.log('onPanResponderMove', gestureState);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderGrant: (event) => {
        isResponding.current = true;
        startTime.current = Date.now();
        longPressTimeout.current = setTimeout(() => {
          handleLongPress();
        }, 500);
      },
      onPanResponderRelease: (event, gestureState) => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        
        const elapsedTime = Date.now() - startTime.current;
        
        if (elapsedTime < 500 && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          // This is a tap
          handleTap(event);
        } else if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
          if (gestureState.dy < 0) {
            console.log('Swiping up, calling goToNextMedia');
            goToNextMedia();
          } else {
            console.log('Swiping down, calling goToPrevMedia');
            goToPrevMedia();
          }
        } 
        
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 2,
          }),
          Animated.timing(animatedBlurIntensity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]).start(() => {
          isResponding.current = false;
          console.log('Animation completed, isResponding set to false');
        });
      },
      onPanResponderTerminate: () => {
        console.log('onPanResponderTerminate');
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
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
        ]).start(() => {
          isResponding.current = false;
          console.log('Animation completed on terminate, isResponding set to false');
        });
      },
    }),
    [nextMedia, prevMedia, goToNextMedia, goToPrevMedia, translateY, animatedBlurIntensity, handleTap]
  );

  return {
    panHandlers: panResponder.panHandlers,
    translateY,
    animatedBlurIntensity,
  };
};