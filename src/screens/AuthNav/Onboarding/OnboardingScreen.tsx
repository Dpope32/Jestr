import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  ViewToken,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import { styles as baseStyles } from './styles';
import { slides, Slide } from './componentData';
import { AuthNavProp } from '../../../navigation/NavTypes/AuthStackTypes';
import Backdrop from './Backdrop';
import Particles from '../../../components/Particles/Particles';
import Pagination from './Pagination';
import { useUserStore } from '../../../stores/userStore';

const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavProp>();
  const setIsFirstLaunch = useUserStore((state) => state.setIsFirstLaunch);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const slideRef = useRef<Animated.FlatList | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const btnTxt = currentIndex === slides.length - 1 ? "LET'S MEME" : 'Next';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

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

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const isCurrentSlide = index === currentIndex;

    return (
      <View style={[styles.slide, { width: windowWidth }]}>
        <View style={styles.contentContainer}>
          {isCurrentSlide && (
            <LottieView
              source={item.animation}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.description, { color: item.textColor }]}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const buttonColor = slides[currentIndex].colors[0];

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
        density={0.02} // Reduced density
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={1} // Limit rendering
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
          <Text style={styles.buttonText}>{btnTxt}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ...baseStyles,
  // Adjusted styles
  container: {
    ...baseStyles.container,
    justifyContent: 'space-between',
    backgroundColor: '#000', // Dark background for contrast
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20, // Added padding
  },
  lottieAnimation: {
    width: '80%',
    height: '40%',
    marginBottom: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    color: '#333',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // White button for contrast
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
