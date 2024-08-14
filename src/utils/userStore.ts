// userStore.ts
import { create } from 'zustand';
import { ImagePickerAsset } from 'expo-image-picker';
import { Meme } from '../types/types';  // Adjust the import path as needed

export interface UserState {
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
  posts: Meme[];
  likedMemes: Meme[];
  downloadedMemes: Meme[];
  viewedMemes: Meme[];
  profilePic: string | ProfileImage | null; // Allow string or ProfileImage
  headerPic: string | ProfileImage | null;  // Allow string or ProfileImage
  setDarkMode: (darkMode: boolean) => void;
  setLanguage: (language: 'en' | 'es' | 'fr') => void;
  setLikesPublic: (likesPublic: boolean) => void;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
  setBio: (bio: string) => void;
  setPosts: (posts: Meme[]) => void;
  setLikedMemes: (memes: Meme[]) => void;
  setDownloadedMemes: (memes: Meme[]) => void;
  setViewedMemes: (memes: Meme[]) => void;
  setUserDetails: (details: Partial<UserState>) => void;
  setHeaderPic: (headerPic: string | ProfileImage | null) => void;
  setProfilePic: (profilePic: string | ProfileImage | null) => void;
  isAdmin?: boolean;
}

export type ProfileImage = {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileName?: string | null;
  fileSize?: number;
};

export const useUserStore = create<UserState>((set) => ({
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
      setDarkMode: (darkMode) => set({ darkMode }),
      setLanguage: (language) => set({ language }),
      setLikesPublic: (likesPublic) => set({ likesPublic }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  headerPic: null,
  setBio: (bio: string ) => set({ bio }),
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
    profilePic: details.profilePic || state.profilePic,
    headerPic: details.headerPic || state.headerPic,
  })),
}));
