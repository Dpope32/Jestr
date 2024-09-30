import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BadgeType = 'memeLiker' | 'socialButterfly' | 'memeMaster' | 'trendSetter';

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
  setBadges: (badges: Badge[]) => void;
  earnBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  setPinnedBadge: (badgeId: string) => void;
}

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set) => ({
      badges: [],
      pinnedBadgeId: null,
      setBadges: (badges: Badge[]) => set({ badges }),
      earnBadge: (badge: Badge) =>
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badge.id
              ? {
                  ...b,
                  earned: true,
                  progress: 100,
                  acquiredDate: new Date().toISOString(),
                  holdersCount: (b.holdersCount ?? 0) + 1,
                }
              : b
          ),
        })),
      updateBadgeProgress: (badgeId: string, progress: number) =>
        set((state) => ({
          badges: state.badges.map((b) => (b.id === badgeId ? { ...b, progress } : b)),
        })),
      setPinnedBadge: (badgeId: string) => set({ pinnedBadgeId: badgeId }),
    }),
    {
      name: 'badge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ pinnedBadgeId: state.pinnedBadgeId }),
    }
  )
);