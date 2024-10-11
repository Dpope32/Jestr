// src/stores/badgeStore.tsx

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';
import { BadgeType, Badge as BadgeTypeInterface } from '../screens/AppNav/Badges/Badges.types';
import { fetchUserBadges, checkBadgeEligibility, awardBadge } from '../services/badgeServices';
import Toast from 'react-native-toast-message';
import { badgeDetailsMap, BadgeDetails } from '../screens/AppNav/Badges/Badges.types'; // Import the badgeDetailsMap

export interface Badge {
  id: string;
  type: BadgeType;
  title: string;
  description: string;
  earned: boolean;
  progress: number; // Progress as a percentage (0 to 100)
  acquiredDate?: string;
  holdersCount?: number;
}

interface BadgeStore {
  badges: Badge[];
  pinnedBadgeId: string | null;
  likeCount: number;
  isBadgesLoaded: boolean;
  downloadCount: number;
  shareCount: number;
  commentCount: number;
  setBadges: (badges: Badge[]) => void;
  earnBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  setPinnedBadge: (badgeId: string) => void;
  syncBadgesWithAPI: (userEmail: string) => Promise<void>;
  checkAndUpdateBadge: (userEmail: string, badgeType: BadgeType) => Promise<void>;
  incrementLikeCount: (userEmail: string) => void;
  decrementLikeCount: () => void;
  incrementDownloadCount: (userEmail: string) => void;
  decrementDownloadCount: () => void;
  incrementShareCount: (userEmail: string) => void;
  decrementShareCount: () => void;
  incrementCommentCount: (userEmail: string) => void;
  decrementCommentCount: () => void;
  checkMemeLikerBadge: (userEmail: string) => Promise<void>;
  checkMemeCollectorBadge: (userEmail: string) => Promise<void>;
  checkViralSensationBadge: (userEmail: string) => Promise<void>;
  checkSocialButterflyBadge: (userEmail: string) => Promise<void>;
  checkCommentatorBadge: (userEmail: string) => Promise<void>;
  checkMessengerBadge: (userEmail: string) => Promise<void>;
  calculateAndUpdateProgress: () => void; // New function to calculate progress
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
      isBadgesLoaded: false,
      commentCount: 0,

      setBadges: (fetchedBadges: Badge[]) => {
        console.log('[BadgeStore] Setting badges ***********FROM SERVER **************:');
        set((state) => {
          const mergedBadges = [...defaultBadges];
          fetchedBadges.forEach((fetchedBadge) => {
            const index = mergedBadges.findIndex((b) => b.type === fetchedBadge.type);
            if (index !== -1) {
              mergedBadges[index] = { ...mergedBadges[index], ...fetchedBadge };
            } else {
              mergedBadges.push(fetchedBadge);
            }
          });
          // After setting badges, calculate and update progress
          setTimeout(() => {
            get().calculateAndUpdateProgress();
          }, 0);
          return { badges: mergedBadges, isBadgesLoaded: true };
        });
      },

