import React, { useEffect } from 'react';
import { Dimensions, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import {BottomTabNavigationOptions,BottomTabBar,BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useTabBarStore } from '../../stores/tabBarStore';
import HeaderFeed from '../../components/HeaderFeed/HeaderFeed';
import * as Haptics from 'expo-haptics';

import FeedStackNav from '../Stacks/FeedStackNav';
import UploadStackNav from '../Stacks/UploadStackNav';
import InboxStackNav from '../Stacks/InboxStackNav';

const Tab = createBottomTabNavigator();

type TabNavigationProp = BottomTabNavigationProp<ParamListBase> | StackNavigationProp<ParamListBase>;

const BottomTabNav = () => {
  useEffect(() => {
    console.log('BottomTabNav component mounted');
  }, []);

  const isTabBarVisible = useTabBarStore(state => state.isTabBarVisible);

  const customIcons = { home: faHome, upload: faPlus, inbox: faEnvelope };
  const iconSize = () => Math.floor(Dimensions.get('window').width * 0.07);

  const handleTabPress = () => {
    console.log('Tab pressed, triggering haptic feedback');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      .then(() => console.log('Haptic feedback triggered successfully'))
      .catch(error => console.error('Error triggering haptic feedback:', error));
  };

  const getTabNavigatorOptions = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
    console.log('Getting tab navigator options for route:', route.name);
    return {
      tabBarShowLabel: false,
      tabBarStyle: {
        display: 'flex',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
        paddingBottom: Platform.OS === 'android' ? 5 : 0,
      },
    };
  };

  const createTabOptions = (icon: any, headerComponent?: React.FC) => {
    return {
      tabBarIcon: () => {
        console.log('Rendering tab icon for:', icon.iconName);
        return (
          <FontAwesomeIcon
            icon={icon}
            size={iconSize()}
            style={{ color: '#1bd40b' }}
          />
        );
      },
      header: headerComponent ? ({ navigation, route, options }: {
        navigation: TabNavigationProp;
        route: RouteProp<ParamListBase, string>;
        options: BottomTabNavigationOptions;
      }) => {
        console.log('Rendering header for route:', route.name);
        if (!isTabBarVisible) return null;
        return <HeaderFeed />;
      } : undefined,
      headerShown: !!headerComponent,
      tabBarButton: (props: any) => (
        <TouchableOpacity
          {...props}
          onPress={(e) => {
            console.log('Tab button pressed');
            handleTabPress();
            if (props.onPress) {
              props.onPress(e);
            }
          }}
        />
      ),
    };
  };

  return (
    <Tab.Navigator
      initialRouteName="FeedStackNav"
      screenOptions={({ route }) => getTabNavigatorOptions(route)}
      tabBar={(props) => {
        console.log('Rendering tab bar, isTabBarVisible:', isTabBarVisible);
        if (!isTabBarVisible) return null;
        return (
          <View style={styles.tabBarPropStyle}>
            <BottomTabBar {...props} />
          </View>
        );
      }}
    >
      <Tab.Screen
        name="FeedStackNav"
        component={FeedStackNav}
        options={() => createTabOptions(customIcons.home, HeaderFeed)}
      />
      <Tab.Screen
        name="UploadStackNav"
        component={UploadStackNav}
        options={() => createTabOptions(customIcons.upload)}
      />
      <Tab.Screen
        name="InboxStackNav"
        component={InboxStackNav}
        options={() => createTabOptions(customIcons.inbox)}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarPropStyle: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
});

export default BottomTabNav;