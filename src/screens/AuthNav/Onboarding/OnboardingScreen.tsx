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
import { styles } from './styles';

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
  const descriptionOpacities = useRef(slides.map(() => new Animated.Value(0))).current;

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
      duration: 1000,
      delay: currentIndex === 0 && !hasVisitedFirstSlide ? 3000 : 100,
      useNativeDriver: true,
    }).start();

    if (currentIndex === 0) {
      setHasVisitedFirstSlide(true);
    }
  }, [currentIndex]);

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

  const renderStyledText = (text: string, textColor: string, buttonColor: string, highlightWords: string[] = []) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const isHighlighted = highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase()));
      return (
        <Text
          key={index}
          style={[
            styles.description,
            { color: textColor },
            isHighlighted && {
              color: Color(buttonColor).isDark() ? '#FFFFFF' : '#000000',
              fontWeight: 'bold',
              textShadowColor: buttonColor,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1,
              borderRadius: 4,
              paddingHorizontal: 4,
              marginHorizontal: 1,
            }
          ]}
        >
          {word}{' '}
        </Text>
      );
    });
  };

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const buttonColor = Color(item.colors[0]).darken(0.2).hex();

    return (
      <View style={[styles.slide, { width: windowWidth }]}>
        <View style={styles.contentContainer}>
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Animated.View
            style={[
              styles.textContainer,
              { opacity: descriptionOpacities[index] },
            ]}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {renderStyledText(item.description, item.textColor, buttonColor, item.highlightWords)}
            </View>
          </Animated.View>
        </View>
      </View>
    );
  };

  const buttonColor = Color(slides[currentIndex].colors[0]).lighten(0.2).hex();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
        removeClippedSubviews={false} // Changed from true to false
        maxToRenderPerBatch={2} // Increased from 1 to 2
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pagination
          slides={slides}
          scrollX={scrollX}
          windowWidth={windowWidth}
          slideRef={slideRef}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={scrollToNext}
        >
          <Text style={[styles.buttonText, { color: slides[currentIndex].textColor }]}>{btnTxt}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
