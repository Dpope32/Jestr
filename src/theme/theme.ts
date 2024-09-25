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
  secondary: '#0B6623',
  background: '#1C1C1C',
  surface: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  accent: '#FF4081',
  buttonStart: '#0B6623',
  buttonEnd: '#1bd40b',
  black: '#000000',
  white: '#FFFFFF',
  lightGray: '#E0E0E0',
  darkGray: '#757575',
  error: '#FF3B30',
  success: '#4CD964',
  warning: '#FF9500',
  info: '#5AC8FA',
  gold: '#FFD700',
  cardBackground: '#2A2A2A',
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
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
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

export const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hexColor: string) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? COLORS.black : COLORS.white;
};