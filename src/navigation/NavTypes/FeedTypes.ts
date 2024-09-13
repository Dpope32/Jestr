import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

export type FeedNavParamList = {
  Feed: {userEmail: string};
  CommentFeed: undefined;
  AdminPage: undefined;
};

export type FeedNavProp = NativeStackNavigationProp<FeedNavParamList>;
export type FeedNavRouteProp = RouteProp<FeedNavParamList>;
