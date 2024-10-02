// Badges.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles, getColors } from './Badges.styles';
import { useBadgeStore } from '../../../stores/badgeStore';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';
import { useUserStore } from '../../../stores/userStore';
import Particles from '../../../components/Particles/Particles';
import { LinearGradient } from 'expo-linear-gradient';
import { allBadges } from '../../../constants/uiConstants';
import BadgeCard from './BadgeCard';
import { badgeImages } from './Badges.types';
import { fetchUserBadges } from '../../../services/badgeServices';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Badges: React.FC = () => {
  const navigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const COLORS = getColors(isDarkMode);

  const user = useUserStore((state) => state);
  const badges = useBadgeStore((state) => state.badges);
  const setBadges = useBadgeStore((state) => state.setBadges);
  const pinnedBadgeId = useBadgeStore((state) => state.pinnedBadgeId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
        const formattedBadges = await fetchUserBadges(user.email);
        setBadges(formattedBadges);
        console.log('formattedBadges:', formattedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
        setError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        );
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
  }, []);

  if (isLoading) {
    return <BadgesSkeletonLoader isDarkMode={isDarkMode} />;
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

  const totalBadges = allBadges.length;
  const earnedBadgesCount = badges.length;
  const score = Math.round((earnedBadgesCount / totalBadges) * 100);
  const pinnedBadge = badges.find((badge) => badge.id === pinnedBadgeId);
  const unearnedBadges = allBadges.filter(
    (badge) => !badges.some((b) => b.id === badge.id)
  );

  return (
    <View style={styles.container}>
      {isDarkMode ? (
        <View style={StyleSheet.absoluteFillObject}>
          <Particles
            windowWidth={SCREEN_WIDTH}
            windowHeight={SCREEN_HEIGHT}
            density={0.005}
            color={COLORS.particlesDark}
          />
        </View>
      ) : (
        <LinearGradient
          colors={['#013026', '#014760', '#107e57']}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <BlurView
          intensity={99}
          tint={isDarkMode ? 'dark' : 'light'}
          style={styles.headerBlur}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessible
              accessibilityLabel="Go Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Badges</Text>
            <FontAwesomeIcon icon={faTrophy} size={24} color={COLORS.gold} />
          </View>
        </BlurView>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileRow}>
              <Image source={imgSrc} style={styles.profileImage} />
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
                  unfilledColor={COLORS.lightGray}
                  borderWidth={0}
                  thickness={6}
                />
              </View>
            </View>
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

          <Text style={styles.sectionTitle}>Earned Badges</Text>
          {badges.length > 0 ? (
            <View style={styles.flashListContainer}>
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
                numColumns={2}
                estimatedItemSize={188}
                accessibilityLabel="List of badges"
              />
            </View>
          ) : (
            <View style={styles.noBadgesContainer}>
              <Text style={styles.noBadgesText}>
                No badges earned yet. Keep going!
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Badges to Earn</Text>
          {unearnedBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeTableRow}>
              <View style={styles.badgeImageContainer}>
                <Image
                  source={badgeImages[badge.type]}
                  style={styles.badgeTableImage}
                  resizeMode="contain"
                />
                <View style={styles.badgeOverlay} />
                <FontAwesomeIcon
                  icon={faLock}
                  size={24}
                  color={COLORS.white}
                  style={styles.lockIcon}
                />
              </View>
              <View style={styles.badgeTableInfo}>
                <Text style={styles.badgeTableTitle}>{badge.title}</Text>
                <Text style={styles.badgeTableDescription}>
                  {badge.description}
                </Text>
                <Progress.Bar
                  progress={badge.progress / 100}
                  width={SCREEN_WIDTH - 180}
                  color={COLORS.primary}
                  unfilledColor={COLORS.lightGray}
                  borderWidth={0}
                  height={8}
                  borderRadius={4}
                  animated={true}
                />
                <Text style={styles.badgeTableProgressText}>
                  {`${badge.progress}%`}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

interface BadgesSkeletonLoaderProps {
  isDarkMode: boolean;
}

const BadgesSkeletonLoader: React.FC<BadgesSkeletonLoaderProps> = ({
  isDarkMode,
}) => {
  const styles = getStyles(isDarkMode);
  const COLORS = getColors(isDarkMode);
  return (
    <View style={styles.gradientBackground}>
      <View style={styles.container}>
        <Particles
          windowWidth={SCREEN_WIDTH}
          windowHeight={SCREEN_HEIGHT}
          density={0.005}
          color={COLORS.particlesDark}
        />
        <BlurView
          intensity={90}
          tint={isDarkMode ? 'dark' : 'light'}
          style={styles.headerBlur}
        >
          <View style={styles.header}>
            <View style={styles.skeletonBackButton} />
            <View style={styles.skeletonHeaderTitle} />
            <View style={styles.skeletonTrophy} />
          </View>
        </BlurView>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.skeletonProfileSection}>
            <View style={styles.skeletonProfileImage} />
            <View style={styles.skeletonProfileInfo} />
          </View>

          <View style={styles.skeletonSectionTitle} />
          {[1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={styles.skeletonBadgeRow}>
              <View style={styles.skeletonBadgeImage} />
              <View style={styles.skeletonBadgeInfo}>
                <View style={styles.skeletonBadgeTitle} />
                <View style={styles.skeletonBadgeDescription} />
                <View style={styles.skeletonProgressBar} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Badges;
