import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type AuthNavParamList = {
  InfoFooterAuth: {content: string};
  ContactUs: undefined;
};

export type AuthNavProp = NativeStackNavigationProp<AuthNavParamList>;
export type AuthNavRouteProp = RouteProp<AuthNavParamList>;
