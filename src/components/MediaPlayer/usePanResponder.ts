import { useRef, useMemo, useState, RefObject } from 'react';
import { PanResponder, Animated, Dimensions, GestureResponderEvent, Easing, View } from 'react-native';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.15; // Reduced from 0.2 to 0.15
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LONG_PRESS_DURATION = 800;

interface PanResponderProps {
  nextMedia: string | null;
  prevMedia: string | null;
  goToNextMedia: () => void;
  goToPrevMedia: () => void;
  handleTap: (event: GestureResponderEvent) => void;
  handleLongPress: () => void;
  iconAreaRef: RefObject<View>;
}

export const usePanResponder = ({
  nextMedia,
  prevMedia,
  goToNextMedia,
  goToPrevMedia,
  handleLongPress,
  handleTap,
  iconAreaRef,
}: PanResponderProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const animatedBlurIntensity = useRef(new Animated.Value(0)).current;
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isResponding = useRef(false);
  const startTime = useRef(0);
  const [isIconAreaTouched, setIsIconAreaTouched] = useState(false);
  const isSwiping = useRef(false);

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start(() => {
      isResponding.current = false;
      isSwiping.current = false;
    });
    Animated.timing(animatedBlurIntensity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          const { pageX, pageY } = evt.nativeEvent;
          if (iconAreaRef.current) {
            iconAreaRef.current.measure((x, y, width, height, pageX, pageY) => {
              const touchIsInIconArea =
                pageX >= x &&
                pageX <= x + width &&
                pageY >= y &&
                pageY <= y + height;
              setIsIconAreaTouched(touchIsInIconArea);
            });
          }
          return !isIconAreaTouched;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return !isIconAreaTouched && Math.abs(gestureState.dy) > 5; // Reduced from 10 to 5
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isIconAreaTouched && !isSwiping.current) {
            translateY.setValue(gestureState.dy);
            animatedBlurIntensity.setValue(Math.abs(gestureState.dy));
          }
        },
        onPanResponderRelease: (event, gestureState) => {
          if (isIconAreaTouched) {
            setIsIconAreaTouched(false);
            return;
          }
        
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }
          
          const elapsedTime = Date.now() - startTime.current;
          
          if (elapsedTime < 300 && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            handleTap(event);
          } else if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD || Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD) {
            if (!isSwiping.current) {
              isSwiping.current = true;
              if (gestureState.dy < 0) {
                console.log('Swiping up, calling goToNextMedia');
                goToNextMedia();
                Animated.timing(translateY, {
                  toValue: -height,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  translateY.setValue(0);
                  isSwiping.current = false;
                });
              } else {
                console.log('Swiping down, calling goToPrevMedia');
                goToPrevMedia();
                Animated.timing(translateY, {
                  toValue: height,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  translateY.setValue(0);
                  isSwiping.current = false;
                });
              }
            }
          } else {
            resetPosition();
          }
        },
        onPanResponderGrant: () => {
          if (!isIconAreaTouched) {
            isResponding.current = true;
            startTime.current = Date.now();
            longPressTimeout.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
          }
        },
        onPanResponderTerminate: () => {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }
          resetPosition();
        },
      }),
    [translateY, iconAreaRef, isIconAreaTouched, animatedBlurIntensity, goToNextMedia, goToPrevMedia, handleTap, handleLongPress]
  );


  return {
    panHandlers: panResponder.panHandlers,
    translateY,
    animatedBlurIntensity,
  };
};