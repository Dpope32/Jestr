import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Inbox from '../../screens/AppNav/Inbox/Inbox';
import Conversations from '../../screens/AppNav/Inbox/Conversations';

const Stack = createNativeStackNavigator();

const InboxStackNav: React.FC = () => {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Inbox" component={Inbox} />
      <Stack.Screen name="Conversations" component={Conversations} />
    </Stack.Navigator>
  );
};

export default InboxStackNav;
