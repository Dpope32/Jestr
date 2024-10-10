export type BadgeType = 
  | 'memeLiker' 
  | 'socialButterfly' 
  | 'memeMaster' 
  | 'trendSetter' 
  | 'messenger'
  | 'commentator'
  | 'memeCreator'
  | 'viralSensation'
  | 'memeCollector'
  | 'viralStar'
  | 'insightfulUser'
  | 'memeExplorer'
  | 'communityChampion'

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
  memeLiker: require('../../../assets/images/9.png'),
  socialButterfly: require('../../../assets/images/socialButterfly.png'),
  memeMaster: require('../../../assets/images/2.png'),
  trendSetter: require('../../../assets/images/1.png'),
  commentator: require('../../../assets/images/3.png'),
  memeCreator: require('../../../assets/images/4.png'),
  viralSensation: require('../../../assets/images/5.png'),
  memeCollector: require('../../../assets/images/6.png'),
  messenger: require('../../../assets/images/7.png'),
  viralStar: require('../../../assets/images/8.png'),
  insightfulUser: require('../../../assets/images/10.png'),
  memeExplorer: require('../../../assets/images/11.png'),
  communityChampion: require('../../../assets/images/memeLiker.png'),
};

// src/constants/badgeDetailsMap.ts
export interface BadgeDetails {
  name: string;
  description: string;
  goal?: number; // Make 'goal' optional
}

export const badgeDetailsMap: { [key: string]: BadgeDetails } = {
  memeLiker: {
    name: "Meme Liker",
    description: "Liked 5 memes.",
    goal: 5,
  },
  socialButterfly: {
    name: "Social Butterfly",
    description: "Have 10 relationships (followers or following).",
    goal: 10,
  },
  memeMaster: {
    name: "Meme Master",
    description: "Uploaded 5 memes.",
    goal: 5,
  },
  trendSetter: {
    name: "Trend Setter",
    description: "Accumulated 100 likes on memes.",
    goal: 100,
  },
  messenger: {
    name: "Messenger",
    description: "Participated in 10 conversations.",
    goal: 10,
  },
  commentator: {
    name: "Commentator",
    description: "Commented on 10 memes.",
    goal: 10,
  },
  memeCreator: {
    name: "Meme Creator",
    description: "Created 10 memes.",
    goal: 10,
  },
  viralSensation: {
    name: "Viral Sensation",
    description: "Had memes shared 100 times in total.",
    goal: 100,
  },
  memeCollector: {
    name: "Meme Collector",
    description: "Downloaded 50 memes.",
    goal: 50,
  },
  viralStar: {
    name: "Viral Star",
    description: "Achieved viral status with 1000 shares.",
    goal: 1000,
  },
  insightfulUser: {
    name: "Insightful User",
    description: "Awarded for providing valuable insights.",
    // Assuming this is a default earned badge, set goal to 0 or omit it
    // Here, we'll omit 'goal' since it's earned automatically
  },
  memeExplorer: {
    name: "Meme Explorer",
    description: "Explored 20 different meme categories.",
    goal: 20,
  },
  communityChampion: {
    name: "Community Champion",
    description: "Contributed 100 helpful comments.",
    goal: 100,
  },
};