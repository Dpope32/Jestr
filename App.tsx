import React, {useState, useEffect} from 'react';
import {Platform} from 'react-native';
import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ErrorBoundary} from 'react-error-boundary';
import {Inter_400Regular, Inter_700Bold} from '@expo-google-fonts/inter';
import {activateKeepAwakeAsync, deactivateKeepAwake} from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation';

import {ThemeProvider} from './src/theme/ThemeContext';
import CustomToast from './src/components/ToastMessages/CustomToast';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorFallback, {
  LoadingText,
} from './src/components/ErrorFallback/ErrorFallback';

const fontz = {
  Inter_400Regular,
  Inter_700Bold,
};

const App = () => {
  const [isReady, setIsReady] = useState(false);

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

    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // this is for the weird issue with bottom tabs height remaining
  // on iOS on RecipeDetailsScreen (where it should be hidden)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      enableScreens(false);
    }
  }, []);

  if (!isReady) {
    return <LoadingText />;
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
