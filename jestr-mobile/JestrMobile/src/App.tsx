// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from '../src/screens/LandingPage/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import { enableScreens } from 'react-native-screens';
import Feed from '../src/screens/Feed/Feed';
import MemeUploadScreen from '../src/screens/MemeUploadScreen/MemeUploadScreen';


enableScreens();

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
        <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />
        <Stack.Screen name="MemeUpload" component={MemeUploadScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;