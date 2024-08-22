import { useRef, useMemo, useState, RefObject, useCallback } from 'react';
import { PanResponder, Animated, Dimensions, GestureResponderEvent, View } from 'react-native';

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.15; // Adjusted to make swiping easier
const SWIPE_VELOCITY_THRESHOLD = 0.2; // Lowered threshold for velocity
const LONG_PRESS_DURATION = 800;
const LONG_PRESS_DELAY = 500;

interface PanResponderProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  handleTap: (event: GestureResponderEvent) => void;
  handleLongPress: () => void;
  iconAreaRef: RefObject<View>;
  isSwiping: RefObject<boolean>;
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
      console.log('Swiping started:', isUpSwipe ? 'Up' : 'Down');

      const swipeDistance = isUpSwipe ? -height : height;

      Animated.timing(translateY, {
        toValue: swipeDistance,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        console.log('Swipe completed:', isUpSwipe ? 'Up' : 'Down');
        if (isUpSwipe) {
          onSwipeUp();
        } else {
          onSwipeDown();
        }
        translateY.setValue(0);
        isSwiping.current = false;
      });
    },
    [translateY, onSwipeUp, onSwipeDown]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          console.log('PanResponder start should set');
          return true;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const shouldSet = Math.abs(gestureState.dy) > 5;
          console.log('PanResponder move should set:', shouldSet);
          return shouldSet;
        },
        onPanResponderGrant: (event) => {
          console.log('PanResponder granted');
          startY.current = event.nativeEvent.pageY;
          longPressTimeout.current = setTimeout(() => {
            setIsLongPressing(true);
            handleLongPress();
            console.log('Long press triggered');
          }, LONG_PRESS_DELAY);
        },
        onPanResponderMove: (_, gestureState) => {
          if (isSwiping.current) {
            console.log('Already swiping, ignoring move');
            return;
          }

          if (Math.abs(gestureState.dy) > 5 && longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
            console.log('Long press timeout cleared due to movement');
          }
          translateY.setValue(gestureState.dy);
          animatedBlurIntensity.setValue(Math.abs(gestureState.dy));
        },
        onPanResponderRelease: (event, gestureState) => {
          console.log('PanResponder released');
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            console.log('Long press timeout cleared on release');
          }

          if (isLongPressing) {
            setIsLongPressing(false);
            console.log('Was long pressing, stopping further action');
            return;
          }

          const endY = event.nativeEvent.pageY;
          const verticalDistance = endY - startY.current;

          console.log('Vertical distance:', verticalDistance);
          console.log('Velocity Y:', gestureState.vy);
          console.log('Swipe Threshold:', SWIPE_THRESHOLD);
          console.log('Swipe Velocity Threshold:', SWIPE_VELOCITY_THRESHOLD);

          // Handle swipe based on distance and velocity
          if (
            (gestureState.dy < -SWIPE_THRESHOLD && Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD) ||
            (gestureState.dy < 0 && Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD)
          ) {
            console.log('Triggering swipe up');
            handleSwipe(true);
          } else if (
            (gestureState.dy > SWIPE_THRESHOLD && Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD) ||
            (gestureState.dy > 0 && Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD)
          ) {
            console.log('Triggering swipe down');
            handleSwipe(false);
          } else {
            console.log('Swipe did not meet threshold, bouncing back');
            // If swipe doesn't meet threshold, bounce back
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              velocity: gestureState.vy,
              tension: 40,
              friction: 7,
            }).start();
          }
        },
        onPanResponderTerminate: (_, gestureState) => {
          console.log('PanResponder terminated');
        
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            console.log('Long press timeout cleared on terminate');
          }
        
          setIsLongPressing(false);
        
          // If termination happens during a valid swipe, force the swipe to complete
          if (!isSwiping.current && Math.abs(gestureState.dy) > SWIPE_THRESHOLD) {
            const isUpSwipe = gestureState.dy < 0;
            console.log('Force completing swipe due to termination');
            handleSwipe(isUpSwipe);
          } else {
            // Otherwise, reset as usual
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        }        
        
      }),
    [translateY, animatedBlurIntensity, handleTap, handleLongPress, handleSwipe]
  );

  return {
    panHandlers: panResponder.panHandlers,
    translateY,
    animatedBlurIntensity,
  };
};
