import {StyleSheet, Animated} from 'react-native';

export interface Particle {
  left: number;
  top: number;
  size: number;
  animated: Animated.Value;
}

export interface Slide {
  id: string;
  title: string;
  description: string;
  colors: string[];
  animation: any;
  particleColor: string;
  textColor?: string;
}

export const slides = [
  {
    id: '1',
    title: 'Welcome to Jestr',
    description:
      'Dive into a world of endless laughter and meme magic. Jestr is your go-to app for daily doses of humor, cleverly crafted to brighten your day and tickle your funny bone.',
    colors: ['#1C1C1C', '#00FF00'],
    animation: require('../../../assets/animations/welcome1.json'),
    particleColor: '#FFD93D',
  },
  {
    id: '2',
    title: 'Discover Memes',
    description:
      'Just swipe! Our AI-powered algorithm learns your taste in humor over time, serving you the freshest and funniest memes tailored just for you (with little moderation of course).',
    colors: ['#6B5B95', '#FF7B54'],
    animation: require('../../../assets/animations/search.json'),
    particleColor: '#88D8B0',
    textColor: '#520775',
  },
  {
    id: '3',
    title: 'Create & Share',
    description:
      'Unleash your inner comedian with our easy-to-use meme creator. Upload videos, add captions, and share your wit with the world. Your next viral meme is just a tap away!',
    colors: ['#6a7069', '#07fa02'],
    animation: require('../../../assets/animations/create.json'),
    particleColor: '#FF6B6B',
  },
  {
    id: '4',
    title: 'Interact with your Friends!',
    description:
      'Connect with fellow jesters, follow your favorite meme creators, send private encrypted messages, and become part of a global community of dank meme enthusiasts. Once you are part of the ship, you are a part of the crew.',
    colors: ['#2f4f40', '#9CFFFA'],
    animation: require('../../../assets/animations/join.json'),
    particleColor: '#A0E7E5',
  },
];

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  lottieAnimation: {
    width: 200,
    height: 250,
    marginTop: -100,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 8,
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EAEAEA',
    lineHeight: 36,
    marginHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 8,
    backgroundColor: 'transparent',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginHorizontal: 5,
  },
  button: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
    backgroundColor: 'transparent',
  },
});
