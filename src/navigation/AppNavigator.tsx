import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {AppNavParamList} from './NavTypes/RootNavTypes';
import BottomTabNav from './Stacks/BottomTabNav';

const Stack = createStackNavigator<AppNavParamList>();

const AppNavigator = () => {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BottomTabNav" component={BottomTabNav} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
