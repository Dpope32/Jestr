// userStore.ts
import { create } from 'zustand';
import { ImagePickerAsset } from 'expo-image-picker';
import { Meme, ProfileImage } from '../types/types';  // Adjust the import path as needed

export interface UserState {
  resetUserState: () => void;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  creationDate: string;
  CreationDate ? : string;
  followersCount: number;
  language: 'en' | 'es' | 'fr'; // We'll just use 'en' for now
  notificationsEnabled: boolean;
  likesPublic: boolean;
  darkMode: boolean;
  followingCount: number;
  FollowingCount?: number;
  posts: Meme[];
  likedMemes: Meme[];
  downloadedMemes: Meme[];
  viewedMemes: Meme[];
  profilePic: string | ProfileImage | null; // Allow string or ProfileImage
  headerPic: string | ProfileImage | null;  // Allow string or ProfileImage
  setDarkMode?: (darkMode: boolean) => void;
  setLanguage?: (language: 'en' | 'es' | 'fr') => void;
  setLikesPublic?: (likesPublic: boolean) => void;
  setNotificationsEnabled?: (notificationsEnabled: boolean) => void;
  setBio?: (bio: string) => void;
  setPosts?: (posts: Meme[]) => void;
  setLikedMemes?: (memes: Meme[]) => void;
  setDownloadedMemes?: (memes: Meme[]) => void;
  setViewedMemes?: (memes: Meme[]) => void;
  setUserDetails: (details: Partial<UserState>) => void;
  setHeaderPic: (headerPic: string | ProfileImage | null) => void;
  setProfilePic: (profilePic: string | ProfileImage | null) => void;
  setFollowersCount: (count: number) => void;
  setFollowingCount: (count: number) => void;
  isAdmin?: boolean;
  userId?: string;
  incrementFollowersCount: () => void;
  decrementFollowersCount: () => void;
  incrementFollowingCount: () => void;
  decrementFollowingCount: () => void;
}
export const useUserStore = create<UserState>((set) => ({
  bio: '',
  username: '',
  displayName: '',
  email: '',
  followersCount: 0,
  followingCount: 0,
  setFollowersCount: (count) => set({ followersCount: count }),
  setFollowingCount: (count) => set({ followingCount: count }),
  incrementFollowersCount: () => set((state) => ({ followersCount: state.followersCount + 1 })),
  decrementFollowersCount: () => set((state) => ({ followersCount: Math.max(0, state.followersCount - 1) })),
  incrementFollowingCount: () => set((state) => ({ followingCount: state.followingCount + 1 })),
  decrementFollowingCount: () => set((state) => ({ followingCount: Math.max(0, state.followingCount - 1) })),
  creationDate: '',
  posts: [],
  likedMemes: [],
  downloadedMemes: [],
  viewedMemes: [],
  profilePic: null,
  headerPic: null,
  darkMode: false,
  language: 'en',
  likesPublic: true,
  notificationsEnabled: true,
  setDarkMode: (darkMode: boolean) => set({ darkMode }),
  setLanguage: (language) => set({ language }),
  setLikesPublic: (likesPublic: boolean) => set({ likesPublic }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setBio: (bio: string) => set({ bio }),
  setHeaderPic: (headerPic: string | ProfileImage | null) => set({ headerPic }),
  setProfilePic: (profilePic: string | ProfileImage | null) => {
    // Fallback to a default image if `profilePic` is empty
    if (typeof profilePic === 'string' && !profilePic.trim()) {
      profilePic = null;
    }
    set({ profilePic });
  },
  setPosts: (posts) => set({ posts }),
  setLikedMemes: (memes) => set({ likedMemes: memes }),
  setDownloadedMemes: (memes) => set({ downloadedMemes: memes }),
  setViewedMemes: (memes) => set({ viewedMemes: memes }),
  setUserDetails: (details) => set((state) => ({
    ...state,
    ...details,
    followingCount: details.followingCount, // Make sure this line exists
    profilePic: details.profilePic || state.profilePic,
    headerPic: details.headerPic || state.headerPic,
  })),

  resetUserState: () =>
    set({
      bio: '',
      username: '',
      displayName: '',
      email: '',
      followersCount: 0,
      followingCount: 0,
      creationDate: '',
      posts: [],
      likedMemes: [],
      downloadedMemes: [],
      viewedMemes: [],
      profilePic: null,
      darkMode: false,
      language: 'en',
      likesPublic: true,
      notificationsEnabled: true,
      headerPic: null,
      isAdmin: undefined,
      userId: undefined,
    }),
}));
