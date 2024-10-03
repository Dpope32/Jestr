// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scaleFactor = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / 375;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingTop: 40,
  },
  animationContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  lottieAnimation: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.35, 
    marginTop: 20 * scaleFactor,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 22 * scaleFactor,
    width: '90%',
    alignItems: 'flex-start',
    // Removed marginTop
  },
  
  
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 0,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: Math.max(16, Math.min(28 * scaleFactor, 32)), 
    textAlign: 'center',
    lineHeight: Math.max(24, Math.min(36 * scaleFactor, 40)), 
    marginHorizontal: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 3,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    opacity: 0.6,
  },
  activeDot: {
    opacity: 0.9,
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6 * scaleFactor,
    paddingTop: 10 * scaleFactor, // Added paddingTop to create space
  },
  
});
