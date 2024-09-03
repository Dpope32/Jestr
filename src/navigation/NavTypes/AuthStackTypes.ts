import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type AuthNavParamList = {
  Onboarding: undefined;
  FirstScreen: undefined;
  SignUp: undefined;
  Login: undefined;
  ConfirmSignUp: {email: string};
  CompleteProfile: {email: string};
  InfoFooterAuth: {content: string};
  ContactUs: undefined;
  ChangePassword: undefined;
};

export type AuthNavProp = NativeStackNavigationProp<AuthNavParamList>;
export type AuthNavRouteProp = RouteProp<AuthNavParamList>;
