import React, {useEffect} from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  BottomTabNavigationOptions,
  BottomTabBar,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome, faPlus, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {useTabBarStore} from '../../stores/tabBarStore';
import HeaderFeed from '../../components/HeaderFeed/HeaderFeed';
import * as Haptics from 'expo-haptics';

import FeedStackNav from '../Stacks/FeedStackNav';
import UploadStackNav from '../Stacks/UploadStackNav';
import InboxStackNav from '../Stacks/InboxStackNav';

const Tab = createBottomTabNavigator();

export type TabNavigationProp =
  | BottomTabNavigationProp<ParamListBase>
  | StackNavigationProp<ParamListBase>;

const BottomTabNav = () => {
  const isTabBarVisible = useTabBarStore(state => state.isTabBarVisible);
  const isCommentModalVisible = useTabBarStore(
    state => state.isCommentModalVisible,
  );
  const customIcons = {home: faHome, upload: faPlus, inbox: faEnvelope};
  const iconSize = () => Math.floor(Dimensions.get('window').width * 0.07);

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(error =>
      console.error('Error triggering haptic feedback:', error),
    );
  };

  const getTabNavigatorOptions = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
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
        // console.log('Rendering tab icon for:', icon.iconName);
        return (
          <FontAwesomeIcon
            icon={icon}
            size={iconSize()}
            style={{color: '#1bd40b'}}
          />
        );
      },
      header: headerComponent
        ? ({
            navigation,
            route,
            options,
          }: {
            navigation: TabNavigationProp;
            route: RouteProp<ParamListBase, string>;
            options: BottomTabNavigationOptions;
          }) => {
            if (!isTabBarVisible) return null;
            return <HeaderFeed />;
          }
        : undefined,
      headerShown: !!headerComponent,
      tabBarButton: (props: any) => (
        <TouchableOpacity
          {...props}
          onPress={e => {
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
      screenOptions={({route}) => getTabNavigatorOptions(route)}
      tabBar={props => {
        if (!isTabBarVisible || isCommentModalVisible) return null;
        return (
          <View style={styles.tabBarContainer}>
            <BottomTabBar {...props} />
          </View>
        );
      }}>
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
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    zIndex: 0,
    paddingBottom: Platform.OS === 'ios' ? 0 : 0, // Account for iPhone X and later
  },
});

export default BottomTabNav;
