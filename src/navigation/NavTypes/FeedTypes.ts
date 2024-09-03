import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import { User } from 'types/types';

export type FeedNavParamList = {
  Feed: undefined;
  CommentFeed: undefined;
  Notifications: undefined;
  Settings: undefined;
  Profile: {
    user?: User;
  };
};

export type FeedNavProp = NativeStackNavigationProp<FeedNavParamList>;
export type FeedNavRouteProp = RouteProp<FeedNavParamList>;