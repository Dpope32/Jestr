// badgeStore.ts

import { create } from 'zustand';

export type BadgeType = 
  | 'memeLiker' 
  | 'socialButterfly' 
  | 'memeMaster' 
  | 'trendSetter';

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
  setBadges: (badges: Badge[]) => void;
  earnBadge: (badge: Badge) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
}

export const useBadgeStore = create<BadgeStore>((set) => ({
  badges: [],
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
      badges: state.badges.map((b) =>
        b.id === badgeId ? { ...b, progress } : b
      ),
    })),
}));
