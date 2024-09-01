import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type AuthNavParamList = {
  FirstScreen: undefined;
  SignUpScreen: undefined;
  LoginScreen: undefined;
  ConfirmSignUp: {email: string};
  CompleteProfileScreen: {email: string};
  InfoFooterAuth: {content: string};
  ContactUs: undefined;
};

export type AuthNavProp = NativeStackNavigationProp<AuthNavParamList>;
export type AuthNavRouteProp = RouteProp<AuthNavParamList>;
