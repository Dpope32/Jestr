// Badges.tsx

import React, { useRef, useEffect, useState } from 'react';
import {  View,  Text,  Animated,  Dimensions,  TouchableOpacity,  FlatList,  ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {  faTrophy,  faArrowLeft,  faLock } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './Badges.styles';
import { COLORS } from '../../../theme/theme';
import { Badge, useBadgeStore } from '../../../stores/badgeStore';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';
import { useUserStore } from '../../../stores/userStore';
import Particles from '../../../components/Particles/Particles';
import { API_URL } from '../../../services/config';

// Import badge images
import memeLikerImg from '../../../assets/images/memeLiker.png';
import socialButterflyImg from '../../../assets/images/socialButterfly.png';
import memeMasterImg from '../../../assets/images/memeMaster.png';
import trendSetterImg from '../../../assets/images/trendSetter.png';


type BadgeType =
  | 'memeLiker' 
  | 'socialButterfly' 
  | 'memeMaster' 
  | 'trendSetter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_COLUMNS = 2; 
const CARD_MARGIN = 15;
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

const badgeImages: { [key in BadgeType]: any } = {
  memeLiker: memeLikerImg,
  socialButterfly: socialButterflyImg,
  memeMaster: memeMasterImg,
  trendSetter: trendSetterImg,
};

const Badges: React.FC = () => {
  const navigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const user = useUserStore((state) => state);
  const badges = useBadgeStore((state) => state.badges);
  const setBadges = useBadgeStore((state) => state.setBadges);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const windowWidth = SCREEN_WIDTH;
  const windowHeight = SCREEN_HEIGHT;

  const flipAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const flipValues = useRef<{ [key: string]: number }>({}).current;

  const initializeFlipAnim = (badgeId: string) => {
    if (!flipAnims[badgeId]) {
      flipAnims[badgeId] = new Animated.Value(0);
      flipValues[badgeId] = 0;

      flipAnims[badgeId].addListener(({ value }) => {
        flipValues[badgeId] = value;
      });
    }
  };

  

  useEffect(() => {
    // Fetch badges on initial load
    const fetchBadges = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching badges for user:', user.email);
        const response = await fetch(`${API_URL}/getUserBadges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: "getUserBadges",
            userEmail: user.email,
          }),
        });
    
        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);
    
        if (!response.ok) {
          throw new Error(`Failed to fetch badges: ${response.status} ${response.statusText}`);
        }
    
        if (responseData.data && Array.isArray(responseData.data.badges)) {
          const formattedBadges: Badge[] = responseData.data.badges.map((badge: any) => ({
            id: badge.BadgeType,
            type: badge.BadgeType as BadgeType,
            title: badge.BadgeName,
            description: badge.Description,
            earned: true,
            progress: 100,
            acquiredDate: badge.AwardedDate,
            holdersCount: 0, // This information is not provided in the current API response
          }));
          setBadges(formattedBadges);
        } else {
          console.log('No badges found or invalid data structure');
          setBadges([]);
        }
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error fetching badges:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchBadges();

    return () => {
      Object.keys(flipAnims).forEach((badgeId) => {
        flipAnims[badgeId].removeAllListeners();
      });
    };
  }, []);

  const handleFlip = (badgeId: string, earned: boolean) => {
    if (!earned) return;

    initializeFlipAnim(badgeId);
    const currentValue = flipValues[badgeId];

    Animated.spring(flipAnims[badgeId], {
      toValue: currentValue === 0 ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const renderBadge = ({ item }: { item: Badge; index: number }) => {
    const isEarned = item.earned;
  
    initializeFlipAnim(item.id);
  
    const frontInterpolate = flipAnims[item.id].interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    });
  
    const backInterpolate = flipAnims[item.id].interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg'],
    });
  
    const frontAnimatedStyle = {
      transform: [{ rotateY: frontInterpolate }],
    };
  
    const backAnimatedStyle = {
      transform: [{ rotateY: backInterpolate }],
    };
  
    return (
      <View style={styles.badgeContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleFlip(item.id, isEarned)}
          disabled={!isEarned}
          accessible
          accessibilityLabel={`Badge: ${item.title}`}
        >
          {/* Front Side */}
          <Animated.View
            style={[
              styles.badgeCard,
              frontAnimatedStyle,
              isEarned ? {} : styles.unearnedBadge,
              { backfaceVisibility: 'hidden' },
            ]}
          >
            <View style={styles.badgeIconContainer}>
              <Image
                source={badgeImages[item.type]}
                style={styles.badgeImage}
                resizeMode="contain"
                accessible
                accessibilityLabel={`${item.title} Icon`}
              />
            </View>
            {!isEarned && (
              <View style={styles.lockOverlay}>
                <FontAwesomeIcon icon={faLock} size={20} color={COLORS.error} />
              </View>
            )}
            <Text
              style={[
                styles.badgeTitle,
                { color: isDarkMode ? COLORS.white : COLORS.black },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.badgeDescription,
                { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
              ]}
            >
              {item.description}
            </Text>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Progress.Bar
                progress={item.progress / 100}
                width={CARD_WIDTH - 30}
                color={COLORS.primary}
                unfilledColor={isDarkMode ? COLORS.darkGray : COLORS.lightGray}
                borderWidth={0}
                height={8}
                borderRadius={4}
                animated={true}
              />
              <Text
                style={[
                  styles.progressText,
                  { color: isDarkMode ? COLORS.white : COLORS.black },
                ]}
              >
                {isEarned ? '100% earned' : `${item.progress}% to earn`}
              </Text>
            </View>
          </Animated.View>
  
          {/* Back Side */}
          {isEarned && (
            <Animated.View
              style={[
                styles.badgeCard,
                backAnimatedStyle,
                { 
                  backfaceVisibility: 'hidden', 
                  position: 'absolute', 
                  top: 0, 
                  left: 0,
                  elevation: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeBackTitle,
                  { color: isDarkMode ? COLORS.white : COLORS.black },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.badgeDetails,
                  { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                ]}
              >
                {item.description}
              </Text>
              <Text
                style={[
                  styles.badgeDetails,
                  { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                ]}
              >
                Acquired: {item.acquiredDate ? new Date(item.acquiredDate).toLocaleDateString() : 'N/A'}
              </Text>
              {item.holdersCount !== undefined && (
                <Text
                  style={[
                    styles.badgeDetails,
                    { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                  ]}
                >
                  Holders: {item.holdersCount}
                </Text>
              )}
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: isDarkMode ? COLORS.white : COLORS.white }]}>
          Loading Badges...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesomeIcon icon={faLock} size={50} color={COLORS.error} />
        <Text style={[styles.loadingText, { color: COLORS.error }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
    colors={['#013026', '#014760', '#107e57', '#a1ce3f', '#39FF14']}
      style={styles.gradientBackground}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Particles 
        windowWidth={windowWidth} 
        windowHeight={windowHeight} 
        density={0.05} 
        color={isDarkMode ? COLORS.particlesDark : COLORS.particlesDark} 
      />
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessible
              accessibilityLabel="Go Back"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                size={24}
                color={isDarkMode ? COLORS.white : COLORS.black}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                { color: isDarkMode ? COLORS.white : COLORS.black }
              ]}
            >
              My Badges
            </Text>
            <FontAwesomeIcon icon={faTrophy} size={24} color={COLORS.gold} />
          </View>

          <FlatList
            data={badges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.badgeList}
            accessibilityLabel="List of badges"
          />
      </Animated.View>
    </LinearGradient>
  );
};

export default Badges;
