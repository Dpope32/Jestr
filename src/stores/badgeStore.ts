// badgeStore.ts

import { create } from 'zustand';

export type BadgeType = 
  | 'memeExplorer' 
  | 'socialButterfly' 
  | 'memeCommenter' 
  | 'memeMaster' 
  | 'trendSetter' 
  | 'viralSensation' 
  | 'memeConnoisseur' 
  | 'engagementGuru' 
  | 'iconicCreator' 
  | 'contentChampion' 
  | 'legendaryMemer';

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
  earnBadge: (badgeId: string) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
}

export const useBadgeStore = create<BadgeStore>((set) => ({
  badges: [
    {
      id: '1',
      type: 'memeExplorer',
      title: 'Meme Explorer',
      description: 'Liked 10 memes',
      earned: true,
      progress: 100,
      acquiredDate: '2023-08-15',
      holdersCount: 150,
    },
    {
      id: '2',
      type: 'socialButterfly',
      title: 'Social Butterfly',
      description: 'Followed 10 users',
      earned: true,
      progress: 100,
      acquiredDate: '2023-08-16',
      holdersCount: 10,
    },
    {
      id: '3',
      type: 'memeCommenter',
      title: 'Meme Commenter',
      description: 'Commented on 5 memes',
      earned: true,
      progress: 100,
      acquiredDate: '2023-08-15',
      holdersCount: 15000,
    },
    {
      id: '4',
      type: 'memeMaster',
      title: 'Meme Master',
      description: 'Created 5 original memes',
      earned: false,
      progress: 20,
    },
    {
      id: '5',
      type: 'trendSetter',
      title: 'Trend Setter',
      description: 'Had a meme reach 100 likes',
      earned: false,
      progress: 50,
    },
    {
      id: '6',
      type: 'viralSensation',
      title: 'Viral Sensation',
      description: 'Had a meme shared 50 times',
      earned: false,
      progress: 30,
    },
    {
      id: '7',
      type: 'memeConnoisseur',
      title: 'Meme Connoisseur',
      description: 'Liked 100 memes',
      earned: false,
      progress: 60,
    },
    {
      id: '8',
      type: 'engagementGuru',
      title: 'Engagement Guru',
      description: 'Received 50 total comments',
      earned: false,
      progress: 10,
    },
    {
      id: '15',
      type: 'legendaryMemer',
      title: 'Legendary Memer',
      description: 'Reach 1000 likes',
      earned: false,
      progress: 10,
    },
    {
      id: '18',
      type: 'iconicCreator',
      title: 'Iconic Creator',
      description: 'Upload 25 Memes',
      earned: false,
      progress: 20,
    },
    {
      id: '19',
      type: 'contentChampion',
      title: 'Content Champion',
      description: 'Upload 100 memes',
      earned: false,
      progress: 75,
    },
  ],
  earnBadge: (badgeId) =>
    set((state) => ({
      badges: state.badges.map((badge) =>
        badge.id === badgeId
          ? {
              ...badge,
              earned: true,
              progress: 100,
              acquiredDate: new Date().toISOString(),
              holdersCount: (badge.holdersCount ?? 0) + 1,
            }
          : badge
      ),
    })),
  updateBadgeProgress: (badgeId, progress) =>
    set((state) => ({
      badges: state.badges.map((badge) =>
        badge.id === badgeId ? { ...badge, progress } : badge
      ),
    })),
}));
