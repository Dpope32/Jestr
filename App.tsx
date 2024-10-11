import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ErrorBoundary} from 'react-error-boundary';
import {Inter_400Regular, Inter_700Bold} from '@expo-google-fonts/inter';
import {activateKeepAwakeAsync} from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';
import {Amplify} from 'aws-amplify';
import {Mutation, Query, QueryClient} from '@tanstack/react-query';
import {useReactQueryDevTools} from '@dev-plugins/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';

import {ThemeProvider} from './src/theme/ThemeContext';
import CustomToast from './src/components/ToastMessages/CustomToast';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorFallback, { LoadingText } from './src/components/ErrorFallback/ErrorFallback';
import {createMMKVPersister} from './src/utils/mmkvPersister';
import {usePushNotifications} from './src/screens/AppNav/Notifications/usePushNotification';
import { useUserStore } from 'stores/userStore';
import { getBadgeStorageContents, useBadgeStore } from 'stores/badgeStore';

const fontz = {Inter_400Regular, Inter_700Bold};
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // * gcTime = duration until inactive queries will be removed from the cache
      gcTime: 1000 * 60 * 60 * 24,
      // * staleTime = duration until a query transitions from fresh to stale. As long as the query is fresh, data will always be read from the cache only - no network request will happen
      //*  If the query is stale (which per default is: instantly), you will still get data from the cache, but a background refetch can happen under certain conditions
      staleTime: 2000,
      retry: 0,
    },
  },
});

const mmkvPersister = createMMKVPersister();

const persistOptions = {
  persister: mmkvPersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) => {
      const queryKey = query.queryKey;
      // console.log('queryKey:', queryKey);
      const queriesToExclude = ['comments'];
      if (Array.isArray(queryKey) && queriesToExclude.includes(queryKey[0])) {
        // Do not persist 'queriesToExclude' queries
        return false;
      }
      // Persist other queries
      return true;
    },
    shouldDehydrateMutation: (mutation: Mutation) => {
      const mutationKey = mutation.options.mutationKey;
      const mutationsToExclude = ['postComment'];

      if (
        Array.isArray(mutationKey) &&
        mutationsToExclude.includes(mutationKey[0])
      ) {
        // Do not persist this mutation
        return false;
      }
      // Persist other mutations
      return true;
    },
  },
};

const App = () => {
  useReactQueryDevTools(queryClient);
  usePushNotifications();

  const [isReady, setIsReady] = useState(false);
  const user = useUserStore((state) => state);
  const { syncBadgesWithAPI, isBadgesLoaded } = useBadgeStore();

  const lockOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
  };

  const initializeApp = async () => {
    try {
      await SplashScreen.preventAutoHideAsync();
      const fontsLoaded = await Font.loadAsync(fontz).then(() => true);
      if (user.email && !isBadgesLoaded) {
        await syncBadgesWithAPI(user.email);
      }
+     setIsReady(fontsLoaded);
    } catch (error) {
      console.error('Initialization error', error);
      setIsReady(true);
    }
  };


  useEffect(() => {
    activateKeepAwakeAsync();
    lockOrientation();
    initializeApp();
    getBadgeStorageContents();
  }, []);

  if (!isReady) {
    return <LoadingText />;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}>
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

export default App;
