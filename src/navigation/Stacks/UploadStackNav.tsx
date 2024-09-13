import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import UploadScreen from '../../screens/AppNav/MemeUpload';

const Stack = createNativeStackNavigator();

const UploadStackNav: React.FC = () => {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="UploadScreen" component={UploadScreen} />
    </Stack.Navigator>
  );
};

export default UploadStackNav;
