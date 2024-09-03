import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type InboxNavParamList = {
  Inbox: undefined;
  Conversations: {
    localUser: any;
    partnerUser: any;
    conversation: any;
  };
};

export type InboxNavProp = NativeStackNavigationProp<InboxNavParamList>;
export type InboxNavRouteProp = RouteProp<InboxNavParamList>;