      earnBadge: (badge: Badge) => {
        console.log('[BadgeStore] Earning badge:', badge);
        set((state) => {
          const existingBadge = state.badges.find((b) => b.id === badge.id);
          if (existingBadge) {
            console.log(`[BadgeStore] Badge with id ${badge.id} already exists. Updating...`);
            return {
              badges: state.badges.map((b) =>
                b.id === badge.id ? { ...badge, earned: true, progress: 100 } : b
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
        console.log(`[BadgeStore] Updating badge progress. badgeId: ${badgeId}, progress: ${progress} ********** NOT SERVER **********`);
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badgeId ? { ...b, progress: Math.min(progress, 100) } : b
          ),
        }));
      },

      setPinnedBadge: (badgeId: string) => {
        console.log(`[BadgeStore] Setting pinnedBadgeId to: ${badgeId} ********** NOT SERVER **********`);
        set({ pinnedBadgeId: badgeId });
      },

      // New function to calculate and update progress for all badges
      calculateAndUpdateProgress: () => {
        console.log('[BadgeStore] Calculating and updating badge progress ********** NOT SERVER **********');
        const { badges, likeCount, downloadCount, shareCount, commentCount } = get();
        const updatedBadges = badges.map((badge) => {
          if (badge.earned) {
            return { ...badge, progress: 100 };
          }

          const details: BadgeDetails | undefined = badgeDetailsMap[badge.type];
          if (!details) {
            console.warn(`[BadgeStore] No details found for badge type: ${badge.type}`);
            return { ...badge, progress: 0 };
          }

          const { goal } = details;
          let count = 0;

          // Map badge types to their corresponding counts
          switch (badge.type) {
            case 'memeLiker':
              count = likeCount;
              break;
            case 'memeCollector':
              count = downloadCount;
              break;
            case 'viralSensation':
              count = shareCount;
              break;
            case 'commentator':
              count = commentCount;
              break;
            // Add cases for other badge types as needed
            default:
              count = 0;
          }

          const progress = goal && goal > 0 ? Math.min((count / goal) * 100, 100) : 0;

          return { ...badge, progress };
        });

        set({ badges: updatedBadges });
      },

      syncBadgesWithAPI: async (userEmail: string) => {
        console.log(`[BadgeStore] syncBadgesWithAPI called for userEmail: ${userEmail} ********** TOUCHES SERVER **********`);
        try {
          const apiBadges = await fetchUserBadges(userEmail);
          console.log('[BadgeStore] Fetched badges from API:', apiBadges);
          get().setBadges(apiBadges);
        } catch (error) {
          console.error('[BadgeStore] Error syncing badges with API:', error);
          // Even if there's an error, we set isBadgesLoaded to true to prevent infinite loading
          set({ isBadgesLoaded: true });
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
        console.log(`[BadgeStore] checkAndUpdateBadge called for userEmail: ${userEmail}, badgeType: ${badgeType} ********** NOT SERVER **********`);
        try {
          const existingBadge = get().badges.find((b) => b.type === badgeType);
          if (existingBadge?.earned) {
            console.log(`[BadgeStore] Badge of type ${badgeType} already earned. ********** NOT SERVER **********`);
            return;
          }

          console.log(`[BadgeStore] Badge ${badgeType} not earned yet. Checking eligibility. ********** TOUCHES SERVER **********`);
          const eligibleBadgeType = await checkBadgeEligibility(userEmail, badgeType);
          if (eligibleBadgeType) {
            const awardedBadge = await awardBadge(userEmail, eligibleBadgeType);
            if (awardedBadge) {
              get().earnBadge(awardedBadge);
              Toast.show({
                type: 'custom',
                position: 'top',
                autoHide: true,
                visibilityTime: 4000,
                props: {
                  badge: awardedBadge,
                  onDismiss: () => Toast.hide(), // Add onDismiss callback
                },
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

      incrementLikeCount: (userEmail: string) => {
        console.log('[BadgeStore] Incrementing likeCount ********** NOT SERVER **********');
        set((state) => ({ likeCount: state.likeCount + 1 }));
        get().checkMemeLikerBadge(userEmail);
        // Update progress after increment
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      decrementLikeCount: () => {
        console.log('[BadgeStore] Decrementing likeCount ********** NOT SERVER **********');
        set((state) => ({ likeCount: Math.max(0, state.likeCount - 1) }));
        // Update progress after decrement
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      incrementDownloadCount: (userEmail: string) => {
        console.log('[BadgeStore] Incrementing downloadCount ********** NOT SERVER **********');
        set((state) => ({ downloadCount: state.downloadCount + 1 }));
        get().checkMemeCollectorBadge(userEmail);
        // Update progress after increment
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      decrementDownloadCount: () => {
        console.log('[BadgeStore] Decrementing downloadCount ********** NOT SERVER **********');
        set((state) => ({ downloadCount: Math.max(0, state.downloadCount - 1) }));
        // Update progress after decrement
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      incrementShareCount: (userEmail: string) => {
        console.log('[BadgeStore] Incrementing shareCount ********** NOT SERVER **********');
        set((state) => ({ shareCount: state.shareCount + 1 }));
        get().checkViralSensationBadge(userEmail);
        // Update progress after increment
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      decrementShareCount: () => {
        console.log('[BadgeStore] Decrementing shareCount ********** NOT SERVER **********');
        set((state) => ({ shareCount: Math.max(0, state.shareCount - 1) }));
        // Update progress after decrement
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      incrementCommentCount: (userEmail: string) => {
        console.log('[BadgeStore] Incrementing commentCount ********** NOT SERVER **********');
        set((state) => ({ commentCount: state.commentCount + 1 }));
        get().checkCommentatorBadge(userEmail);
        // Update progress after increment
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      decrementCommentCount: () => {
        console.log('[BadgeStore] Decrementing commentCount ********** NOT SERVER **********');
        set((state) => ({ commentCount: Math.max(0, state.commentCount - 1) }));
        // Update progress after decrement
        setTimeout(() => {
          get().calculateAndUpdateProgress();
        }, 0);
      },

      checkMemeLikerBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking MemeLiker badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'memeLiker');
      },

      checkMemeCollectorBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking MemeCollector badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'memeCollector');
      },

      checkViralSensationBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking ViralSensation badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'viralSensation');
      },

      checkSocialButterflyBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking SocialButterfly badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'socialButterfly');
      },

      checkCommentatorBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking Commentator badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'commentator');
      },

      checkMessengerBadge: async (userEmail: string) => {
        console.log('[BadgeStore] Checking Messenger badge ********** NOT SERVER **********');
        await get().checkAndUpdateBadge(userEmail, 'messenger');
      },
    }),
    {
      name: 'badge-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        badges: state.badges,
        likeCount: state.likeCount,
        downloadCount: state.downloadCount,
        isBadgesLoaded: state.isBadgesLoaded,
        shareCount: state.shareCount,
        commentCount: state.commentCount,
        pinnedBadgeId: state.pinnedBadgeId,
      }),
    }
  )
);

// Debugging: Log badge storage contents
export const getBadgeStorageContents = async () => {
  try {
    const badgeStorage = await zustandMMKVStorage.getItem('badge-storage');
    console.log('Badge Storage contents:', badgeStorage ? JSON.parse(badgeStorage) : null);
  } catch (error) {
    console.error('Error parsing badge storage:', error);
  }
};
