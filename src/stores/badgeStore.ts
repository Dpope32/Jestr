// badgeStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import zustandMMKVStorage from '../utils/zustandMMKVStorage';
import { BadgeType, Badge as BadgeTypeInterface } from '../screens/AppNav/Badges/Badges.types';
import { fetchUserBadges, checkBadgeEligibility, awardBadge, BadgeWithCounts } from '../services/badgeServices';
import Toast from 'react-native-toast-message';
import { badgeDetailsMap, BadgeDetails } from '../screens/AppNav/Badges/Badges.types';
import { getAllBadges, defaultBadges } from '../screens/AppNav/Badges/defaultBadges';
import { debounce } from 'lodash';
import logger from '../utils/logger';

// Custom error type
class BadgeStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadgeStoreError';
  }
}

export interface Badge {
  id: string;
  type: BadgeType;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  acquiredDate?: string;
  holdersCount?: number;
  currentCounts: number;
}

type CountType = 'likeCount' | 'downloadCount' | 'shareCount' | 'commentCount' | 'followerCount' | 'conversationCount' | 'memeUploadCount' | 'memeCreationCount';

interface BadgeStore {
  badges: Badge[];
  pinnedBadgeId: string | null;
  likeCount: number;
  downloadCount: number;
  shareCount: number;
  commentCount: number;
  followerCount: number;
  conversationCount: number;
  memeUploadCount: number;
  memeCreationCount: number;
  isBadgesLoaded: boolean;
  setBadges: (badges: BadgeWithCounts[]) => void;
  earnBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  setPinnedBadge: (badgeId: string) => void;
  syncBadgesWithAPI: (userEmail: string) => Promise<void>;
  checkAndUpdateBadge: (userEmail: string, badgeType: BadgeType) => Promise<void>;
  incrementCount: (countType: CountType, userEmail?: string) => void;
  decrementCount: (countType: CountType) => void;
  checkBadge: (badgeType: BadgeType, userEmail: string) => Promise<void>;
  calculateAndUpdateProgress: () => void;
}

const initialState = getAllBadges();

