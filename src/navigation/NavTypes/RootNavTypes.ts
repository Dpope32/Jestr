import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type AppNavParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Badges: undefined;
  NotificationDetail: { notificationId: number };
};

export type AppNavProp = NativeStackNavigationProp<AppNavParamList>;
