import React, {lazy} from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {RootStackParamList} from '../types/types';
import Feed from '../screens/Feed/Feed';
import Profile from '../screens/Profile/Profile';

// Commented for now
// import LandingPage from '../screens/LandingPage/LandingPage';

const Stack = createStackNavigator<RootStackParamList>();

// Lazy load the screens
const LoadingScreen = lazy(() => import('../screens/Loading/LoadingScreen'));
const MemeUploadScreen = lazy(
  () => import('../screens/MemeUploadScreen/index'),
);
const AdminPage = lazy(() => import('../screens/AdminPageScreen'));
const Inbox = lazy(() => import('../screens/Inbox/Inbox'));
const Conversations = lazy(() => import('../screens/Inbox/Conversations'));
const ChangePassword = lazy(() => import('../screens/ChangePasswordScreen'));
const ConfirmSignUpScreen = lazy(
  () => import('../screens/LandingPage/ConfirmSignUpScreen'),
);
const CompleteProfileScreen = lazy(
  () => import('../screens/LandingPage/CompleteProfileScreen'),
);
const Settings = lazy(() => import('../components/Settings/Settings'));

// === APP NAVIGATOR ===
const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ConfirmSignUp"
        component={ConfirmSignUpScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="MemeUploadScreen"
        component={MemeUploadScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="AdminPage"
        component={AdminPage}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="CompleteProfileScreen"
        component={CompleteProfileScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Inbox"
        component={Inbox}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Conversations"
        component={Conversations}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{headerShown: false}}
      />

      {/* == KEEP IT == */}
      {/* <Stack.Screen
        name="LandingPage"
        component={LandingPage}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
