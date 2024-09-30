// Badges.types.ts

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
