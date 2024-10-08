// AnimatedWord.tsx
import React, { useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';
import Color from 'color';
import { styles } from './styles';

interface AnimatedWordProps {
  word: string;
  isHighlighted: boolean;
  textColor: string;
  buttonColor: string;
  delay: number;
  isActive: boolean; // New prop
}

const AnimatedWord: React.FC<AnimatedWordProps> = ({
  word,
  isHighlighted,
  textColor,
  buttonColor,
  delay,
  isActive, // Destructure the new prop
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Reset opacity to 0 before starting the animation
      opacityAnim.setValue(0);

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, delay, opacityAnim]); // Depend on isActive and delay

  return (
    <Animated.Text
      style={[
        styles.description,
        { color: textColor, opacity: opacityAnim },
        isHighlighted && {
          color: Color(buttonColor).isDark() ? '#FFFFFF' : '#000000',
          fontWeight: 'bold',
          textShadowColor: buttonColor,
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 1,
          borderRadius: 4,
          paddingHorizontal: 4,
          marginHorizontal: 1,
        },
      ]}
    >
      {word}{' '}
    </Animated.Text>
  );
};

export default AnimatedWord;
