// Badges.tsx

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import styles, { COLORS } from './Badges.styles';
import { Badge, useBadgeStore } from '../../../stores/badgeStore';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';
import { useUserStore } from '../../../stores/userStore';
import Particles from '../../../components/Particles/Particles';
import { API_URL } from '../../../services/config';
import { allBadges } from '../../../constants/uiConstants';
import BadgeCard from './BadgeCard'; 
import { BadgeType } from './Badges.types'; 

// Import badge images
import memeLikerImg from '../../../assets/images/s.png';
import socialButterflyImg from '../../../assets/images/socialButterfly.png';
import memeMasterImg from '../../../assets/images/2.png';
import trendSetterImg from '../../../assets/images/1.png';

const badgeImages: { [key in BadgeType]: any } = {
  memeLiker: memeLikerImg,
  socialButterfly: socialButterflyImg,
  memeMaster: memeMasterImg,
  trendSetter: trendSetterImg,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_MARGIN = 15;
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

const Badges: React.FC = () => {
  const navigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const user = useUserStore((state) => state);
  const badges = useBadgeStore((state) => state.badges);
  const setBadges = useBadgeStore((state) => state.setBadges);
  const pinnedBadgeId = useBadgeStore((state) => state.pinnedBadgeId);
  const setPinnedBadge = useBadgeStore((state) => state.setPinnedBadge);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const windowWidth = SCREEN_WIDTH;
  const windowHeight = SCREEN_HEIGHT;

  const createdAtDate = user.creationDate
  ? new Date(user.creationDate).toLocaleDateString()
  : 'N/A';

  const imgSrc = user.profilePic
    ? { uri: user.profilePic }
    : require('../../../assets/images/Jestr.jpg');

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      try {
 //       console.log('Fetching badges for user:', user.email);
        const response = await fetch(`${API_URL}/getUserBadges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'getUserBadges',
            userEmail: user.email,
          }),
        });

 //       console.log('Response status:', response.status);
        const responseData = await response.json();
 //       console.log('Response data:', responseData);

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
            holdersCount: 0,
          }));
          setBadges(formattedBadges);
        } else {
 //         console.log('No badges found or invalid data structure');
          setBadges([]);
        }
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
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.white }]}>
          Loading Badges...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <FontAwesomeIcon icon={faLock} size={50} color={COLORS.error} />
        <Text style={[styles.loadingText, { color: COLORS.error }]}>{error}</Text>
      </View>
    );
  }

  // Calculate total badges and score
  const totalBadges = allBadges.length;
  const earnedBadgesCount = badges.length;
  const score = Math.round((earnedBadgesCount / totalBadges) * 100);

  // Get pinned badge
  const pinnedBadge = badges.find((badge) => badge.id === pinnedBadgeId);

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
        <BlurView intensity={90} tint="dark" style={styles.headerBlur}>
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
                { color: COLORS.white }, // Fixed color
              ]}
            >
              My Badges
            </Text>
            <FontAwesomeIcon icon={faTrophy} size={24} color={COLORS.gold} />
          </View>
        </BlurView>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* First Row */}
            <View style={styles.profileRow}>
              <Image
                source={imgSrc}
                style={styles.profileImage}
              />
              <Text style={styles.profileActiveDays}>
                Created At: {createdAtDate}
              </Text>
              <View style={styles.scoreContainer}>
                <Progress.Circle
                  size={70}
                  progress={score / 100}
                  showsText={true}
                  formatText={() => `${score}`}
                  textStyle={styles.scoreText}
                  color={COLORS.primary}
                  unfilledColor={COLORS.lightGray} // Updated color
                  borderWidth={0}
                  thickness={6}
                />
              </View>
            </View>

            {/* Second Row: Pinned Badge */}
            {pinnedBadge && (
              <View style={styles.pinnedBadgeRow}>
                <Text style={styles.pinnedBadgeLabel}>Pinned Badge:</Text>
                <View style={styles.pinnedBadge}>
                  <Image
                    source={badgeImages[pinnedBadge.type]}
                    style={styles.pinnedBadgeImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.pinnedBadgeName}>{pinnedBadge.title}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Earned Badges */}
          <Text style={styles.sectionTitle}>Earned Badges</Text>
          <FlashList
            data={badges}
            renderItem={({ item }) => (
              <BadgeCard
                badge={item}
                badgeImage={badgeImages[item.type]}
                isDarkMode={isDarkMode}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            scrollEnabled={false}
            contentContainerStyle={styles.badgeList}
            estimatedItemSize={188} 
            accessibilityLabel="List of badges"
          />

          {/* All Badges Table */}
          <Text style={styles.sectionTitle}>All Badges</Text>
          {allBadges.map((badge) => {
            const isEarned = badges.some((b) => b.id === badge.id);
            const progress = isEarned ? 100 : badge.progress;
            return (
              <View key={badge.id} style={styles.badgeTableRow}>
                <Image
                  source={badgeImages[badge.type]}
                  style={styles.badgeTableImage}
                  resizeMode="contain"
                />
                <View style={styles.badgeTableInfo}>
                  <Text style={styles.badgeTableTitle}>{badge.title}</Text>
                  <Text style={styles.badgeTableDescription}>
                    {badge.description}
                  </Text>
                  <Progress.Bar
                    progress={progress / 100}
                    width={SCREEN_WIDTH - 150}
                    color={COLORS.primary}
                    unfilledColor={COLORS.lightGray}
                    borderWidth={0}
                    height={8}
                    borderRadius={4}
                    animated={true}
                  />
                  <Text style={styles.badgeTableProgressText}>
                    {isEarned ? 'Complete' : `${progress}%`}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

export default Badges;
