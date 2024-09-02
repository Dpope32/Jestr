import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import Profile from '../../screens/AppNav/Profile/Profile';
import Settings from '../../screens/AppNav/Settings/Settings';
import Notifications from '../../screens/AppNav/Notifications';
import CustomDrawer from '../../components/CustomDrawer/CustomDrawer';

const Drawer = createDrawerNavigator();

const DrawerStackNav = () => {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="Notifications" component={Notifications} />
    </Drawer.Navigator>
  );
};
export default DrawerStackNav;
