import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/types';
import {
  getFollowers,
  getFollowing,
  addFollow,
  removeFollow,
} from '../services/socialService';
import { getUser } from '../services/userService';
import { Animated } from 'react-native';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';
import logger from '../utils/logger';
import { useUserStore } from './userStore';
import Toast from 'react-native-toast-message';

export interface FollowUser extends User {
  isFollowing: boolean;
  userId: string;
  animatedValue: Animated.Value;
}

interface FollowState {
  followers: FollowUser[];
  following: FollowUser[];
  hasLoadedFollowers: boolean;
  hasLoadedFollowing: boolean;
  loadFollowers: (userId: string) => Promise<void>;
  loadFollowing: (userId: string) => Promise<void>;
  addFollower: (user: User) => void;
  removeFollower: (userId: string) => void;
  addFollowing: (currentUserId: string, userToFollow: User) => Promise<void>;
  removeFollowing: (
    currentUserId: string,
    userIdToUnfollow: string,
  ) => Promise<void>;
  reset: () => void;
}

const transformUser = (user: User, isFollowing: boolean): FollowUser => ({
  ...user,
  isFollowing,
  userId: user.email,
  animatedValue: new Animated.Value(isFollowing ? 1 : 0),
});

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      followers: [],
      following: [],
      hasLoadedFollowers: false,
      hasLoadedFollowing: false,

      loadFollowers: async (userId: string) => {
        if (!get().hasLoadedFollowers || get().followers.length === 0) {
          try {
            const followerIds = await getFollowers(userId);
            const followersData = await Promise.all(
              followerIds.map(async (id) => {
                const existingFollower = get().followers.find(
                  (f) => f.email === id,
                );
                if (existingFollower) return existingFollower;
                const userData = await getUser(id);
                return userData
                  ? transformUser(
                      userData,
                      get().following.some((f) => f.email === id),
                    )
                  : null;
              }),
            );
            set({
              followers: followersData.filter((f): f is FollowUser => f !== null),
              hasLoadedFollowers: true,
            });
            console.log('Loaded followers');
          } catch (error) {
            logger.error('Error loading followers:', error);
          }
        }
      },

      loadFollowing: async (userId: string) => {
        if (!get().hasLoadedFollowing || get().following.length === 0) {
          try {
            const followingIds = await getFollowing(userId);
            const followingData = await Promise.all(
              followingIds.map(async (id) => {
                const existingFollowing = get().following.find(
                  (f) => f.email === id,
                );
                if (existingFollowing) return existingFollowing;
                const userData = await getUser(id);
                return userData ? transformUser(userData, true) : null;
              }),
            );
            set({
              following: followingData.filter((f): f is FollowUser => f !== null),
              hasLoadedFollowing: true,
            });
            console.log('Loaded following');
          } catch (error) {
            logger.error('Error loading following:', error);
          }
        }
      },

      addFollower: (user: User) =>
        set((state) => ({
          followers: [...state.followers, transformUser(user, false)],
        })),

      removeFollower: (userId: string) =>
        set((state) => ({
          followers: state.followers.filter(
            (follower) => follower.email !== userId,
          ),
        })),

        addFollowing: async (currentUserId: string, userToFollow: User) => {
          try {
            const result = await addFollow(currentUserId, userToFollow.email);
            if (result.success) {
              set((state) => ({
                following: [...state.following, transformUser(userToFollow, true)],
                followers: state.followers.map((follower) =>
                  follower.email === userToFollow.email
                    ? { ...follower, isFollowing: true }
                    : follower,
                ),
              }));
              // Optionally update counts if available
              if (
                result.followersCount !== undefined &&
                result.followingCount !== undefined
              ) {
                useUserStore.getState().setFollowersCount(result.followersCount);
                useUserStore.getState().setFollowingCount(result.followingCount);
              }
            } else {
              console.error('Failed to add follow:', result.message);
              Toast.show({
                type: 'error',
                text1: 'Follow Failed',
                text2: result.message || 'Unable to follow user.',
                position: 'top',
                visibilityTime: 3000,
              });
            }
          } catch (error) {
            logger.error('Error adding following:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'An unexpected error occurred while trying to follow.',
              position: 'top',
              visibilityTime: 3000,
            });
          }
        },
        

      removeFollowing: async (
        currentUserId: string,
        userIdToUnfollow: string,
      ) => {
        try {
          await removeFollow(currentUserId, userIdToUnfollow);
          set((state) => ({
            following: state.following.filter(
              (user) => user.email !== userIdToUnfollow,
            ),
            followers: state.followers.map((follower) =>
              follower.email === userIdToUnfollow
                ? { ...follower, isFollowing: false }
                : follower,
            ),
          }));
          console.log(`User ${currentUserId} has unfollowed ${userIdToUnfollow}`);
        } catch (error) {
          logger.error('Error removing following:', error);
        }
      },

      reset: () =>
        set({
          followers: [],
          following: [],
          hasLoadedFollowers: false,
          hasLoadedFollowing: false,
        }),
    }),
    {
      name: 'follow-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
