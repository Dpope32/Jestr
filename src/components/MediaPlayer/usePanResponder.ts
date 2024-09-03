import {useRef, useMemo, useState, RefObject, useCallback} from 'react';
import {
  PanResponder,
  Animated,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';

const {height} = Dimensions.get('window');

const SWIPE_THRESHOLD = height * 0.15;
const SWIPE_VELOCITY_THRESHOLD = 0.2;
const LONG_PRESS_DELAY = 500;
const DOUBLE_TAP_DELAY = 300;

interface PanResponderProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  handleTap: (event: GestureResponderEvent) => void;
  handleLongPress: () => void;
  handleDoubleTap: (event: GestureResponderEvent) => void;
  isCommentFeedVisible: boolean;
  isProfilePanelVisible: boolean;
}

export const usePanResponder = ({
  onSwipeUp,
  onSwipeDown,
  handleTap,
  handleLongPress,
  handleDoubleTap,
  isCommentFeedVisible,
  isProfilePanelVisible,
}: PanResponderProps) => {
  const isSwiping = useRef(false);
  const startY = useRef(0);
  const lastTapTimestamp = useRef(0);

  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleSwipe = useCallback(
    (isUpSwipe: boolean) => {
      console.log('handleSwipe');
      if (isSwiping.current) {
        return;
      }
      isSwiping.current = true;

      const swipeDistance = isUpSwipe ? -height : height;

      Animated.timing(translateY, {
        toValue: swipeDistance,
        duration: 300,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          if (isUpSwipe) {
            onSwipeUp();
          } else {
            onSwipeDown();
          }

          setTimeout(() => {
            translateY.setValue(0);
            isSwiping.current = false;
          }, 100);
        } else {
          isSwiping.current = false;
        }
      });
    },
    [translateY, onSwipeUp, onSwipeDown],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          return !isCommentFeedVisible && !isProfilePanelVisible;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const shouldSet =
            Math.abs(gestureState.dy) > 5 &&
            !isCommentFeedVisible &&
            !isProfilePanelVisible;

          return shouldSet;
        },
        onPanResponderGrant: event => {
          startY.current = event.nativeEvent.pageY;
          const now = Date.now();
          if (now - lastTapTimestamp.current < DOUBLE_TAP_DELAY) {
            handleDoubleTap(event);
            lastTapTimestamp.current = 0;
          } else {
            lastTapTimestamp.current = now;
            longPressTimeout.current = setTimeout(() => {
              setIsLongPressing(true);
              handleLongPress();
            }, LONG_PRESS_DELAY);
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (isSwiping.current) {
            return;
          }

          if (Math.abs(gestureState.dy) > 5 && longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
          }
          translateY.setValue(gestureState.dy);
        },
        onPanResponderRelease: (event, gestureState) => {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }

          if (isLongPressing) {
            setIsLongPressing(false);
            return;
          }

          if (
            (gestureState.dy < -SWIPE_THRESHOLD &&
              Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD) ||
            (gestureState.dy < 0 &&
              Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD)
          ) {
            handleSwipe(true);
          } else if (
            (gestureState.dy > SWIPE_THRESHOLD &&
              Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD) ||
            (gestureState.dy > 0 &&
              Math.abs(gestureState.vy) > SWIPE_VELOCITY_THRESHOLD)
          ) {
            handleSwipe(false);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              velocity: gestureState.vy,
              tension: 40,
              friction: 7,
            }).start(() => {
              isSwiping.current = false;
            });
          }
        },
        onPanResponderTerminate: (_, gestureState) => {
          if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
          }

          setIsLongPressing(false);

          if (
            !isSwiping.current &&
            Math.abs(gestureState.dy) > SWIPE_THRESHOLD
          ) {
            const isUpSwipe = gestureState.dy < 0;

            handleSwipe(isUpSwipe);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start(() => {
              isSwiping.current = false;
            });
          }
        },
      }),
    [
      translateY,
      handleTap,
      handleLongPress,
      handleDoubleTap,
      handleSwipe,
      isCommentFeedVisible,
      isProfilePanelVisible,
    ],
  );

  return {
    panHandlers: panResponder.panHandlers,
    translateY,
  };
};
