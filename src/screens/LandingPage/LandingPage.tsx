import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LP from './LP';
import { User, RootStackParamList, LetterScale } from '../../types/types';

type LandingPageNavigationProp = NavigationProp<RootStackParamList>;

const LandingPage: React.FC = () => {
 // console.log('App mounted mwaha');
  const navigation = useNavigation<LandingPageNavigationProp>();
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const [animationComplete, setAnimationComplete] = useState(false);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const [titlePosition, setTitlePosition] = useState({
    top: new Animated.Value(10),
    left: new Animated.Value(0)
  });
  const titleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const letterAnimations = useRef<Animated.Value[]>([]);
  const [letterScale, setLetterScale] = useState<LetterScale>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [titleMarginTop, setTitleMarginTop] = useState(-300);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('LandingPage mounted');
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        setIsAuthenticated(true);
        navigation.navigate('Feed', { user: JSON.parse(user) });
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
  };

  const navigateToConfirmSignUp = (email: string) => {
    navigation.navigate('ConfirmSignUp', { email });
  };

  useEffect(() => {
    checkAuthStatus();
    startAnimation();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShowInitialScreen(true);
      setTitleMarginTop(-300);
      setAnimationComplete(false);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [showInitialScreen, showSignUpForm]);

  const startAnimation = () => {
    setAnimationComplete(false);
    letterAnimations.current = ['J', 'e', 's', 't', 'r'].map(() => new Animated.Value(0));

    const letterAnimationConfigs = letterAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 200, // Stagger the animations
        useNativeDriver: true
      })
    );

    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      ...letterAnimationConfigs
    ]).start(() => {
      setAnimationComplete(true);
      handleTitleAnimationComplete();
    });

    const scale: LetterScale = letterAnimations.current.map(animation => ({
      scale: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1] // Start from half size
      }),
      opacity: animation,
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0] // Start 50 pixels below and move up
      })
    }));
    setLetterScale(scale);
  };

  const handleTitleAnimationComplete = () => {
    setTitleMarginTop(0);
    setAnimationComplete(true);
    titleAnimationRef.current = Animated.timing(titleTranslateY, {
      toValue: -50,
      duration: 500,
      useNativeDriver: true
    });
    if (titleAnimationRef.current) {
      titleAnimationRef.current.start(() => {
        setTitlePosition({ top: new Animated.Value(30), left: new Animated.Value(0) });
      });
     // console.log('Animation Complete');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      ) : (
        <LP
          animationComplete={animationComplete}
          letterScale={letterScale}
          titleMarginTop={titleMarginTop}
          titleOpacity={titleOpacity}
          titleTranslateY={titleTranslateY}
          showInitialScreen={showInitialScreen}
          isAuthenticated={isAuthenticated}
          setShowInitialScreen={setShowInitialScreen}
          setShowSignUpForm={setShowSignUpForm}
          navigateToConfirmSignUp={navigateToConfirmSignUp}
          setIsLoading={setIsLoading} // Pass the setIsLoading function to LP
        />
      )}
    </View>
  );
};

export default React.memo(LandingPage);
