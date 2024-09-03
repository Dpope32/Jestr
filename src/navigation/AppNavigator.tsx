import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import {AppNavParamList} from './NavTypes/RootNavTypes';
import {FONTS} from '../theme/theme';

import {useUserStore} from '../store/userStore';
import AuthStackNav from './Stacks/AuthStackNav';
import BottomTabNav from './Stacks/BottomTabNav';

import CustomDrawer from '../components/CustomDrawer/CustomDrawer';
import Profile from '../screens/AppNav/Profile/Profile';
import Settings from '../screens/AppNav/Settings/Settings';
import Notifications from '../screens/AppNav/Notifications';

const Drawer = createDrawerNavigator<AppNavParamList>();

const AppNavigator = () => {
  const loggedIn = useUserStore(state => state.loggedIn);

  const screenOptions = {
    headerShown: false,
    drawerActiveBackgroundColor: '#aa18ea',
    drawerActiveTintColor: '#fff',
    drawerInactiveTintColor: '#333',
    drawerLabelStyle: {
      fontSize: 18,
      fontFamily: FONTS.regular,
      color: '#FFF',
    },
  };

  if (!loggedIn) {
    return <AuthStackNav />;
  }

  // TODO:
  // if (isFirstLaunch === true) ==> Onboarding Stack (Stack Nav)
  // ...make isFirstLaunch FALSE at the end of Onboarding flow
  // else if (isLoggedIn === true) ==> App Stack (DrawerNav)
  // else ==> Auth Stack (Stack Nav) or Landing Page called

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={screenOptions}>
      <Drawer.Screen name="Home" component={BottomTabNav} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="Notifications" component={Notifications} />
    </Drawer.Navigator>
  );

  // return <AuthStackNav />;
};

export default AppNavigator;
