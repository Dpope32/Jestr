import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from '../src/screens/LandingPage/LandingPage';
import LoadingScreen from './components/LoadingScreen'
import { enableScreens } from 'react-native-screens';
import Feed from '../src/screens/Feed/Feed'; // Adjust the path to where your Feed component is located

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
        {/* Add the Feed screen */}
        <Stack.Screen
          name="Feed"
          component={Feed}
          options={{ headerShown: false }} // Adjust options as needed
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;