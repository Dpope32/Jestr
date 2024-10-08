import React from 'react';

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

const mockColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#EEEEEE',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  primary: '#007AFF',
  lightGray: '#E0E0E0',
  secondary: '#5856D6',
  accent: '#FF2D55',
  error: '#FF3B30',
  success: '#4CD964',
  warning: '#FF9500',
  info: '#5AC8FA',
};

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}

export const ThemeContext = React.createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: mockColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode: false, 
        toggleDarkMode: () => {}, 
        colors: mockColors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);