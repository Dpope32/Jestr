import React, { useState, useEffect, lazy, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, UIManager, AppState } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import { getToken, getUserIdentifier } from './src/utils/secureStore';
import * as Font from 'expo-font';
import Profile from './src/screens/Profile/Profile';
import { RootStackParamList } from './src/types/types';
import awsconfig from './src/aws-exports';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from './src/utils/userStore';
import { fetchUserDetails } from './src/services/authFunctions';
import Feed from './src/screens/Feed/Feed';
import { toastConfig } from './src/config/toastConfig';
import LandingPage from './src/screens/LandingPage/LandingPage';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import OnboardingScreen from './src/screens/LandingPage/OnboardingScreen';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';

const DEVELOPMENT_MODE = __DEV__;

SplashScreen.preventAutoHideAsync();

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

Amplify.configure(awsconfig);

const LoadingScreen = lazy(() => import('./src/screens/Loading/LoadingScreen'));
const MemeUploadScreen = lazy(() => import('./src/screens/MemeUploadScreen/index'));
const AdminPage = lazy(() => import('./src/screens/AdminPageScreen'));
const Inbox = lazy(() => import('./src/screens/Inbox/Inbox'));
const Conversations = lazy(() => import('./src/screens/Inbox/Conversations'));
const ChangePassword = lazy(() => import('./src/screens/ChangePasswordScreen'));
const ConfirmSignUpScreen = lazy(() => import('./src/screens/LandingPage/ConfirmSignUpScreen'));
const CompleteProfileScreen = lazy(() => import('./src/screens/LandingPage/CompleteProfileScreen'));
const Settings = lazy(() => import('./src/components/Settings/Settings'));

enableScreens();

const Stack = createStackNavigator<RootStackParamList>();

const handleDeepLink = (event: Linking.EventType) => {
  let data = Linking.parse(event.url);
  console.log('Received deep link:', data);
};

function ErrorFallback({ error }: FallbackProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Something went wrong:
      </Text>
      <Text style={{ color: 'red' }}>{error.message}</Text>
    </View>
  );
}

function App(): React.JSX.Element | null {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const setUserDetails = useUserStore(state => state.setUserDetails);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  console.log('App component rendering');
  console.log('isFirstLaunch:', isFirstLaunch);
  console.log('isReady:', isReady);
  console.log('isAuthenticated:', isAuthenticated);

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
          Font.loadAsync({ Inter_400Regular, Inter_700Bold }).then(() => true),
          checkAuthStatus(),
          checkFirstLaunch(),
        ]);
        setIsReady(fontsLoaded);
        setIsAuthenticated(authStatus);
        setIsFirstLaunch(!authStatus && firstLaunch);
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
    if (isReady) {
      onLayoutRootView();
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
  console.log('About to render Stack.Navigator');
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <NavigationContainer>
            <SafeAreaProvider>
              <React.Suspense fallback={<Text>Loading...</Text>}>
                <Stack.Navigator
                  initialRouteName={
                    isFirstLaunch
                      ? 'Onboarding'
                      : isAuthenticated
                      ? 'Feed'
                      : 'LandingPage'
                  }>
                  {isFirstLaunch && (
                    <Stack.Screen
                      name="Onboarding"
                      options={{ headerShown: false }}>
                      {props => {
                        console.log('Rendering Onboarding screen');
                        return (
                          <OnboardingScreen
                            {...props}
                            onComplete={onboardingComplete}
                          />
                        );
                      }}
                    </Stack.Screen>
                  )}
                  <Stack.Screen
                    name="LandingPage"
                    component={LandingPage}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Feed"
                    component={Feed}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ConfirmSignUp"
                    component={ConfirmSignUpScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Loading"
                    component={LoadingScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="MemeUploadScreen"
                    component={MemeUploadScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AdminPage"
                    component={AdminPage}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ChangePassword"
                    component={ChangePassword}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="CompleteProfileScreen"
                    component={CompleteProfileScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Inbox"
                    component={Inbox}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Conversations"
                    component={Conversations}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Settings"
                    component={Settings}
                    options={{ headerShown: false }}
                  />
                </Stack.Navigator>
              </React.Suspense>
            </SafeAreaProvider>
            <Toast config={toastConfig} />
          </NavigationContainer>
        </ThemeProvider>
      </View>
    </ErrorBoundary>
  );
}

export default App;