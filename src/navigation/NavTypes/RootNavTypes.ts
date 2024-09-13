import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {User} from '../../types/types';

export type AppNavParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type AppNavProp = NativeStackNavigationProp<AppNavParamList>;
