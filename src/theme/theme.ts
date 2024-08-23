// src/styles/theme.ts

import { SignInOutput } from '@aws-amplify/auth';
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const wp = (percentage: number) => {
  return PixelRatio.roundToNearestPixel((width * percentage) / 100);
};

export const hp = (percentage: number) => {
  return PixelRatio.roundToNearestPixel((height * percentage) / 100);
};

export const COLORS = {
  primary: '#1bd40b',
  background: '#1C1C1C',
  surface: '#1C1C1C',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  accent: '#FF4081',
  buttonStart: '#0B6623', // Dark green start
  buttonEnd: '#1bd40b',   // Light green end
  textThirdary: '#eeeeee',
};

export const SPACING = {
  xs: wp(2),
  sm: wp(4),
  md: wp(6),
  lg: wp(8),
  xl: wp(10),
};

export const FONT_SIZES = {
  xs: wp(3),
  sm: wp(3.5),
  md: wp(4),
  lg: wp(5),
  xl: wp(7),
};

export const FONTS = {
  regular: 'Inter_400Regular',
  bold: 'Inter_700Bold',
};

export const elevationShadowStyle = (elevation: number) => {
  return {
    elevation,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation * 0.5 },
    shadowOpacity: 0.3,
    shadowRadius: elevation * 0.8,
  };
};

