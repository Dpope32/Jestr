import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from '../src/screens/LandingPage/LandingPage';
import LoadingScreen from './components/LoadingScreen'
import { enableScreens } from 'react-native-screens';
enableScreens();


const Stack = createStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;