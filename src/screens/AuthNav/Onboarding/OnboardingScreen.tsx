import React, {useState, useRef, useEffect} from 'react';
import {View, Text, ViewToken} from 'react-native';
import {TouchableOpacity, Animated, useWindowDimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

import {styles, slides, Slide} from './componentData';
import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import Backdrop from './Backdrop';
import Particles from '../../../components/Particles/Particles';
import Pagination from './Pagination';
import {useUserStore} from '../../../stores/userStore';

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavProp>();
  const setIsFirstLaunch = useUserStore(state => state.setIsFirstLaunch);

  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

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
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const index = viewableItems[0]?.index;
      if (index != null && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
  ).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slideRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // has completed the onboarding slides
      // TODO: make isFirstLaunch to FALSE
      setIsFirstLaunch(false);
      navigation.navigate('LandingPage');
    }
  };

  const renderItem = ({item, index}: {item: Slide; index: number}) => {
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
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <Backdrop scrollX={scrollX} windowWidth={windowWidth} />
      <Particles windowWidth={windowWidth} windowHeight={windowHeight} />
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
        <Pagination
          slides={slides}
          scrollX={scrollX}
          windowWidth={windowWidth}
          slideRef={slideRef}
        />

        <TouchableOpacity style={styles.button} onPress={scrollToNext}>
          <LinearGradient
            colors={slides[currentIndex].colors}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.buttonText}>{btnTxt}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default OnboardingScreen;
