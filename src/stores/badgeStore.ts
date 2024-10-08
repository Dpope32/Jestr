// src/stores/badgeStore.tsx

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BadgeType, Badge as BadgeTypeInterface } from '../screens/AppNav/Badges/Badges.types';
import { fetchUserBadges, checkBadgeEligibility, awardBadge } from '../services/badgeServices';
import Toast from 'react-native-toast-message';

export interface Badge {
  id: string;
  type: BadgeType;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  acquiredDate?: string;
  holdersCount?: number;
}

interface BadgeStore {
  badges: Badge[];
  pinnedBadgeId: string | null;
  likeCount: number;
  downloadCount: number;
  shareCount: number;
  commentCount: number;
  setBadges: (badges: Badge[]) => void;
  earnBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  setPinnedBadge: (badgeId: string) => void;
  syncBadgesWithAPI: (userEmail: string) => Promise<void>;
  checkAndUpdateBadge: (userEmail: string, badgeType: BadgeType) => Promise<void>;
  incrementLikeCount: () => void;
  decrementLikeCount: () => void;
  incrementDownloadCount: () => void;
  decrementDownloadCount: () => void;
  incrementShareCount: () => void;
  decrementShareCount: () => void;
  incrementCommentCount: () => void;
  decrementCommentCount: () => void;
  checkMemeLikerBadge: (userEmail: string) => Promise<void>;
  checkMemeCollectorBadge: (userEmail: string) => Promise<void>;
  checkViralSensationBadge: (userEmail: string) => Promise<void>;
  checkSocialButterflyBadge: (userEmail: string) => Promise<void>;
  checkCommentatorBadge: (userEmail: string) => Promise<void>;
  checkMessengerBadge: (userEmail: string) => Promise<void>; // Added method
  
}

const defaultBadges: Badge[] = [
  {
    id: 'insightfulUser',
    type: 'insightfulUser',
    title: 'Insightful User',
    description: 'Awarded for providing valuable insights',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
  },
  {
    id: 'memeCollector',
    type: 'memeCollector',
    title: 'Meme Collector',
    description: 'Collected a significant number of memes',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
  },
  {
    id: 'trendSetter',
    type: 'trendSetter',
    title: 'Trend Setter',
    description: 'Set trends in the meme community',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
  },
];


