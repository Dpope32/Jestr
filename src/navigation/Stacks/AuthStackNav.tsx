import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LandingPage from '../../screens/AuthNav/LandingPage/LandingPage';
import SignUpScreen from '../../screens/AuthNav/SignUp/SignUpScreen';
import LoginScreen from '../../screens/AuthNav/Login/LoginScreen';
import InfoFooterAuth from '../../screens/AuthNav/InfoFooterAuth/InfoFooterAuth';
import ContactUs from '../../screens/AuthNav/ContactUs/ContactUs';
import ConfirmSignUpScreen from '../../screens/AuthNav/ConfirmSignUp/ConfirmSignUpScreen';
import ChangePassword from '../../screens/AuthNav/ChangePassword';
import CompleteProfileScreen from '../../screens/AuthNav/CompleteProfile/CompleteProfileScreen';
import OnboardingScreen from '../../screens/AuthNav/Onboarding/OnboardingScreen';
import {useUserStore} from '../../stores/userStore';

const Stack = createNativeStackNavigator();

const AuthStackNav: React.FC = () => {
  const isFirstLaunch = useUserStore(state => state.isFirstLaunch);
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={isFirstLaunch === true ? 'Onboarding' : 'LandingPage'}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name="LandingPage" component={LandingPage} />
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
