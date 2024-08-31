import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LandingPage from '../../screens/LandingPage/LandingPage';
import InfoFooterAuth from '../../screens/InfoFooterAuth/InfoFooterAuth';
import ContactUs from '../../screens/ContactUs/ContactUs';
import ConfirmSignUpScreen from '../../screens/LandingPage/ConfirmSignUpScreen';
import ChangePassword from '../../screens/ChangePasswordScreen';
import CompleteProfileScreen from '../../screens/LandingPage/CompleteProfileScreen';

const Stack = createNativeStackNavigator();

const AuthStackNav: React.FC = () => {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="InfoFooterAuth"
        component={InfoFooterAuth}
        options={{presentation: 'formSheet'}}
      />

      <Stack.Screen
        name="ContactUs"
        component={ContactUs}
        options={{presentation: 'formSheet'}}
      />

      <Stack.Screen
        name="ConfirmSignUp"
        component={ConfirmSignUpScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{headerShown: false}}
      />

      {/* THIS MIGHT NOT BE HERE !!! */}
      <Stack.Screen
        name="CompleteProfileScreen"
        component={CompleteProfileScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNav;
