import {User} from '../../types/types';

// will be changed / to delete
export type RootStackParamList = {
  Loading: undefined;
  LandingPage: undefined;
  Onboarding: undefined;
  Feed: {user: User};
  Settings: {email: string};
  MemeUploadScreen: {user: any};
  CompleteProfileScreen: {email: string};
  Inbox: {user: any};
  ConfirmSignUp: {email: string};
  AdminPage: undefined;
  Conversations: {
    localUser: any;
    partnerUser: any;
    conversation: {
      id: string;
      messages: any[];
    };
  };
  Profile: {
    user: any;
  };
  ChangePassword: {
    username: string;
    nextStep: any;
  };
};

export type AppNavParamList = {
  BottomTabNav: undefined;
  DrawerNav: undefined;
  Profile: undefined;
  Settings: {email: string};
};
