import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import {AppNavParamList} from './NavTypes/RootNavTypes';
import {FONTS} from '../theme/theme';

import {useUserStore} from '../stores/userStore';
import AuthStackNav from './Stacks/AuthStackNav';
import BottomTabNav from './Stacks/BottomTabNav';

import CustomDrawer from '../components/CustomDrawer/CustomDrawer';
import Profile from '../screens/AppNav/Profile/Profile';
import Settings from '../screens/AppNav/Settings/Settings';
import Notifications from '../screens/AppNav/Notifications';
// import {getToken} from '../stores/secureStore';

const Drawer = createDrawerNavigator<AppNavParamList>();

const AppNavigator = () => {
  const username = useUserStore(state => state.username);
  // console.log('AppNavigator - username:', username);

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

  if (!username) {
    return <AuthStackNav />;
  }

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
};

export default AppNavigator;
