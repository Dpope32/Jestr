import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { COLORS } from './theme'; // Import COLORS from your theme file

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  lightGray: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: COLORS.lightBackgroundStart,
  surface: COLORS.white,
  text: COLORS.black,
  textSecondary: COLORS.darkGray,
  textTertiary: COLORS.lightGray,
  primary: COLORS.primary,
  secondary: COLORS.secondary,
  accent: COLORS.accent,
  error: COLORS.error,
  lightGray: COLORS.lightGray,
  success: COLORS.success,
  warning: COLORS.warning,
  card: COLORS.cardBackground,
  info: COLORS.info,
};

const darkColors: ThemeColors = {
  background: COLORS.background,
  surface: COLORS.surface,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  textTertiary: COLORS.textTertiary,
  primary: COLORS.primary,
  lightGray: COLORS.lightGray,
  secondary: COLORS.secondary,
  accent: COLORS.accent,
  card: COLORS.cardBackground,
  error: COLORS.error,
  success: COLORS.success,
  warning: COLORS.warning,
  info: COLORS.info,
};

const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('isDarkMode').then((value) => {
      if (value !== null) {
        setIsDarkMode(JSON.parse(value));
      }
    });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await SecureStore.setItemAsync('isDarkMode', JSON.stringify(newMode));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);