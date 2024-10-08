import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

import {User, Conversation} from '../../types/types';

export type InboxNavParamList = {
  Inbox: undefined;
  Conversations: {
    partnerUser: User;
    conversation: Conversation;
    currentMedia: string;
  };
};

export type InboxNavProp = NativeStackNavigationProp<InboxNavParamList>;
export type InboxNavRouteProp = RouteProp<InboxNavParamList>;
