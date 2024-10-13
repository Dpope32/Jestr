import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {InboxNavParamList} from './InboxStackTypes';

export type BottomTabNavParamList = {
  FeedStackNav: undefined;
  UploadStackNav: undefined;
  InboxStackNav: InboxNavParamList;
  // InboxStackNav: {
  //   screen: string;
  //   params: {
  //     partnerUser: any;
  //     conversation: any;
  //     currentMedia: any;
  //   };
  // };
};

export type BottomNavProp = NativeStackNavigationProp<BottomTabNavParamList>;
