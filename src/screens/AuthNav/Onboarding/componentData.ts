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
    textColor: string;
    highlightWords?: string[];
  }
  
  
  // componentData.ts
  export const slides: Slide[] = [
    {
      id: '1',
      description: 'Dive into a world of endless laughter and meme magic. Jestr is your go-to app for daily doses of humor.',
      colors: ['#132e1c', '#02db2e'],
      animation: require('../../../assets/animations/welcome1.json'),
      particleColor: '#02db2e',
      textColor: '#FFFFFF',
      highlightWords: ['Jestr', 'humor'],
    },
    {
      id: '2',
      description:
        'Our AI-powered algorithm learns your taste in humor over time, serving you the funniest memes tailored JUST for you!',
      colors: ['#5b1280', '#00ACC1'],
      animation: require('../../../assets/animations/search.json'),
      particleColor: '#4DD0E1',
      textColor: '#E0F7FA',
      highlightWords: ['funniest', 'JUST'],
    },
    {
      id: '3',
      description:
        'Edit videos, add captions, and share your wit with the world. Your next viral meme is just a tap away!',
      colors: ['#000000', '#F4511E'],
      animation: require('../../../assets/animations/create.json'),
      particleColor: '#aab0b3',
      textColor: '#FBE9E7',
      highlightWords: ['videos', 'captions', 'share'],
    },
    {
      id: '4',
      description: 'Connect with your day ones! Once you are part of the ship, you are a part of the crew',
      colors: ['#1C1C1C', '#FFFFFF'],
      animation: require('../../../assets/animations/join.json'),
      particleColor: '#81C784',
      textColor: '#E8F5E9',
      highlightWords: ['ship', 'crew'],
    },
  ];
