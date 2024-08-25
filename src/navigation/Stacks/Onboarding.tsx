import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OnboardingScreen from '../../screens/LandingPage/OnboardingScreen';

const Stack = createStackNavigator();

const Onboarding = () => {
  const onboardingComplete = () => {
    console.log('Onboarding complete');
  };

  return (
    <Stack.Navigator>
      <Stack.Screen name="Onboarding" options={{headerShown: false}}>
        {props => {
          console.log('Rendering Onboarding screen');
          return (
            <OnboardingScreen {...props} onComplete={onboardingComplete} />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default Onboarding;
