import 'react-native-gesture-handler/jestSetup';
import { NativeModules } from 'react-native';
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock all Expo modules
jest.mock('expo-font', () => ({ loadAsync: jest.fn() }));
jest.mock('expo-asset', () => ({ Asset: { loadAsync: jest.fn() } }));
jest.mock('expo-constants', () => ({ Constants: { manifest: {} } }));
jest.mock('expo-blur', () => ({ BlurView: 'BlurView' }));
jest.mock('expo-keep-awake', () => ({ activateKeepAwakeAsync: jest.fn(), deactivateKeepAwakeAsync: jest.fn() }));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));
jest.mock('expo-screen-orientation', () => ({ lockAsync: jest.fn() }));
jest.mock('expo-haptics', () => ({ impactAsync: jest.fn(), notificationAsync: jest.fn(), selectionAsync: jest.fn() }));

jest.mock('@fortawesome/react-native-fontawesome', () => ({ FontAwesomeIcon: 'FontAwesomeIcon' }));
jest.mock('@expo-google-fonts/inter', () => ({ useFonts: jest.fn(() => [true, null]), Inter_400Regular: 'Inter_400Regular', Inter_700Bold: 'Inter_700Bold' }));
jest.mock('react-native-svg', () => ({ SvgUri: 'SvgUri', Svg: 'Svg', Path: 'Path' }));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock AWS Amplify
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

NativeModules.ExpoClipboard = {
  setStringAsync: jest.fn(),
};

jest.mock('expo-modules-core', () => {
  const originalModule = jest.requireActual('expo-modules-core');
  const mockPlatform = {
    OS: 'android',
    select: jest.fn((obj) => obj.android || obj.default),
  };
  return {
    ...originalModule,
    Platform: mockPlatform,
  };
});