import { Badge, BadgeType } from './Badges.types';

export const defaultBadges: Badge[] = [
  {
    id: 'insightfulUser',
    type: 'insightfulUser',
    title: 'Insightful User',
    description: 'Awarded for providing valuable insights',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
    currentCounts: 0,
  },
  {
    id: 'memeCollector',
    type: 'memeCollector',
    title: 'Meme Collector',
    description: 'Collected a significant number of memes',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
    currentCounts: 0,
  },
  {
    id: 'trendSetter',
    type: 'trendSetter',
    title: 'Trend Setter',
    description: 'Set trends in the meme community',
    earned: true,
    progress: 100,
    acquiredDate: new Date().toISOString(),
      currentCounts: 0,
  },
];

export const getAllBadges = (): Badge[] => {
  const allBadgeTypes: BadgeType[] = [
    'memeLiker', 'socialButterfly', 'memeMaster', 'trendSetter',
    'messenger', 'commentator', 'memeCreator', 'viralSensation',
    'memeCollector', 'viralStar', 'insightfulUser', 'memeExplorer',
    'communityChampion'
  ];

  return allBadgeTypes.map(type => {
    const defaultBadge = defaultBadges.find(b => b.type === type);
    if (defaultBadge) {
      return defaultBadge;
    }
    return {
      id: type,
      type: type,
      title: type.replace(/([A-Z])/g, ' $1').trim(),
      description: `Earn the ${type.replace(/([A-Z])/g, ' $1').trim()} badge`,
      earned: false,
      progress: 0,
      currentCounts: 0,

    };
  });
};