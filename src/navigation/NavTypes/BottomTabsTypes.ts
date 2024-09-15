import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type BottomTabNavParamList = {
  FeedStackNav: undefined;
  UploadStackNav: undefined;
  InboxStackNav: undefined;
};

export type BottomNavProp = NativeStackNavigationProp<BottomTabNavParamList>;
