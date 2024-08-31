import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

import {styles, slides, Particle} from './componentData';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onComplete}) => {
  const insets = useSafeAreaInsets();

  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  const slideRef = useRef<Animated.FlatList | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  console.log('Onboarding screen component rendered');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const newParticles: Particle[] = Array(20)
      .fill(0)
      .map(() => ({
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
        ]),
      ).start();
    });
  }, [windowWidth, windowHeight]);

  const viewableItemsChanged = useCallback(({viewableItems}: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const scrollTo = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      slideRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  }, [currentIndex, onComplete]);

  const renderItem = useCallback(
    ({item, index}: {item: (typeof slides)[0]; index: number}) => {
      const inputRange = [
        (index - 1) * windowWidth,
        index * windowWidth,
        (index + 1) * windowWidth,
      ];
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.8, 1, 0.8],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          style={[styles.slide, {width: windowWidth, transform: [{scale}]}]}>
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
    },
    [windowWidth, scrollX],
  );

  const Backdrop = useCallback(() => {
    const backgroundColor = scrollX.interpolate({
      inputRange: slides.map((_, i) => i * windowWidth),
      outputRange: slides.map(slide => slide.colors[0]),
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, {backgroundColor}]}
      />
    );
  }, [scrollX, windowWidth]);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
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
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slideRef}
      />
      <View style={[styles.footer, {paddingBottom: insets.bottom + 20}]}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * windowWidth,
              index * windowWidth,
              (index + 1) * windowWidth,
            ];
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
                onPress={() =>
                  slideRef.current?.scrollToIndex({index, animated: true})
                }>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      transform: [{scale}],
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
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? "LET'S MEME" : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
