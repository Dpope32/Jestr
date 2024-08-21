import { useRef, useMemo, useState, RefObject, useCallback } from 'react';
import { PanResponder, Animated, Dimensions, GestureResponderEvent, View } from 'react-native';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.15; // Reduced from 0.2 to 0.15
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LONG_PRESS_DURATION = 800;
const LONG_PRESS_DELAY = 500;


interface PanResponderProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  handleTap: (event: GestureResponderEvent) => void;
  handleLongPress: () => void;
  iconAreaRef: RefObject<View>;
}

export const usePanResponder = ({
  onSwipeUp,
  onSwipeDown,
  handleTap,
  handleLongPress,
  iconAreaRef,
}: PanResponderProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const animatedBlurIntensity = useRef(new Animated.Value(0)).current;
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  const handleSwipe = useCallback(
    (isUpSwipe: boolean) => {
      if (isSwiping.current) return;
      isSwiping.current = true;

      const swipeDistance = isUpSwipe ? -height : height;

      Animated.timing(translateY, {
        toValue: swipeDistance,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        if (isUpSwipe) {
          onSwipeUp();
        } else {
          onSwipeDown();
        }
        // Don't reset the translateY value here
        isSwiping.current = false;
      });
    },
    [translateY, onSwipeUp, onSwipeDown]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderGrant: (event) => {
          startY.current = event.nativeEvent.pageY;
          longPressTimeout.current = setTimeout(() => {
            setIsLongPressing(true);
            handleLongPress();
          }, LONG_PRESS_DELAY);
        },
        onPanResponderMove: (_, gestureState) => {
          if (isSwiping.current) return;

          if (Math.abs(gestureState.dy) > 10 && longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
          }
          translateY.setValue(gestureState.dy);
          animatedBlurIntensity.setValue(Math.abs(gestureState.dy));
        },
        onPanResponderRelease: (event, gestureState) => {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }

          if (isLongPressing) {
            setIsLongPressing(false);
            return;
          }

          const endY = event.nativeEvent.pageY;
          const verticalDistance = endY - startY.current;

          if (Math.abs(verticalDistance) < 10 && Math.abs(gestureState.dx) < 10) {
            handleTap(event);
          } else if (gestureState.dy < -SWIPE_THRESHOLD) {
            handleSwipe(true);
          } else if (gestureState.dy > SWIPE_THRESHOLD) {
            handleSwipe(false);
          } else {
            // Only reset if not swiping
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }
          setIsLongPressing(false);
          // Only reset if not swiping
          if (!isSwiping.current) {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [translateY, animatedBlurIntensity, handleTap, handleLongPress, handleSwipe]
  );


  return {
    panHandlers: panResponder.panHandlers,
    translateY,
    animatedBlurIntensity,
  };
};