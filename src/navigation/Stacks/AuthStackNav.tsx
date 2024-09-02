import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FirstScreen from '../../screens/Auth/FirstScreen/FirstScreen';
import SignUpScreen from '../../screens/Auth/SignUp/SignUpScreen';
import LoginScreen from '../../screens/Auth/Login/LoginScreen';
import LandingPage from '../../screens/Auth/LandingPage/LandingPage';
import InfoFooterAuth from '../../screens/Auth/InfoFooterAuth/InfoFooterAuth';
import ContactUs from '../../screens//Auth/ContactUs/ContactUs';
import ConfirmSignUpScreen from '../../screens/Auth/ConfirmSignUp/ConfirmSignUpScreen';
import ChangePassword from '../../screens/Auth/ChangePassword';
import CompleteProfileScreen from '../../screens/Auth/CompleteProfile/CompleteProfileScreen';
import OnboardingScreen from '../../screens/Auth/Onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

const AuthStackNav: React.FC = () => {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Onboarding">
      {/* TODO: TO REMOVE LandingPage after duplicating logic necessary */}
      <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen name="FirstScreen" component={FirstScreen} />

      <Stack.Screen name="SignUp" component={SignUpScreen} />

      <Stack.Screen name="Login" component={LoginScreen} />

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
