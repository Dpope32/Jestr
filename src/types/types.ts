import {ViewToken} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Animated} from 'react-native';

export type LandingPageNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Feed'
>;

export interface User {
  email: string;
  username: string;
  profilePic: string | ProfileImage | null;
  headerPic: string | ProfileImage | null;
  displayName: string;
  CreationDate?: string | undefined;
  followersCount: number;
  followingCount: number;
  Bio?: string;
  bio?: string;
  isFollowing?: boolean; // Make it optional if not all users have this property
  userId?: string;
  isAdmin?: boolean;
  location?: string;
  website?: string;
  birthDate?: string;
  darkMode?: boolean;
  likesPublic?: boolean;
  notificationsEnabled?: boolean;
}

export type ProfileImage = {
  url?: string;
  uri?: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileName?: string | null;
  fileSize?: number;
};

export type FetchMemesResult = {
  memes: Meme[];
  lastEvaluatedKey: string | null;
};

export type ShareType =
  | 'copy'
  | 'message'
  | 'snapchat'
  | 'facebook'
  | 'twitter'
  | 'email'
  | 'friend'
  | 'instagram';

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
    nextStep: any; // Replace 'any' with the correct type from AWS Amplify
  };
};

export type LetterScale = {
  scale: Animated.AnimatedInterpolation<string | number>;
  opacity: Animated.AnimatedInterpolation<string | number>;
  translateY: Animated.AnimatedInterpolation<string | number>;
}[];

export type Meme = {
  memeID: string;
  mediaType: string;
  url: string;
  caption: string;
  uploadTimestamp: string;
  likeCount: number;
  downloadCount: number;
  commentCount: number;
  shareCount: number;
  username: string;
  profilePicUrl: string;
  email: string;
  liked?: boolean;
  doubleLiked?: boolean;
  memeUser?: Partial<User>;
};

export type OnViewableItemsChanged = {
  viewableItems: Array<ViewToken>;
  changed: Array<ViewToken>;
};

export type MediaPlayerProps = {
  currentMedia: string;
  mediaType: string;
  username: string;
  handleSingleTap?: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  // user: User | null;
  profilePicUrl: string;
  memeID: string;
  index: number;
  currentIndex: number;
  numOfComments?: number;
};

export type ProfilePanelProps = {
  isVisible: boolean;
  onClose: () => void;
};
