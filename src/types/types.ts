// src/types/types.ts
import {View} from 'react-native';
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
  isFollowing?: boolean;
  userId?: string;
  isAdmin?: boolean;
  location?: string;
  website?: string;
  birthDate?: string;
  darkMode?: boolean;
  likesPublic?: boolean;
  notificationsEnabled?: boolean;
  isFollowed?: boolean;
}

export interface ServerError extends Error {
  response?: {
    data?: any;
  };
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
  Feed: { userEmail: string };
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
    user: User;
  };
  ChangePassword: {
    username: string;
    nextStep: any;
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
  isFollowed: boolean;
  email: string;
  liked?: boolean; 
  doubleLiked?: boolean; 
  memeUser?: Partial<User>;
  downloaded?: boolean;
  followStatus?: {
    isFollowing: boolean;
    canFollow: boolean;
  };
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
  currentUserId?: string;
  uploadTimestamp: string;
  handleLike: () => void;
  handleDownload: () => void;
  handleSingleTap?: () => void;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  memes: Meme[];
  likedIndices: Set<number>;
  doubleLikedIndices: Set<number>;
  downloadedIndices: Set<number>;
  likeDislikeCounts: Record<number, { likeCount: number; dislikeCount: number }>;
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
  index: number;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  initialLikeStatus: {
    liked: boolean;
    doubleLiked: boolean;
  };
  onLikeStatusChange: (
    memeID: string,
    status: {liked: boolean; doubleLiked: boolean},
    newLikeCount: number,
  ) => void;
  liked: boolean;
  doubleLiked: boolean;
  isDarkMode: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  isCommentFeedVisible: boolean;
  numOfComments?: number;
  onMemeViewed: () => void;
};

export type ProfilePanelProps = {
  isVisible: boolean;
  onClose: () => void;
  profilePicUrl: string | ProfileImage | null;
  username: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
  FollowingCount?: number;
  user: User | null;
  navigation: any;
};


export interface IconsAndContentProps {
  memeUser: any;
  caption: string;
  uploadTimestamp: string;
  index: number;
  isFollowed: boolean;
  currentIndex: number;
  isFollowing?: boolean;
  handleFollow: () => void;
  counts: {
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
  };
  debouncedHandleLike: () => void;
  liked: boolean;
  doubleLiked: boolean;
  handleDownloadPress: () => void;
  isSaved: boolean;
  toggleCommentFeed: () => void;
  formatDate: (date: string) => string;
  animatedBlurIntensity: Animated.Value;
  iconAreaRef: React.RefObject<View>;
  onShare: (type: ShareType, username: string, message: string) => void;
  user: User | null;
  memeID: string;
  numOfComments: number;
}

export type Message = {
  MessageID: string;
  SenderID: string;
  ReceiverID: string;
  Content: string;
  Timestamp: string;
  Status: 'sent' | 'delivered' | 'read';
  ConversationID: string;
  sentByMe?: boolean;
  read?: boolean;
  reactions?: string[];
};

export interface Conversation {
  id: string;
  ConversationID: string;
  userEmail: string;
  username: string;
  profilePicUrl: string | ProfileImage | null;
  lastMessage: {
    Content: string;
    Timestamp: string;
  };
  timestamp: string;
  messages: any[];
  UnreadCount: number;
  LastReadMessageID: string;
  partnerUser: {
    email: string;
    username: string | null;
    profilePic: string | null;
  };
}

export interface FeedbackItem {
  FeedbackID: string;
  Email: string;
  Message: string;
  Status: string;
  Timestamp: string;
}

export type MemeListProps = {
    memes: Meme[];
    user: User | null;
    isDarkMode: boolean;
    onEndReached: () => void;
    toggleCommentFeed: () => void;
    updateLikeStatus: (memeID: string, status: any, newLikeCount: number) => void;
    currentMediaIndex: number;
    setCurrentMediaIndex: (index: number) => void;
    currentUserId: string | undefined;
    isCommentFeedVisible: boolean;
    isLoadingMore: boolean;
    numOfComments: number;
    handleMemeViewed: (memeId: string) => Promise<void>;
  };
  
