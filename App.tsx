import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Amplify } from 'aws-amplify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeContext';
import CustomToast from './src/components/ToastMessages/CustomToast';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorFallback, { LoadingText } from './src/components/ErrorFallback/ErrorFallback';

const fontz = {
  Inter_400Regular,
  Inter_700Bold,
};
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: 0,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  useReactQueryDevTools(queryClient);

  const [isReady, setIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);


  const lockOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
  };

  const initializeApp = async () => {
    try {
      await SplashScreen.preventAutoHideAsync();
      const fontsLoaded = await Font.loadAsync(fontz).then(() => true);
      setIsReady(fontsLoaded);
    } catch (error) {
      console.error('Initialization error', error);
      setIsReady(true);
    }
  };

  useEffect(() => {
    activateKeepAwakeAsync();
    lockOrientation();
    initializeApp();
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle received notification
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response (e.g., when user taps notification)
      console.log(response);
    });

    return () => {
      deactivateKeepAwake();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      
    };
  }, []);

  if (!isReady) {
    return <LoadingText />;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
      onSuccess={() => {
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}>
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
    </PersistQueryClientProvider>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  
  return token;
}

export default App;