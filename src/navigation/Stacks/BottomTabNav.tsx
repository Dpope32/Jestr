import {Dimensions, View, StyleSheet} from 'react-native';
import {
  BottomTabNavigationOptions,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RouteProp, ParamListBase} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome, faPlus, faEnvelope} from '@fortawesome/free-solid-svg-icons';
// import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useTabBarStore} from '../../store/tabBarStore';

// STACKS
import FeedStackNav from './FeedStackNav';
import UploadStackNav from './UploadStackNav';
import InboxStackNav from './InboxStackNav';

const Tab = createBottomTabNavigator();

// ########## START ##########
const BottomTabNav = () => {
  const insets = useSafeAreaInsets();
  const isTabBarVisible = useTabBarStore(state => state.isTabBarVisible);

  const customIcons = {home: faHome, upload: faPlus, inbox: faEnvelope};
  const iconSize = () => Math.floor(Dimensions.get('window').width * 0.07);

  const getTabNavigatorOptions = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
    return {
      headerShown: false,
      tabBarStyle: {
        display: isTabBarVisible ? 'flex' : 'none',
      },
      tabBarShowLabel: false,
      tabBarItemStyle: {},
    };
  };

  const getFeedStackOps = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
    // console.log('route: ', route);
    // const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';
    // console.log('routeName: ', routeName);
    // const shouldHideTabBar = ['SingleVisual', 'SingleAudio'].includes(
    //   routeName,
    // );

    return {
      tabBarStyle: {
        display: 'flex',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
        // borderWidth: 1,
        // borderColor: '#FFF',
      },
      tabBarIcon: () => (
        <FontAwesomeIcon
          icon={customIcons.home}
          size={iconSize()}
          style={{color: '#1bd40b'}}
        />
      ),
    };
  };

  const getUploadStackOps = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
    return {
      tabBarStyle: {
        display: 'flex',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
      },
      tabBarIcon: () => (
        <FontAwesomeIcon
          icon={customIcons.upload}
          size={iconSize()}
          style={{color: '#1bd40b'}}
        />
      ),
    };
  };

  const getInboxStackOps = (
    route: RouteProp<ParamListBase, string>,
  ): BottomTabNavigationOptions => {
    return {
      tabBarStyle: {
        display: 'flex',
        backgroundColor: 'transparent',
        borderTopColor: 'transparent',
      },
      tabBarIcon: () => (
        <FontAwesomeIcon
          icon={customIcons.inbox}
          size={iconSize()}
          style={{color: '#1bd40b'}}
        />
      ),
    };
  };

  return (
    <Tab.Navigator
      initialRouteName="FeedStackNav"
      screenOptions={({route}) => getTabNavigatorOptions(route)}
      tabBar={props => {
        console.log('props: ', props);
        if (!isTabBarVisible) return null;

        return (
          <View style={styles.tabBarPropStyle}>
            <BottomTabBar {...props} />
          </View>
        );
      }}>
      <Tab.Screen
        name="FeedStackNav"
        component={FeedStackNav}
        options={({route}) => getFeedStackOps(route)}
      />

      <Tab.Screen
        name="UploadStackNav"
        component={UploadStackNav}
        options={({route}) => getUploadStackOps(route)}
      />

      <Tab.Screen
        name="InboxStackNav"
        component={InboxStackNav}
        options={({route}) => getInboxStackOps(route)}
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
    // borderWidth: 1,
    // borderColor: '#FFF',
  },
});

export default BottomTabNav;
