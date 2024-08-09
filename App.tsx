import React, { useState, useEffect, lazy, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, UIManager } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import * as Font from 'expo-font';
import { RootStackParamList } from './src/types/types';
import awsconfig from './src/aws-exports';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { getToken } from './src/utils/secureStore';
import { useUserStore } from './src/utils/userStore';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

SplashScreen.preventAutoHideAsync();

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

Amplify.configure(awsconfig);

const LandingPage = lazy(() => import('./src/screens/LandingPage/LandingPage'));
const LoadingScreen = lazy(() => import('./src/screens/Loading/LoadingScreen'));
const Feed = lazy(() => import('./src/screens/Feed/Feed'));
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

const toastConfig: ToastConfig = {
  success: (internalState: ToastConfigParams<any>) => (
    <View style={{
      height: 60,
      width: '70%',
      backgroundColor: internalState.props.backgroundColor,
      padding: 15,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#00ff00'
    }}>
      <Text style={{
        color: internalState.props.textColor,
        textAlign: 'center'
      }}>
        {internalState.text1}
      </Text>
    </View>
  ),
  error: (internalState: ToastConfigParams<any>) => (
    <View style={{
      height: 60,
      width: '100%',
      backgroundColor: internalState.props.backgroundColor,
      padding: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#00ff00'
    }}>
      <Text style={{
        color: internalState.props.textColor,
        textAlign: 'center'
      }}>
        {internalState.text1}
      </Text>
    </View>
  ),
};

function App(): React.JSX.Element | null {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setUserDetails = useUserStore(state => state.setUserDetails);

  useEffect(() => {
    console.log('App useEffect running');
    checkAuthStatus();
  }, []);

    async function checkAuthStatus() {
      console.log('Checking auth status');
      try {
        const token = await getToken('accessToken');
        console.log('Token:', token ? 'exists' : 'does not exist');
        
        if (token) {
          try {
            const user = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            
            const userDetails = {
              email: attributes.email || '',
              username: user.username,
              displayName: attributes.name || '',
              profilePic: attributes.picture || '',
              headerPic: attributes['custom:headerPic'] || '',
              bio: attributes['custom:bio'] || '',
              creationDate: attributes['custom:creationDate'] || '',
              followersCount: parseInt(attributes['custom:followersCount'] || '0', 10),
              followingCount: parseInt(attributes['custom:followingCount'] || '0', 10),
              isAdmin: attributes.email === 'pope.dawson@gmail.com',
            };
            
            console.log('Fetched user details:', userDetails);
            
            setIsAuthenticated(true);
            useUserStore.getState().setUserDetails(userDetails);
          } catch (error) {
            console.error('Error fetching user details:', error);
            setIsAuthenticated(false);
            useUserStore.getState().setUserDetails({});
          }
        } else {
          console.log('No token found, user is not authenticated');
          setIsAuthenticated(false);
          useUserStore.getState().setUserDetails({});
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        useUserStore.getState().setUserDetails({});
      } finally {
        setIsReady(true);
      }
    }


  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Inter_400Regular,
          Inter_700Bold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated);
  }, [isAuthenticated]);

  if (!isReady) {
    return null;
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
                  <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
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
