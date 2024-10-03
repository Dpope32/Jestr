import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InboxNavParamList } from './InboxStackTypes';

export type BottomTabNavParamList = {
  FeedStackNav: undefined;
  UploadStackNav: undefined;
  InboxStackNav: InboxNavParamList; // Updated to include InboxNavParamList
};

export type BottomNavProp = NativeStackNavigationProp<BottomTabNavParamList>;