export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      badges: defaultBadges,
      pinnedBadgeId: null,
      likeCount: 0,
      downloadCount: 0,
      shareCount: 0,
      commentCount: 0,

      setBadges: (fetchedBadges: Badge[]) => {
        console.log('[BadgeStore] Setting badges:', fetchedBadges);
        const mergedBadges = [...defaultBadges, ...fetchedBadges.filter(badge => !defaultBadges.some(defaultBadge => defaultBadge.id === badge.id))];
        set({ badges: mergedBadges });
      },

      earnBadge: (badge: Badge) => {
        console.log('[BadgeStore] Earning badge:', badge);
        set((state) => {
          const existingBadge = state.badges.find((b) => b.id === badge.id);
          if (existingBadge) {
            console.log(`[BadgeStore] Badge with id ${badge.id} already exists. Updating...`);
            return {
              badges: state.badges.map((b) =>
                b.id === badge.id
                  ? { ...badge, earned: true, progress: 100 }
                  : b
              ),
            };
          } else {
            console.log(`[BadgeStore] Badge with id ${badge.id} does not exist. Adding...`);
            return {
              badges: [...state.badges, { ...badge, earned: true, progress: 100 }],
            };
          }
        });
      },

      updateBadgeProgress: (badgeId: string, progress: number) => {
        console.log(`[BadgeStore] Updating badge progress. badgeId: ${badgeId}, progress: ${progress}`);
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badgeId ? { ...b, progress: Math.min(progress, 100) } : b
          ),
        }));
      },

      setPinnedBadge: (badgeId: string) => {
        console.log(`[BadgeStore] Setting pinnedBadgeId to: ${badgeId}`);
        set({ pinnedBadgeId: badgeId });
      },

      syncBadgesWithAPI: async (userEmail: string) => {
        console.log(`[BadgeStore] syncBadgesWithAPI called for userEmail: ${userEmail}`);
        try {
          const apiBadges = await fetchUserBadges(userEmail);
          console.log('[BadgeStore] Fetched badges from API:', apiBadges);
          const mergedBadges = [...defaultBadges, ...apiBadges.filter(badge => !defaultBadges.some(defaultBadge => defaultBadge.id === badge.id))];
          get().setBadges(mergedBadges);
        } catch (error) {
          console.error('[BadgeStore] Error syncing badges with API:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to sync badges.',
            position: 'top',
            visibilityTime: 3000,
          });
        }
      },

      checkAndUpdateBadge: async (userEmail: string, badgeType: BadgeType) => {
        console.log(`[BadgeStore] checkAndUpdateBadge called for userEmail: ${userEmail}, badgeType: ${badgeType}`);
        try {
          // Check if the badge is one of the default earned badges
          if (['insightfulUser', 'memeCollector', 'trendSetter'].includes(badgeType)) {
            console.log(`[BadgeStore] Badge ${badgeType} is a default earned badge. No need to check.`);
            return;
          }

          // Check if the badge exists in local state
          const existingBadge = get().badges.find(b => b.type === badgeType);
          console.log(`[BadgeStore] Existing badge for type ${badgeType}:`, existingBadge);

          // If badge is already earned, no need to check eligibility
          if (existingBadge?.earned) {
            console.log(`[BadgeStore] Badge of type ${badgeType} already earned.`);
            return;
          }

          // Proceed to check eligibility via API
          const eligibleBadgeType = await checkBadgeEligibility(userEmail, badgeType);
          console.log(`[BadgeStore] Eligible badgeType returned from API: ${eligibleBadgeType}`);
          if (eligibleBadgeType) {
            const awardedBadge = await awardBadge(userEmail, eligibleBadgeType);
            console.log(`[BadgeStore] Awarded badge:`, awardedBadge);
            if (awardedBadge) {
              get().earnBadge(awardedBadge);
              Toast.show({
                type: 'custom',
                position: 'top',
                autoHide: true,
                text1: 'Congratulations!',
                text2: `You earned the ${awardedBadge.title} badge!`,
                visibilityTime: 4000,
              });
            }
          }
        } catch (error) {
          console.error(`[BadgeStore] Error checking and updating ${badgeType} badge:`, error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: `Failed to update ${badgeType} badge.`,
            position: 'top',
            visibilityTime: 3000,
          });
        }
      },

      incrementLikeCount: () => {
        console.log('[BadgeStore] Incrementing likeCount');
        set((state) => ({ likeCount: state.likeCount + 1 }));
        // Optionally, trigger badge checks here
        const userEmail = 'jestrdev@gmail.com'; // Replace with actual user email
        get().checkMemeLikerBadge(userEmail);
      },

      decrementLikeCount: () => {
        console.log('[BadgeStore] Decrementing likeCount');
        set((state) => ({ likeCount: Math.max(0, state.likeCount - 1) }));
      },

      incrementDownloadCount: () => {
        console.log('[BadgeStore] Incrementing downloadCount');
        set((state) => ({ downloadCount: state.downloadCount + 1 }));
        // Optionally, trigger badge checks here
        const userEmail = 'jestrdev@gmail.com'; // Replace with actual user email
        get().checkMemeCollectorBadge(userEmail);
      },

      decrementDownloadCount: () => {
        console.log('[BadgeStore] Decrementing downloadCount');
        set((state) => ({ downloadCount: Math.max(0, state.downloadCount - 1) }));
      },

      incrementShareCount: () => {
        console.log('[BadgeStore] Incrementing shareCount');
        set((state) => ({ shareCount: state.shareCount + 1 }));
        // Optionally, trigger badge checks here
        const userEmail = 'jestrdev@gmail.com'; // Replace with actual user email
        get().checkViralSensationBadge(userEmail);
      },

      decrementShareCount: () => {
        console.log('[BadgeStore] Decrementing shareCount');
        set((state) => ({ shareCount: Math.max(0, state.shareCount - 1) }));
      },

      incrementCommentCount: () => {
        console.log('[BadgeStore] Incrementing commentCount');
        set((state) => ({ commentCount: state.commentCount + 1 }));
        // Trigger badge check for commentator badge
        const userEmail = 'jestrdev@gmail.com'; // Replace with actual user email
        get().checkCommentatorBadge(userEmail);
      },

      decrementCommentCount: () => {
        console.log('[BadgeStore] Decrementing commentCount');
        set((state) => ({ commentCount: Math.max(0, state.commentCount - 1) }));
      },

      checkMemeLikerBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking MemeLiker badge');
        await get().checkAndUpdateBadge(userEmail, 'memeLiker');
      },

      checkMemeCollectorBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking MemeCollector badge');
        await get().checkAndUpdateBadge(userEmail, 'memeCollector');
      },

      checkViralSensationBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking ViralSensation badge');
        await get().checkAndUpdateBadge(userEmail, 'viralSensation');
      },

      checkSocialButterflyBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking SocialButterfly badge');
        await get().checkAndUpdateBadge(userEmail, 'socialButterfly');
      },

      checkCommentatorBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking Commentator badge');
        await get().checkAndUpdateBadge(userEmail, 'commentator');
      },

      checkMessengerBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking Messenger badge');
        await get().checkAndUpdateBadge(userEmail, 'messenger');
      },
    }),
    {
      name: 'badge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        badges: state.badges,
        likeCount: state.likeCount,
        downloadCount: state.downloadCount,
        shareCount: state.shareCount,
        commentCount: state.commentCount,
        pinnedBadgeId: state.pinnedBadgeId,
      }),
    }
  )
);

// Debugging: Log badge storage contents
const getBadgeStorageContents = async () => {
  try {
    const badgeStorage = await AsyncStorage.getItem('badge-storage');
    console.log('Badge Storage contents:', badgeStorage ? JSON.parse(badgeStorage) : null);
  } catch (error) {
    console.error('Error parsing badge storage:', error);
  }
};

// Call the function to see the badge storage contents
getBadgeStorageContents();
