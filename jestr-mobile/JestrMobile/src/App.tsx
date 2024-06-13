// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingPage from '../src/screens/LandingPage/LandingPage';
import LoadingScreen from './screens/LoadingScreen';
import { enableScreens } from 'react-native-screens';
import Feed from '../src/screens/Feed/Feed';
import MemeUploadScreen from '../src/screens/MemeUploadScreen/MemeUploadScreen';
import Inbox from '../src/screens/Inbox/Inbox';
import Conversations from '../src/screens/Inbox/Conversations';
import { User } from './screens/Feed/Feed';
import { Message } from './screens/Inbox/Conversations';


export type RootStackParamList = {
  Loading: undefined;
  LandingPage: undefined;
  Feed: undefined;
  MemeUpload: undefined;
  Inbox: undefined;
  Conversations: {
    user: User;
    conversation: {
      id: string;
      username: string;
      profilePicUrl: string;
      messages: Message[];
    };
    previewMeme: string;
  };
};

enableScreens();

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading">
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
        <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />
        <Stack.Screen name="MemeUpload" component={MemeUploadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Inbox" component={Inbox} options={{ headerShown: false }} />  
        <Stack.Screen
  name="Conversations"
  component={Conversations}
  options={{ headerShown: false }}
  initialParams={{
    user: {} as User,
    conversation: {
      id: '',
      username: '',
      profilePicUrl: '',
      messages: [],
    },
  }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;