import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type AppNavParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  AdminPage: undefined;
  Badges: undefined;
  Conversations: undefined;
};

export type AppNavProp = NativeStackNavigationProp<AppNavParamList>;
