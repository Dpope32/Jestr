// Badges.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SectionList,
  SectionListRenderItem,
  SectionListData,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles, getColors } from './Badges.styles';
import { useBadgeStore, getBadgeStorageContents, Badge } from '../../../stores/badgeStore';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';
import { useUserStore } from '../../../stores/userStore';
import Particles from '../../../components/Particles/Particles';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllBadges } from './defaultBadges';
import BadgeCard from './BadgeCard';
import { badgeImages } from './Badges.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type SectionData = SectionListData<Badge>;

const Badges: React.FC = () => {
  const navigation = useNavigation<AppNavProp>();
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const COLORS = getColors(isDarkMode);

  const user = useUserStore((state) => state);
  const { badges, pinnedBadgeId, isBadgesLoaded } = useBadgeStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const createdAtDate = user.creationDate
    ? new Date(user.creationDate).toLocaleDateString()
    : 'N/A';
  const imgSrc = user.profilePic
    ? { uri: user.profilePic }
    : require('../../../assets/images/Jestr.jpg');


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    getBadgeStorageContents();
  }, []);

  if (!isBadgesLoaded) {
    return <BadgesSkeletonLoader isDarkMode={isDarkMode} />;
  }

  const allBadges = getAllBadges();
  const earnedBadges = badges.filter((badge) => badge.earned);
  const unearnedBadges = allBadges.filter((badge) => !badges.some((b) => b.type === badge.type && b.earned));
  const totalBadges = allBadges.length;
  const earnedBadgesCount = earnedBadges.length;
  const progress = totalBadges > 0 ? earnedBadgesCount / totalBadges : 0;

  const pinnedBadge = badges.find((badge) => badge.id === pinnedBadgeId);
const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};
  // Prepare sections for SectionList
  const sections: SectionData[] = [];

  if (earnedBadges.length > 0) {
    sections.push({
      title: 'Earned Badges',
      data: earnedBadges,
    });
  }

  if (unearnedBadges.length > 0) {
    sections.push({
      title: 'Badges to Earn',
      data: unearnedBadges,
    });
  }

  // Correctly type the renderSectionHeader
  const renderSectionHeader = ({ section }: { section: SectionData }) => {
    return <Text style={styles.sectionTitle}>{section.title}</Text>;
  };

  // Correctly type the renderItem
  const renderItem: SectionListRenderItem<Badge> = ({ item, section }) => {
    if (section.title === 'Earned Badges') {
      return (
        <BadgeCard
          badge={item}
          badgeImage={badgeImages[item.type]}
          isDarkMode={isDarkMode}
        />
      );
    } else if (section.title === 'Badges to Earn') {
      const storedBadge = badges.find((b) => b.type === item.type);
      const progressValue = storedBadge ? storedBadge.progress : 0;

      return (
        <View key={item.id} style={styles.badgeTableRow}>
          <View style={styles.badgeImageContainer}>
            <Image
              source={badgeImages[item.type]}
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
            <Text style={styles.badgeTableTitle}>{item.title}</Text>
            <Text style={styles.badgeTableDescription}>{item.description}</Text>
            <View style={styles.badgeProgressContainer}>
              <Progress.Bar
                progress={progressValue / 100}
                width={null}
                height={10}
                color={COLORS.primary}
                unfilledColor={COLORS.lightGray}
                borderWidth={0}
                borderRadius={5}
                style={styles.badgeProgressBar}
              />
              <Text style={styles.badgeTableProgressText}>
                {progressValue}%
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  const keyExtractor = (item: Badge) => item.id;

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

        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.profileSection}>
              <View style={styles.profileRow}>
                <Image source={imgSrc} style={styles.profileImage} />
                <Text style={styles.profileActiveDays}>Joined: {createdAtDate}</Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Badges Earned: {earnedBadgesCount} / {totalBadges}
                </Text>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  height={10}
                  color={COLORS.primary}
                  unfilledColor={COLORS.lightGray}
                  borderWidth={0}
                  borderRadius={5}
                  style={styles.progressBar}
                />
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
          }
          ListFooterComponent={<View style={{ height: 20 }} />} // Optional spacing at the bottom
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
};

interface BadgesSkeletonLoaderProps {
  isDarkMode: boolean;
}

const BadgesSkeletonLoader: React.FC<BadgesSkeletonLoaderProps> = ({ isDarkMode }) => {
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

        <SectionList
          sections={[
            {
              title: '',
              data: [], // No data for skeleton loader
            },
          ]}
          renderSectionHeader={() => null}
          renderItem={() => (
            <>
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
            </>
          )}
          keyExtractor={(_, index) => `skeleton-${index}`}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default Badges;
