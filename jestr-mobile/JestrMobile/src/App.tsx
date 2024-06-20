import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native'; // Import necessary components from react-native
import LandingPage from '../src/screens/LandingPage/LandingPage';
import LoadingScreen from './screens/LoadingScreen';
import { enableScreens } from 'react-native-screens';
import Feed from '../src/screens/Feed/Feed';
import MemeUploadScreen from '../src/screens/MemeUploadScreen/MemeUploadScreen';
import Inbox from '../src/screens/Inbox/Inbox';
import Profile from '../src/screens/Profile/Profile';
import Conversations from '../src/screens/Inbox/Conversations';
import { User } from './screens/Feed/Feed';
import { Message } from './screens/Inbox/Conversations';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';

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
  };
  Profile: {
    user: User;
  };
};

enableScreens();

const Stack = createStackNavigator<RootStackParamList>();

interface ToastInternalState {
  text1?: string;
  props: {
    backgroundColor: string;
    textColor: string;
  };
}

const toastConfig: ToastConfig = {
  success: (internalState: ToastConfigParams<any>) => (
    <View style={{ 
      height: 60, 
      width: '70%', 
      backgroundColor: internalState.props.backgroundColor, 
      padding: 15, 
      borderRadius: 20,
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 2, 
      borderColor: '#00ff00' 
    }}>
      <Text style={{ 
        color: internalState.props.textColor, 
        textAlign: 'center' 
      }}>
        {internalState.text1}
      </Text>
    </View>
  ),
  error: (internalState: ToastConfigParams<any>) => (
    <View style={{ 
      height: 60, 
      width: '100%', 
      backgroundColor: internalState.props.backgroundColor, 
      padding: 15, 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 2, 
      borderColor: '#00ff00' 
    }}>
      <Text style={{ 
        color: internalState.props.textColor, 
        textAlign: 'center' 
      }}>
        {internalState.text1}
      </Text>
    </View>
  ),
};

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
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
export default App;
