import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type FeedNavParamList = {
  Feed: undefined;
  CommentFeed: undefined;
  // Profile: undefined;
  // Settings: undefined;
  // Notifications: undefined;
};

export type FeedNavProp = NativeStackNavigationProp<FeedNavParamList>;
export type FeedNavRouteProp = RouteProp<FeedNavParamList>;
