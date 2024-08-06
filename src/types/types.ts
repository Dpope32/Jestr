// src/types/types.ts
import { SignInOutput } from '@aws-amplify/auth';
import { ViewToken  } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Animated } from 'react-native';

export type LandingPageNavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;

export interface User {
    email: string;
    username: string;
    profilePic: string;
    displayName: string;
    headerPic: string;
    creationDate: string;
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
  }
  

export type FetchMemesResult = {
  memes: Meme[];
  lastEvaluatedKey: string | null;
};


export type RootStackParamList = {
  Loading: undefined;
  LandingPage: undefined;
  Feed: { user: User };
  Settings: { email: string };
  MemeUpload: { user: any };
  CompleteProfileScreen: { email: string };
  Inbox: { user: any };
  ConfirmSignUp: { email: string };
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
  mediaType: 'image' | 'video';
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
  liked?: boolean; // Add this line
  doubleLiked?: boolean; // Add this line
  memeUser?: Partial<User>;
};

export type OnViewableItemsChanged = {
  viewableItems: Array<ViewToken>;
  changed: Array<ViewToken>;
};

export type MediaPlayerProps = {
  memeUser: Partial<User>;
  currentMedia: string;
  mediaType: 'image' | 'video';
  username: string;
  caption: string;
  uploadTimestamp: string;
  handleLike: () => void;
  handleDownload: () => void;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  likedIndices: Set<number>;
  doubleLikedIndices: Set<number>;
  downloadedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>;
  currentMediaIndex: number;
  user: User | null;
  likeCount: number;
  downloadCount: number;
  commentCount: number;
  shareCount: number;
  profilePicUrl: string;
  memeID: string;
  nextMedia: string | null;
  prevMedia: string | null;
  initialLikeStatus: {
    liked: boolean;
    doubleLiked: boolean;
  };
  onLikeStatusChange: (memeID: string, status: { liked: boolean; doubleLiked: boolean }, newLikeCount: number) => void;
  liked: boolean; // Add this line
  doubleLiked: boolean; // Add this line
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  
};