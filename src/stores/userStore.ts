import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meme, ProfileImage } from '../types/types';

export interface UserState {
  isFirstLaunch: boolean;
  setIsFirstLaunch: (isFirstLaunch: boolean) => void;
  resetUserState: () => void;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  creationDate: string;
  CreationDate?: string;
  followersCount: number;
  FollowersCount?: number;
  darkMode: boolean;
  followingCount: number;
  FollowingCount?: number;
  tempPassword: string;
  setTempPassword: (password: string) => void;
  profilePic: string | ProfileImage | null; 
  headerPic: string | ProfileImage | null; 
  setDarkMode?: (darkMode: boolean) => void;
  setBio?: (bio: string) => void;
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
export const useUserStore = create(
  persist(
    immer<UserState>((set) => ({
      isFirstLaunch: true,
      setIsFirstLaunch: isFirstLaunch => set({isFirstLaunch}),
      bio: '',
      username: '',
      displayName: '',
      email: '',
      followersCount: 0,
      followingCount: 0,
      setFollowersCount: count => set({followersCount: count}),
      setFollowingCount: count => set({followingCount: count}),
      incrementFollowersCount: () =>
        set(state => ({followersCount: state.followersCount + 1})),
      decrementFollowersCount: () =>
        set(state => ({followersCount: Math.max(0, state.followersCount - 1)})),
      incrementFollowingCount: () =>
        set(state => ({followingCount: state.followingCount + 1})),
      decrementFollowingCount: () =>
        set(state => ({followingCount: Math.max(0, state.followingCount - 1)})),
      creationDate: '',
      tempPassword: '',
      setTempPassword: (password: string) => set({ tempPassword: password }),
      profilePic: null,
      headerPic: null,
      darkMode: false,
      likesPublic: true,
      setDarkMode: (darkMode: boolean) => set({darkMode}),
      setBio: (bio: string) => set({bio}),
      setHeaderPic: (headerPic: string | ProfileImage | null) => set({headerPic}),
      setProfilePic: (profilePic: string | ProfileImage | null) => {
        // Fallback to a default image if `profilePic` is empty
        if (typeof profilePic === 'string' && !profilePic.trim()) {
          profilePic = null;
        }
        set({profilePic});
      },
  setUserDetails: (details) =>
    set((state) => ({
      ...state,
      email: details.email ?? state.email,
      username: details.username ?? state.username,
      displayName: details.displayName ?? state.displayName,
      bio: details.bio ?? state.bio,
      creationDate: details.creationDate ?? details.CreationDate ?? state.creationDate,
      followersCount: details.FollowersCount ?? details.FollowersCount ?? state.FollowersCount,
      followingCount: details.followingCount ?? details.FollowingCount ?? state.followingCount,
      profilePic: details.profilePic || state.profilePic,
      headerPic: details.headerPic || state.headerPic,
      darkMode: details.darkMode ?? state.darkMode,
      isAdmin: details.isAdmin ?? state.isAdmin,
      userId: details.userId ?? state.userId,
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
      profilePic: null,
      darkMode: false,
      headerPic: null,
      isAdmin: undefined,
      userId: undefined,
    }),
  })),
  {
    name: 'user-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
)
);

export const isEmptyUserState = (state: UserState): boolean => {
  return (
    !state.email &&
    !state.username &&
    !state.displayName &&
    !state.bio &&
    !state.creationDate &&
    state.followersCount === 0 &&
    state.followingCount === 0 &&
    !state.profilePic &&
    !state.headerPic &&
    !state.userId
  );
}