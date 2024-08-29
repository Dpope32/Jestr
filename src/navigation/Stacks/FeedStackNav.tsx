import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import Feed from '../../screens/Feed/Feed';
import CommentFeed from '../../screens/CommentFeed/CommentFeed';

const Stack = createNativeStackNavigator();

const FeedStackNav: React.FC = () => {
  const getScreenOptions = (): NativeStackNavigationOptions => {
    return {
      headerShown: false,
      gestureEnabled: true,
    };
  };

  return (
    <Stack.Navigator screenOptions={getScreenOptions} initialRouteName="Feed">
      <Stack.Screen name="Feed" component={Feed} />
      <Stack.Screen
        name="CommentFeed"
        component={CommentFeed}
        options={{presentation: 'formSheet'}}
      />
    </Stack.Navigator>
  );
};

export default FeedStackNav;
