import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type AuthNavParamList = {
  Onboarding: undefined;
  LandingPage: undefined;
  SignUp: undefined;
  Login: undefined;
  ConfirmSignUp: {email: string};
  CompleteProfile: {email: string};
  InfoFooterAuth: {content: string};
  ContactUs: undefined;
  ChangePassword: {
    username?: string;
    nextStep?: any;
  };
  Feed: {userEmail: string};
};

export type AuthNavProp = NativeStackNavigationProp<AuthNavParamList>;
export type AuthNavRouteProp = RouteProp<AuthNavParamList>;
export type FooterNavRouteProp = RouteProp<AuthNavParamList, 'InfoFooterAuth'>;
export type ConfirmNavRouteProp = RouteProp<AuthNavParamList, 'ConfirmSignUp'>;
