import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import {AppNavParamList} from './NavTypes/RootNavTypes';
import BottomTabNav from './Stacks/BottomTabNav';
import CustomDrawer from '../components/CustomDrawer/CustomDrawer';
import Profile from '../screens/Profile/Profile';
import Settings from '../screens/Settings/Settings';
import Notifications from '../screens/NotificationsScreen';
import {FONTS} from '../theme/theme';

const Drawer = createDrawerNavigator<AppNavParamList>();

const AppNavigator = () => {
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
