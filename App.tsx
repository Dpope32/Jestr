import React, { useState, useEffect, lazy, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, UIManager } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Toast, {BaseToast, BaseToastProps, ErrorToast , ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/ThemeContext';
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

SplashScreen.preventAutoHideAsync();

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

Amplify.configure(awsconfig);

const LoadingScreen = lazy(() => import('./src/screens/Loading/LoadingScreen'));
const MemeUploadScreen = lazy(() => import('./src/screens/MemeUploadScreen/MemeUploadScreen'));
const Profile = lazy(() => import('./src/screens/Profile/Profile'));
const AdminPage = lazy(() => import('./src/screens/AdminPage/AdminPage'));
const Inbox = lazy(() => import('./src/screens/Inbox/Inbox'));
const Conversations = lazy(() => import('./src/screens/Inbox/Conversations'));
const ChangePassword = lazy(() => import('./src/screens/ChangePassword/ChangePassword'));
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
        marginTop: 40, // Adjust this value to move the toast down
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
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

function App(): React.JSX.Element | null {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const setUserDetails = useUserStore(state => state.setUserDetails);

  useEffect(() => {
    const initializeApp = async () => {
      try {
      //  console.log('Starting app initialization');
        const [fontsLoaded, authStatus] = await Promise.all([
          Font.loadAsync({ Inter_400Regular, Inter_700Bold }).then(() => true),
          checkAuthStatus()
        ]);
       // console.log('Fonts loaded:', fontsLoaded, 'Auth status:', authStatus);
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
  }, [isAuthenticated]);

  if (!isReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  

  return (
    <View style={{flex: 1}} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <ThemeProvider>
          <NavigationContainer>
            <SafeAreaProvider>
              <React.Suspense fallback={<Text>Loading...</Text>}>
              <Stack.Navigator initialRouteName={isAuthenticated ? "Feed" : "LandingPage"}>
                  <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
                  <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />     
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
      </ErrorBoundary>
    </View>
  );
}

export default App;
