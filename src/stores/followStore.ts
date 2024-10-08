import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types/types';
import {
  getFollowers,
  getFollowing,
  addFollow,
  removeFollow,
} from '../services/socialService';
import {getUser} from '../services/userService';
import {Animated} from 'react-native';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';

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

export const useFollowStore = create(
  persist<FollowState>(
    (set, get) => ({
      followers: [],
      following: [],
      hasLoadedFollowers: false,
      hasLoadedFollowing: false,

      loadFollowers: async (userId: string) => {
        if (!get().hasLoadedFollowers || get().followers.length === 0) {
          const followerIds = await getFollowers(userId);
          const followersData = await Promise.all(
            followerIds.map(async id => {
              const existingFollower = get().followers.find(
                f => f.email === id,
              );
              if (existingFollower) return existingFollower;
              const userData = await getUser(id);
              return userData
                ? transformUser(
                    userData,
                    get().following.some(f => f.email === id),
                  )
                : null;
            }),
          );
          set({
            followers: followersData.filter((f): f is FollowUser => f !== null),
            hasLoadedFollowers: true,
          });
        }
      },

      loadFollowing: async (userId: string) => {
        if (!get().hasLoadedFollowing || get().following.length === 0) {
          const followingIds = await getFollowing(userId);
          const followingData = await Promise.all(
            followingIds.map(async id => {
              const existingFollowing = get().following.find(
                f => f.email === id,
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
        }
      },

      addFollower: (user: User) =>
        set(state => ({
          followers: [...state.followers, transformUser(user, false)],
        })),

      removeFollower: (userId: string) =>
        set(state => ({
          followers: state.followers.filter(
            follower => follower.email !== userId,
          ),
        })),

      addFollowing: async (currentUserId: string, userToFollow: User) => {
        try {
          await addFollow(currentUserId, userToFollow.email);
          set(state => ({
            following: [...state.following, transformUser(userToFollow, true)],
            followers: state.followers.map(follower =>
              follower.email === userToFollow.email
                ? {...follower, isFollowing: true}
                : follower,
            ),
          }));
        } catch (error) {
          console.error('Error adding following:', error);
        }
      },

      removeFollowing: async (
        currentUserId: string,
        userIdToUnfollow: string,
      ) => {
        try {
          await removeFollow(currentUserId, userIdToUnfollow);
          set(state => ({
            following: state.following.filter(
              user => user.email !== userIdToUnfollow,
            ),
            followers: state.followers.map(follower =>
              follower.email === userIdToUnfollow
                ? {...follower, isFollowing: false}
                : follower,
            ),
          }));
        } catch (error) {
          console.error('Error removing following:', error);
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
