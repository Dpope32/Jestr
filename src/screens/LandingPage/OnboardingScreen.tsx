import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

interface Particle {
  left: number;
  top: number;
  size: number;
  animated: Animated.Value;
}

const slides = [
  {
    id: '1',
    title: 'Welcome to Jestr',
    description: 'Dive into a world of endless laughter and meme magic. Jestr is your go-to app for daily doses of humor, cleverly crafted to brighten your day and tickle your funny bone.',
    colors: ['#1C1C1C', '#00FF00'],
    animation: require('../../assets/animations/welcome1.json'),
    particleColor: '#FFD93D'
  },
  {
    id: '2',
    title: 'Discover Memes',
    description: 'Just swipe! Our AI-powered algorithm learns your taste in humor over time, serving you the freshest and funniest memes tailored just for you (with little moderation of course).',
    colors: ['#6B5B95', '#FF7B54'],
    animation: require('../../assets/animations/search.json'),
    particleColor: '#88D8B0',
    textColor: '#520775'
  },
  {
    id: '3',
    title: 'Create & Share',
    description: 'Unleash your inner comedian with our easy-to-use meme creator. Upload videos, add captions, and share your wit with the world. Your next viral meme is just a tap away!',
    colors: ['#6a7069', '#07fa02'],
    animation: require('../../assets/animations/create.json'),
    particleColor: '#FF6B6B'
  },
  {
    id: '4',
    title: 'Interact with your Friends!',
    description: 'Connect with fellow jesters, follow your favorite meme creators, send private encrypted messages, and become part of a global community of dank meme enthusiasts. Once you are part of the ship, you are a part of the crew.',
    colors: ['#2f4f40', '#9CFFFA'],
    animation: require('../../assets/animations/join.json'),
    particleColor: '#A0E7E5',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  console.log('Onboarding screen component rendered');
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideRef = useRef<Animated.FlatList | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [particles, setParticles] = useState<Particle[]>([]);
  
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
  
      const newParticles: Particle[] = Array(20).fill(0).map(() => ({
        left: Math.random() * windowWidth,
        top: Math.random() * windowHeight,
        size: Math.random() * 9 + 2,
        animated: new Animated.Value(0),
      }));
  
      setParticles(newParticles);
  
      newParticles.forEach(particle => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.animated, {
              toValue: 1,
              duration: 2000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.animated, {
              toValue: 0,
              duration: 2000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, [windowWidth, windowHeight]);
  
    const viewableItemsChanged = useCallback(({ viewableItems }: any) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index);
      }
    }, []);
  
    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  
    const scrollTo = useCallback(() => {
      if (currentIndex < slides.length - 1) {
        slideRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      } else {
        onComplete();
      }
    }, [currentIndex, onComplete]);
  
    const renderItem = useCallback(({ item, index }: { item: typeof slides[0]; index: number }) => {
      const inputRange = [(index - 1) * windowWidth, index * windowWidth, (index + 1) * windowWidth];
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.8, 1, 0.8],
        extrapolate: 'clamp',
      });
  
      return (
        <Animated.View style={[styles.slide, { width: windowWidth, transform: [{ scale }] }]}>
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      );
    }, [windowWidth, scrollX]);
  
    const Backdrop = useCallback(() => {
      const backgroundColor = scrollX.interpolate({
        inputRange: slides.map((_, i) => i * windowWidth),
        outputRange: slides.map((slide) => slide.colors[0]),
        extrapolate: 'clamp',
      });
  
      return (
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor }]} />
      );
    }, [scrollX, windowWidth]);
  
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Backdrop />
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                opacity: particle.animated,
                transform: [
                  {
                    translateY: particle.animated.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
        <Animated.FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slideRef}
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.paginationContainer}>
            {slides.map((_, index) => {
              const inputRange = [(index - 1) * windowWidth, index * windowWidth, (index + 1) * windowWidth];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1.4, 0.8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });
              return (
                <TouchableOpacity
                  key={index.toString()}
                  onPress={() => slideRef.current?.scrollToIndex({ index, animated: true })}
                >
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.button} onPress={scrollTo}>
            <LinearGradient
              colors={slides[currentIndex].colors}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {currentIndex === slides.length - 1 ? "LETS MEME" : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000', // Ensure a consistent background color
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30, // Slightly reduce padding for better fit on smaller screens
    },
    lottieAnimation: {
      width: 200,
      height: 250,
      marginTop: -100, // Adjusted for a better layout
    },
    title: {
      fontSize: 30, // Slightly larger for emphasis
      fontWeight: 'bold',
      marginVertical: 10,
      color: '#FFF',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.85)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 8,
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      color: '#EAEAEA', // Use a lighter color for better readability
      lineHeight: 36,
      marginHorizontal: 10,
      textShadowColor: 'rgba(0, 0, 0, 0.85)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 8,
    },
    particle: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adjust particle color for better visibility
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
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
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
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 5,
    },
  });
  
  export default OnboardingScreen;
  