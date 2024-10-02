import { Animated } from 'react-native';

export interface Particle {
    left: number;
    top: number;
    size: number;
    animated: Animated.Value;
    directionX: number;
    directionY: number;
  }
  
  export interface Slide {
    id: string;
    description: string;
    colors: string[];
    animation: any;
    particleColor: string;
    textColor?: string;
  }
  
  // componentData.ts
  export const slides: Slide[] = [
    {
      id: '1',
      description:
        'Dive into a world of endless laughter and meme magic. Jestr is your go-to app for daily doses of humor, cleverly crafted to brighten your day and tickle your funny bone.',
      colors: ['#1C1C1C', '#02db2e'],
      animation: require('../../../assets/animations/welcome1.json'),
      particleColor: '#7986CB',
      textColor: '#FFFFFF',
    },
    {
      id: '2',
      description:
        'Just swipe! Our AI-powered algorithm learns your taste in humor over time, serving you the freshest and funniest memes tailored just for you (with little moderation of course).',
      colors: ['#006064', '#00ACC1'],
      animation: require('../../../assets/animations/search.json'),
      particleColor: '#4DD0E1',
      textColor: '#E0F7FA',
    },
    {
      id: '3',
      description:
        'Unleash your inner comedian with our easy-to-use meme creator. Upload videos, add captions, and share your wit with the world. Your next viral meme is just a tap away!',
      colors: ['#044727', '#F4511E'],
      animation: require('../../../assets/animations/create.json'),
      particleColor: '#FF8A65',
      textColor: '#FBE9E7',
    },
    {
      id: '4',
      description:
        'Connect with your day ones! Once you are part of the ship, you are a part of the crew',
      colors: ['#000d07', '#FFFFFF'],
      animation: require('../../../assets/animations/join.json'),
      particleColor: '#81C784',
      textColor: '#E8F5E9',
    },
  ];