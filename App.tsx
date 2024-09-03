import React, { useState, useEffect, lazy, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, UIManager, AppState, Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import { getToken, getUserIdentifier } from './src/store/secureStore';
import * as Font from 'expo-font';
//import { Profile } from './src/screens/AppNav/Profile/Profile';
import { RootStackParamList } from './src/types/types';
import awsconfig from './src/aws-exports';
import * as Linking from 'expo-linking';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from './src/store/userStore';
import { fetchUserDetails } from './src/services/authFunctions';
import Feed from './src/screens/Feed/Feed';
import { toastConfig } from './src/config/toastConfig';
import LandingPage from './src/screens/LandingPage/LP';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import OnboardingScreen from './src/screens/LandingPage/LP';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import CustomToast from './src/components/ToastMessages/CustomToast';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorFallback, {LoadingText} from './src/components/ErrorFallback/ErrorFallback';

const DEVELOPMENT_MODE = __DEV__;

const fontz = {
  Inter_400Regular,
  Inter_700Bold,
};

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const setUserDetails = useUserStore(state => state.setUserDetails);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  console.log('App component rendering');
  console.log('isFirstLaunch:', isFirstLaunch);
  console.log('isReady:', isReady);
  console.log('isAuthenticated:', isAuthenticated);

  const handleDeepLink = (event: Linking.EventType) => {
    let data = Linking.parse(event.url);
    console.log('Received deep link:', data);
  };

  const checkFirstLaunch = async (): Promise<boolean> => {
    console.log('Checking if this is the first launch...');
    if (DEVELOPMENT_MODE) {
      const forceOnboarding = await AsyncStorage.getItem('forceOnboarding');
      console.log('DEVELOPMENT_MODE forceOnboarding:', forceOnboarding);
      if (forceOnboarding === 'true') {
        console.log('Force onboarding is true, setting isFirstLaunch to true');
        return true;
      }
    }

    const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
    console.log('alreadyLaunched value:', alreadyLaunched);
    if (alreadyLaunched === null) {
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      console.log('First launch detected, setting isFirstLaunch to true');
      return true;
    } else {
      console.log('Not first launch, setting isFirstLaunch to false');
      return false;
    }
  };

  const refreshSession = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      const newAccessToken = tokens?.accessToken?.toString();
      if (newAccessToken) {
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        console.log('Session refreshed successfully');
      } else {
        console.warn('Failed to refresh session: No new access token');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const onboardingComplete = useCallback(async () => {
    console.log('Onboarding complete called');
    setIsFirstLaunch(false);
    if (DEVELOPMENT_MODE) {
      await AsyncStorage.setItem('forceOnboarding', 'false');
      console.log('DEVELOPMENT_MODE: Set forceOnboarding to false');
    }
  }, []);

  useEffect(() => {
    activateKeepAwakeAsync();
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    };

    lockOrientation();
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with URL:', url);
      }
    });

    const initializeApp = async () => {
      try {
        const [fontsLoaded, authStatus, firstLaunch] = await Promise.all([
          Font.loadAsync({Inter_400Regular, Inter_700Bold}).then(() => true),
          checkAuthStatus(),
          checkFirstLaunch(),
        ]);
        setIsReady(fontsLoaded);
        setIsAuthenticated(authStatus);
        setIsFirstLaunch(!authStatus && firstLaunch); // Only set isFirstLaunch to true if not authenticated and it's actually the first launch
      } catch (error) {
        console.error('Initialization error', error);
        setIsReady(true);
        setIsAuthenticated(false);
        setIsFirstLaunch(true);
      }
    };
    initializeApp();

    return () => {
      deactivateKeepAwake();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refreshSession();
      }
    });
  
    return () => {
      subscription.remove();
    };
  }, []);
  

  async function checkAuthStatus(): Promise<boolean> {
    try {
      await refreshSession();
      const token = await getToken('accessToken');
      if (!token) {
        useUserStore.getState().setUserDetails({});
        return false;
      }
  
      const identifier = await getUserIdentifier();
      if (!identifier) {
        throw new Error('No valid identifier found for user');
      }
  
      const userDetails = await fetchUserDetails(identifier, token);
      if (userDetails) {
        useUserStore.getState().setUserDetails(userDetails);
        return true;
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userIdentifier');
      useUserStore.getState().setUserDetails({});
      return false;
    }
  }

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      enableScreens(false);
    }
  }, [isReady, onLayoutRootView]);

  useEffect(() => {
    const refreshInterval = setInterval(refreshSession, 15 * 60 * 1000); // Refresh every 15 minutes
  
    return () => clearInterval(refreshInterval);
  }, []);

  if (!isReady || isFirstLaunch === null || isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <NavigationContainer onReady={() => SplashScreen.hideAsync()}>
          <SafeAreaProvider>
            <React.Suspense fallback={<LoadingText />}>
              <AppNavigator />
            </React.Suspense>
          </SafeAreaProvider>
          <CustomToast />
        </NavigationContainer>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;