const createBadgeStore = () => {
  return create<BadgeStore>()(
    persist(
      (set, get) => ({
        badges: initialState,
        pinnedBadgeId: null,
        likeCount: 0,
        downloadCount: 0,
        shareCount: 0,
        commentCount: 0,
        followerCount: 0,
        conversationCount: 0,
        memeUploadCount: 0,
        memeCreationCount: 0,
        isBadgesLoaded: false,

        setBadges: (fetchedBadges: BadgeWithCounts[]) => {
        //  logger.info('[BadgeStore] Setting badges from server:', fetchedBadges);
          
          const allBadges = getAllBadges();
         // logger.info('[BadgeStore] Default badges:', allBadges);
        
          const mergedBadges = allBadges.map((defaultBadge) => {
            const fetchedBadge = fetchedBadges.find(b => b.type === defaultBadge.type);
            if (fetchedBadge) {
           //   logger.info(`[BadgeStore] Merging badge: ${defaultBadge.type}`, fetchedBadge);
              return { 
                ...defaultBadge, 
                ...fetchedBadge, 
                earned: defaultBadge.earned || fetchedBadge.earned,
                progress: fetchedBadge.progress !== undefined ? fetchedBadge.progress : defaultBadge.progress,
                currentCounts: fetchedBadge.currentCounts !== undefined ? fetchedBadge.currentCounts : defaultBadge.currentCounts,
                acquiredDate: fetchedBadge.acquiredDate || defaultBadge.acquiredDate,
              };
            }
          //  logger.info(`[BadgeStore] Using default badge: ${defaultBadge.type}`);
            return defaultBadge;
          });
        
          set({ 
            badges: mergedBadges, 
            isBadgesLoaded: true,
            likeCount: mergedBadges.find(b => b.type === 'memeLiker')?.currentCounts || get().likeCount,
            downloadCount: mergedBadges.find(b => b.type === 'memeCollector')?.currentCounts || get().downloadCount,
            shareCount: mergedBadges.find(b => b.type === 'viralSensation')?.currentCounts || get().shareCount,
            commentCount: mergedBadges.find(b => b.type === 'commentator')?.currentCounts || get().commentCount,
            followerCount: mergedBadges.find(b => b.type === 'socialButterfly')?.currentCounts || get().followerCount,
            conversationCount: mergedBadges.find(b => b.type === 'messenger')?.currentCounts || get().conversationCount,
            memeUploadCount: mergedBadges.find(b => b.type === 'memeMaster')?.currentCounts || get().memeUploadCount,
            memeCreationCount: mergedBadges.find(b => b.type === 'memeCreator')?.currentCounts || get().memeCreationCount,
          });
          get().calculateAndUpdateProgress();
        },

        earnBadge: (badge: Badge) => {
         // logger.info('[BadgeStore] Earning badge:', badge);
          set((state) => {
            const existingBadge = state.badges.find((b) => b.id === badge.id);
            if (existingBadge) {
          //    logger.info(`[BadgeStore] Badge with id ${badge.id} already exists. Updating...`);
              return {
                badges: state.badges.map((b) =>
                  b.id === badge.id ? { ...badge, earned: true, progress: 100 } : b
                ),
              };
            } else {
              logger.info(`[BadgeStore] Badge with id ${badge.id} does not exist. Adding...`);
              return {
                badges: [...state.badges, { ...badge, earned: true, progress: 100 }],
              };
            }
          });
        },

        updateBadgeProgress: (badgeId: string, progress: number) => {
        //  logger.info(`[BadgeStore] Updating badge progress. badgeId: ${badgeId}, progress: ${progress}`);
          set((state) => ({
            badges: state.badges.map((b) =>
              b.id === badgeId ? { ...b, progress: Math.min(progress, 100) } : b
            ),
          }));
        },

        setPinnedBadge: (badgeId: string) => {
      //    logger.info(`[BadgeStore] Setting pinnedBadgeId to: ${badgeId}`);
          set({ pinnedBadgeId: badgeId });
        },

        calculateAndUpdateProgress: debounce(() => {
          const { badges } = get();
        
          const updatedBadges = badges.map((badge) => {
            const details: BadgeDetails | undefined = badgeDetailsMap[badge.type];
            if (!details || !details.goal) {
              // Skip badges without details or goals; optionally log if needed
              return badge;
            }
        
            const progress = Math.min((badge.currentCounts / details.goal) * 100, 100);
            
            // Log the progress calculation for each badge
            logger.info(`[BadgeStore] Calculated progress for badge type "${badge.type}": ${progress}%`);
        
            return { ...badge, progress };
          });
          
          set({ badges: updatedBadges });
        }, 300),        

        syncBadgesWithAPI: async (userEmail: string) => {
         // logger.info(`[BadgeStore] syncBadgesWithAPI called for userEmail: ${userEmail}`);
          try {
            const apiBadges = await fetchUserBadges(userEmail);
          //  logger.info('[BadgeStore] Fetched badges from API:', apiBadges);
            get().setBadges(apiBadges);
          } catch (error) {
            logger.error('[BadgeStore] Error syncing badges with API:', error);
            set({ isBadgesLoaded: true, badges: [] });
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to sync badges.',
              position: 'top',
              visibilityTime: 3000,
            });
            throw new BadgeStoreError(`Failed to sync badges: ${(error as Error).message}`);
          }
        },

        checkAndUpdateBadge: async (userEmail: string, badgeType: BadgeType) => {
      //    logger.info(`[BadgeStore] checkAndUpdateBadge called for userEmail: ${userEmail}, badgeType: ${badgeType}`);
          try {
            const existingBadge = get().badges.find((b) => b.type === badgeType);
            if (existingBadge?.earned) {
              logger.info(`[BadgeStore] Badge of type ${badgeType} already earned. No action needed.`);
              return;
            }

            const badgeDetails = badgeDetailsMap[badgeType];
            if (!badgeDetails || !badgeDetails.goal) {
              logger.info(`[BadgeStore] No goal defined for badge type ${badgeType}. Skipping server check.`);
              return;
            }

            const badgeTypeToCountMap: Record<BadgeType, number> = {
              memeLiker: get().likeCount,
              memeCollector: get().downloadCount,
              viralSensation: get().shareCount,
              socialButterfly: get().followerCount,
              commentator: get().commentCount,
              messenger: get().conversationCount,
              memeMaster: get().memeUploadCount,
              memeCreator: get().memeCreationCount,
              trendSetter: 0,
              viralStar: 0,
              insightfulUser: 0,
              memeExplorer: 0,
              communityChampion: 0,
            };

            const currentCount = badgeTypeToCountMap[badgeType] || 0;
            logger.info(`[BadgeStore] Current count for ${badgeType}: ${currentCount}, Goal: ${badgeDetails.goal}`);

            if (currentCount < badgeDetails.goal) {
              logger.info(`[BadgeStore] Current count (${currentCount}) is less than goal (${badgeDetails.goal}). Skipping server check.`);
              return;
            }

            // Only contact the server if the badge hasn't been earned and the count meets or exceeds the goal
            // This ensures we're not making unnecessary server requests for every action
            logger.info(`[BadgeStore] Current count meets/exceeds goal. Proceeding to check eligibility on server.`);

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
                    onDismiss: () => Toast.hide(),
                  },
                });
              }
            } else {
              logger.info(`[BadgeStore] User is not eligible for badge type ${badgeType} despite meeting local count.`);
            }
          } catch (error) {
            logger.error(`[BadgeStore] Error checking and updating ${badgeType} badge:`, error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: `Failed to update ${badgeType} badge.`,
              position: 'top',
              visibilityTime: 3000,
            });
            throw new BadgeStoreError(`Failed to check and update ${badgeType} badge: ${(error as Error).message}`);
          }
        },

        incrementCount: (countType: CountType, userEmail?: string) => {
          logger.info(`[BadgeStore] Incrementing ${countType}`);
          set((state) => ({ [countType]: state[countType] + 1 }));
          if (userEmail) {
            get().checkBadge(countType as BadgeType, userEmail);
          }
          get().calculateAndUpdateProgress();
        },

        decrementCount: (countType: CountType) => {
          logger.info(`[BadgeStore] Decrementing ${countType}`);
          set((state) => ({ [countType]: Math.max(0, state[countType] - 1) }));
          get().calculateAndUpdateProgress();
        },

        checkBadge: async (badgeType: BadgeType, userEmail: string) => {
          logger.info(`[BadgeStore] Checking ${badgeType} badge`);
          await get().checkAndUpdateBadge(userEmail, badgeType);
        },
      }),
      {
        name: 'badge-storage',
        storage: createJSONStorage(() => zustandMMKVStorage),
        partialize: (state) => ({
          badges: state.badges,
          likeCount: state.likeCount,
          downloadCount: state.downloadCount,
          shareCount: state.shareCount,
          commentCount: state.commentCount,
          followerCount: state.followerCount,
          conversationCount: state.conversationCount,
          memeUploadCount: state.memeUploadCount,
          memeCreationCount: state.memeCreationCount,
          isBadgesLoaded: state.isBadgesLoaded,
          pinnedBadgeId: state.pinnedBadgeId,
        }),
      }
    )
  );
};

export const useBadgeStore = createBadgeStore();


export const getBadgeStorageContents = async () => {
  try {
    const badgeStorage = await zustandMMKVStorage.getItem('badge-storage');
    const parsedStorage = badgeStorage ? JSON.parse(badgeStorage) : null;
    if (parsedStorage && parsedStorage.state && parsedStorage.state.badges) {
      logger.info('Badge Storage contents:', {
        ...parsedStorage.state,
        badges: parsedStorage.state.badges.map((badge: Badge) => ({
          id: badge.id,
          type: badge.type,
          title: badge.title,
          earned: badge.earned,
          progress: badge.progress,
          currentCounts: badge.currentCounts
        }))
      });
    } else {
      logger.info('Badge Storage contents:', parsedStorage);
    }
  } catch (error) {
    logger.error('Error parsing badge storage:', error);
  }
};