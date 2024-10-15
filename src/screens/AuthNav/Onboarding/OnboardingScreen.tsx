// OnboardingScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ViewToken,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Color from 'color';

import { styles as baseStyles } from './styles';
import { slides, Slide } from './componentData';
import { AuthNavProp } from '../../../navigation/NavTypes/AuthStackTypes';
import Backdrop from './Backdrop';
import Particles from '../../../components/Particles/Particles';
import Pagination from './Pagination';
import { useUserStore } from '../../../stores/userStore';
import AnimatedWord from './AnimatedWord'; // Ensure correct path

const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavProp>();
  const setIsFirstLaunch = useUserStore((state) => state.setIsFirstLaunch);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const slideRef = useRef<Animated.FlatList | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [hasVisitedFirstSlide, setHasVisitedFirstSlide] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const descriptionOpacities = useRef(
    slides.map(() => new Animated.Value(0))
  ).current;

  const btnTxt = currentIndex === slides.length - 1 ? "LET'S MEME" : 'Next';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Reset opacity for all slides
    descriptionOpacities.forEach((opacity, index) => {
      opacity.setValue(index === currentIndex ? 0 : 0);
    });

    // Animate the description for the current slide
    Animated.timing(descriptionOpacities[currentIndex], {
      toValue: 1,
      duration: 2000, // Slowed down animation
      delay: currentIndex === 0 && !hasVisitedFirstSlide ? 3000 : 100,
      useNativeDriver: true,
    }).start();

    if (currentIndex === 0) {
      setHasVisitedFirstSlide(true);
    }
  }, [currentIndex, descriptionOpacities, hasVisitedFirstSlide]);

  // Define renderStyledText inside OnboardingScreen
  const renderStyledText = (
    text: string,
    textColor: string,
    buttonColor: string,
    highlightWords: string[] = [],
    index: number
  ) => {
    const words = text.split(' ');

    return words.map((word, i) => {
      const isHighlighted = highlightWords.some(hw =>
        word.toLowerCase().includes(hw.toLowerCase())
      );
      return (
        <AnimatedWord
          key={i}
          word={word}
          isHighlighted={isHighlighted}
          textColor={textColor}
          buttonColor={buttonColor}
          delay={i * 100}
          isActive={currentIndex === index} // Pass isActive prop
        />
      );
    });
  };

  // Define renderItem inside OnboardingScreen
  const renderItem = useCallback(
    ({ item, index }: { item: Slide; index: number }) => {
      const buttonColor = Color(item.colors[0]).darken(0.2).hex();

      return (
        <View style={[baseStyles.slide, { width: windowWidth }]}>
          <View style={baseStyles.contentContainer}>
            <LottieView
              source={item.animation}
              autoPlay
              loop
              style={baseStyles.lottieAnimation}
            />
            <Animated.View
              style={[
                baseStyles.textContainer,
                { opacity: descriptionOpacities[index] },
              ]}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {renderStyledText(
                  item.description,
                  item.textColor,
                  buttonColor,
                  item.highlightWords,
                  index
                )}
              </View>
            </Animated.View>
          </View>
        </View>
      );
    },
    [windowWidth, descriptionOpacities, renderStyledText]
  );

  const viewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      console.log('Viewable Items:', viewableItems);
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index != null && index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    },
    [currentIndex]
  );

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 30 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slideRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      setIsFirstLaunch(false);
      navigation.navigate('LandingPage');
    }
  };

  const buttonColor = Color(slides[currentIndex].colors[0]).lighten(0.2).hex();

  return (
    <Animated.View style={[baseStyles.container, { opacity: fadeAnim }]}>
      <Backdrop
        scrollX={scrollX}
        windowWidth={windowWidth}
        windowHeight={windowHeight}
        pointerEvents="none"
      />
      <Particles
        windowWidth={windowWidth}
        windowHeight={windowHeight}
        density={0.02}
        color={slides[currentIndex].particleColor}
      />
      <Animated.FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slideRef}
        getItemLayout={(data, index) => ({
          length: windowWidth,
          offset: windowWidth * index,
          index,
        })}
        removeClippedSubviews={false} // Adjusted for better performance
        maxToRenderPerBatch={2} // Optimized rendering
      />
      <View style={[baseStyles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pagination
          slides={slides}
          scrollX={scrollX}
          windowWidth={windowWidth}
          slideRef={slideRef}
        />

        <TouchableOpacity
          style={[baseStyles.button, { backgroundColor: buttonColor }]}
          onPress={scrollToNext}
        >
          <Text
            style={[
              baseStyles.buttonText,
              { color: slides[currentIndex].textColor },
            ]}
          >
            {btnTxt}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
