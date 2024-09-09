import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, ActivityIndicator, Text } from 'react-native';
import { NavigationProp, useNavigation, CommonActions } from '@react-navigation/native';
import LP from './LP';
import {RootStackParamList, LetterScale } from '../../types/types';
import { getToken, getUserIdentifier, removeToken, removeUserIdentifier } from '../../stores/secureStore';
import { getCurrentUser } from '@aws-amplify/auth';
import { fetchUserDetails } from '../../services/userService';
import { storeUserIdentifier } from '../../stores/secureStore';

type LandingPageNavigationProp = NavigationProp<RootStackParamList>;

const LandingPage: React.FC = () => {
  const navigation = useNavigation<LandingPageNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const [animationComplete, setAnimationComplete] = useState(false);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const [titlePosition, setTitlePosition] = useState({ top: new Animated.Value(10), left: new Animated.Value(0) });
  const titleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const letterAnimations = useRef<Animated.Value[]>([]);
  const [letterScale, setLetterScale] = useState<LetterScale>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [titleMarginTop, setTitleMarginTop] = useState(-300);

  useEffect(() => {
    startAnimation();

    const unsubscribe = navigation.addListener('focus', () => {
      setShowInitialScreen(true);
      setTitleMarginTop(-300);
      setAnimationComplete(false);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken('accessToken');
      let identifier = await getUserIdentifier();

      if (token) {
        try {
          if (!identifier) {
            const user = await getCurrentUser();
            identifier = user.signInDetails?.loginId || user.username;
            if (identifier) {
              await storeUserIdentifier(identifier);
            } else {
              throw new Error('Unable to retrieve user email');
            }
          }

          const userDetails = await fetchUserDetails(identifier, token);
          if (userDetails) {
            navigation.dispatch(CommonActions.reset({
              index: 0,
              routes: [{ name: 'Feed' }],
            }));
          } else {
            navigation.dispatch(CommonActions.reset({
              index: 0,
              routes: [{ name: 'CompleteProfileScreen', params: { email: identifier } }],
            }));
          }
        } catch (error) {
          console.error('Error checking auth in LandingPage:', error);
          await removeToken('accessToken');
          await removeUserIdentifier();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [navigation]);

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [showInitialScreen, showSignUpForm]);

  const navigateToConfirmSignUp = (email: string) => {
    navigation.navigate('ConfirmSignUp', { email });
  };

  const startAnimation = () => {
    setAnimationComplete(false);
    letterAnimations.current = ['J', 'e', 's', 't', 'r'].map(() => new Animated.Value(0));

    const letterAnimationConfigs = letterAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 200, 
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
        outputRange: [0.5, 1] 
      }),
      opacity: animation,
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0]
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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text>Loading...</Text>
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
          setIsLoading={setIsLoading}
        />
      )}
    </View>
  );
};

export default React.memo(LandingPage);