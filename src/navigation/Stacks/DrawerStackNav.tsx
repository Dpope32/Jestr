import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import Profile from '../../screens/AppNav/Profile/Profile';
import Settings from '../../screens/AppNav/Settings/Settings';
import Badges from '../../screens/AppNav/Badges/Badges';
import CustomDrawer from '../../components/CustomDrawer/CustomDrawer';

const Drawer = createDrawerNavigator();

const DrawerStackNav = () => {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="Badges" component={Badges} />
    </Drawer.Navigator>
  );
};
export default DrawerStackNav;
