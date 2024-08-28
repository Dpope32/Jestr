import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import Feed from '../../screens/Feed/Feed';
import Profile from '../../screens/Profile/Profile';
import Settings from '../../components/Settings/Settings';
import Notifications from '../../screens/NotificationsScreen';
import CommentFeed from '../../screens/CommentFeed/CommentFeed';

const Stack = createNativeStackNavigator();

// TODO: add CommentFeed as a modal screen ??

const FeedStackNav: React.FC = () => {
  const getScreenOptions = (): NativeStackNavigationOptions => {
    return {
      headerShown: false,
      gestureEnabled: true,
    };
  };

  return (
    <Stack.Navigator screenOptions={getScreenOptions}>
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen
        name="CommentFeed"
        component={CommentFeed}
        options={{presentation: 'formSheet'}}
      />
    </Stack.Navigator>
  );
};

export default FeedStackNav;
