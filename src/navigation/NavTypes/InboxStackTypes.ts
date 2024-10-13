import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

import {User} from '../../types/types';
import {Conversation} from '../../types/messageTypes';

export type InboxNavParamList = {
  Inbox: undefined;
  Conversations: {
    partnerUser: User;
    conversation?: Conversation;
    currentMedia?: string;
  };
};

// export type ConversationNavParams = {
//   screen: string,
//       params: {
//         partnerUser: any,
//         conversation: any,
//         currentMedia: any,
//       },
// };

export type InboxNavProp = NativeStackNavigationProp<InboxNavParamList>;
export type InboxNavRouteProp = RouteProp<InboxNavParamList>;
