import React, { useState, useEffect, lazy, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, UIManager } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Toast, {BaseToast, BaseToastProps, ErrorToast , ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import * as Font from 'expo-font';
import { RootStackParamList } from './src/types/types';
import awsconfig from './src/aws-exports';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from './src/utils/userStore';
import { fetchUserDetails, handleSignOut } from './src/services/authFunctions';
import Feed from './src/screens/Feed/Feed';
import { getToken, getUserIdentifier } from './src/utils/secureStore';
import LandingPage from './src/screens/LandingPage/LandingPage';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import OnboardingScreen from './src/screens/LandingPage/OnboardingScreen';
const DEVELOPMENT_MODE = __DEV__; // This will be true when running in development mode

SplashScreen.preventAutoHideAsync();

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

Amplify.configure(awsconfig);

const LoadingScreen = lazy(() => import('./src/screens/Loading/LoadingScreen'));
const MemeUploadScreen = lazy(() => import('./src/screens/MemeUploadScreen/index'));
const Profile = lazy(() => import('./src/screens/Profile/Profile'));
const AdminPage = lazy(() => import('./src/screens/AdminPageScreen'));
const Inbox = lazy(() => import('./src/screens/Inbox/Inbox'));
const Conversations = lazy(() => import('./src/screens/Inbox/Conversations'));
const ChangePassword = lazy(() => import('./src/screens/ChangePasswordScreen'));
const ConfirmSignUpScreen = lazy(() => import('./src/screens/LandingPage/ConfirmSignUpScreen'));
const CompleteProfileScreen = lazy(() => import('./src/screens/LandingPage/CompleteProfileScreen'));
const Settings = lazy(() => import('./src/components/Settings/Settings'));

enableScreens();

const Stack = createStackNavigator<RootStackParamList>();

const toastConfig = {
  success: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderWidth: 1,
        borderColor: 'green',
        backgroundColor: '#2E2E2E',
        borderRadius: 5,
        marginTop: 80, // Adjust this value to move the toast down
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
        color: '#FFFFFF'
      }}
      text2Style={{
        fontSize: 12,
        color: '#CCCCCC'
      }}
    />
  ),
  error: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderWidth: 1,
        borderColor: 'red',
        backgroundColor: '#2E2E2E',
        borderRadius: 5,
        marginTop: 40, // Adjust this value to move the toast down
      }}
      text1Style={{
        fontSize: 15,
        color: '#FFFFFF'
      }}
      text2Style={{
        fontSize: 12,
        color: '#CCCCCC'
      }}
    />
  ),
};

function ErrorFallback({ error }: FallbackProps) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>Something went wrong:</Text>
      <Text style={{color: 'red'}}>{error.message}</Text>
    </View>
  );
}


function App(): React.JSX.Element | null {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const setUserDetails = useUserStore(state => state.setUserDetails);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      if (DEVELOPMENT_MODE) {
        const forceOnboarding = await AsyncStorage.getItem('forceOnboarding');
        if (forceOnboarding === 'true') {
          setIsFirstLaunch(true);
          return;
        }
      }
  
      const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');
      if (alreadyLaunched === null) {
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    };
  
    checkFirstLaunch();
  }, []);

  const onboardingComplete = useCallback(async () => {
    setIsFirstLaunch(false);
    if (DEVELOPMENT_MODE) {
      await AsyncStorage.setItem('forceOnboarding', 'false');
    }
  }, []);

  const toggleOnboarding = useCallback(async () => {
    if (DEVELOPMENT_MODE) {
      const currentSetting = await AsyncStorage.getItem('forceOnboarding');
      const newSetting = currentSetting !== 'true';
      await AsyncStorage.setItem('forceOnboarding', newSetting.toString());
      setIsFirstLaunch(newSetting);
      console.log(`Onboarding screen ${newSetting ? 'enabled' : 'disabled'}`);
    }
  }, []);



  useEffect(() => {
    console.log('App useEffect - Initializing app');
    const initializeApp = async () => {
      try {
        const [fontsLoaded, authStatus] = await Promise.all([
          Font.loadAsync({ Inter_400Regular, Inter_700Bold }).then(() => true),
          checkAuthStatus()
        ]);
        setIsReady(fontsLoaded);
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Initialization error', error);
        setIsReady(true);
        setIsAuthenticated(false);
      }
    };
    initializeApp();
  }, []);

  async function checkAuthStatus(): Promise<boolean> {
    try {
      const token = await getToken('accessToken');
      console.log('Token status in app.tsx:', token ? 'exists' : 'does not exist');
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
   // console.log('Authentication state changed:', isAuthenticated);
   console.log('App render - isReady:', isReady, 'isFirstLaunch:', isFirstLaunch, 'isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  if (!isReady || isFirstLaunch === null || isAuthenticated === null) {
    console.log('App is in loading state');
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  console.log('App is ready to render main content');

  

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
    <View style={{flex: 1}} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <NavigationContainer>
            <SafeAreaProvider>
              <React.Suspense fallback={<Text>Loading...</Text>}>      
              <Stack.Navigator>
                {isFirstLaunch ? (
                  <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
                    {props => <OnboardingScreen {...props} onComplete={onboardingComplete} />}
                  </Stack.Screen>
                ) : isAuthenticated ? (
                  <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />
                ) : (
                  <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
                )}
                <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MemeUploadScreen" component={MemeUploadScreen} options={{ headerShown: false }} />     
                <Stack.Screen name="Profile" component={Profile as React.ComponentType<any>} options={{ headerShown: false }} />
                <Stack.Screen name="AdminPage" component={AdminPage} options={{ headerShown: false }} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
                <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Inbox" component={Inbox} options={{ headerShown: false }} />
                <Stack.Screen name="Conversations" component={Conversations} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
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
