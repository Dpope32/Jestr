// Badges.types.ts

export type BadgeType = 
  | 'memeLiker' 
  | 'socialButterfly' 
  | 'memeMaster' 
  | 'trendSetter' 
  | 'commentator'
  | 'memeCreator'
  | 'viralStar'
  | 'insightfulUser'
  | 'memeExplorer'
  | 'communityChampion';

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

export const badgeImages: { [key in BadgeType]: any } = {
  memeLiker: memeLikerImg,
  socialButterfly: socialButterflyImg,
  memeMaster: memeMasterImg,
  trendSetter: trendSetterImg,
  commentator: commentatorImg,   
  memeCreator: memeCreatorImg,  
  viralStar: viralStarImg,       
  insightfulUser: insightfulUserImg, 
  memeExplorer: memeExplorerImg, 
  communityChampion: communityChampionImg, 
};

// Import badge images
import memeLikerImg from '../../../assets/images/s.png';
import socialButterflyImg from '../../../assets/images/socialButterfly.png';
import memeMasterImg from '../../../assets/images/2.png';
import trendSetterImg from '../../../assets/images/1.png';
import commentatorImg from '../../../assets/images/3.png';
import memeCreatorImg from '../../../assets/images/4.png';
import viralStarImg from '../../../assets/images/5.png';
import insightfulUserImg from '../../../assets/images/6.png';
import memeExplorerImg from '../../../assets/images/7.png';
import communityChampionImg from '../../../assets/images/8.png';
