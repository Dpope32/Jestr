// GradientText.tsx
import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface GradientTextProps {
  children: string;
  fontSize?: number;
}

export const GradientText: React.FC<GradientTextProps> = ({ children, fontSize = 36 }) => (
  <Svg height={fontSize * 2} width="100%">
    <Defs>
      <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FF9A8B" />
        <Stop offset="100%" stopColor="#FF6A88" />
      </LinearGradient>
    </Defs>
    <SvgText
      fill="url(#grad)"
      fontSize={fontSize}
      fontWeight="bold"
      x="50%"
      y="50%"
      textAnchor="middle"
    >
      {children}
    </SvgText>
  </Svg>
);
