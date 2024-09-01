import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FirstScreen from '../../screens/FirstScreen/FirstScreen';
import SignUpScreen from '../../screens/SignUp/SignUpScreen';
import LoginScreen from '../../screens/Login/LoginScreen';
import LandingPage from '../../screens/LandingPage/LandingPage';
import InfoFooterAuth from '../../screens/InfoFooterAuth/InfoFooterAuth';
import ContactUs from '../../screens/ContactUs/ContactUs';
import ConfirmSignUpScreen from '../../screens/ConfirmSignUp/ConfirmSignUpScreen';
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

      <Stack.Screen name="FirstScreen" component={FirstScreen} />

      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />

      <Stack.Screen name="LoginScreen" component={LoginScreen} />

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

      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNav;
