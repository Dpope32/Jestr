// Badges.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
  SectionList,
  SectionListRenderItem,
  SectionListData,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrophy, faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles, getColors } from './Badges.styles';
import { useBadgeStore, Badge } from '../../../stores/badgeStore';
import { badgeDetailsMap } from '../../../screens/AppNav/Badges/Badges.types';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';
import { useUserStore } from '../../../stores/userStore';
import Particles from '../../../components/Particles/Particles';
import { LinearGradient } from 'expo-linear-gradient';
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

  if (!isBadgesLoaded) {
    return <BadgesSkeletonLoader isDarkMode={isDarkMode} />;
  }

  const allBadges = badges; // Use badges from store directly

  // Include badges with 100% progress as earned
  const earnedBadges = allBadges.filter(
    (badge) => badge.earned || badge.progress >= 100
  );
  const unearnedBadges = allBadges.filter(
    (badge) => !badge.earned && badge.progress < 100
  );

  const totalBadges = allBadges.length;
  const earnedBadgesCount = earnedBadges.length;
  const progress = totalBadges > 0 ? earnedBadgesCount / totalBadges : 0;

  const pinnedBadge = badges.find((badge) => badge.id === pinnedBadgeId);
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

  // If there are no badges at all, display all badges as unearned
  if (sections.length === 0) {
    sections.push({
      title: 'Badges to Earn',
      data: allBadges,
    });
  }

  const renderSectionHeader = ({ section }: { section: SectionData }) => {
    return (
      <View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.title === 'Earned Badges' ? (
          <FlatList
            data={section.data}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <BadgeCard
                badge={item}
                badgeImage={badgeImages[item.type]}
                isDarkMode={isDarkMode}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.earnedBadgesContainer}
          />
        ) : null}
      </View>
    );
  };

  const renderItem: SectionListRenderItem<Badge> = ({ item, section }) => {
    if (section.title === 'Badges to Earn') {
      const details = badgeDetailsMap[item.type];
      const currentCount = item.currentCounts;
      const goalCount = details?.goal || 0;

      return (
        <View key={item.id} style={styles.badgeTableRow}>
          <View style={styles.badgeImageContainer}>
            <Image
              source={badgeImages[item.type]}
              style={styles.badgeTableImage}
              resizeMode="contain"
            />
            {!item.earned && (
              <>
                <View style={styles.badgeOverlay} />
                <FontAwesomeIcon
                  icon={faLock}
                  size={24}
                  color={COLORS.white}
                  style={styles.lockIcon}
                />
              </>
            )}
          </View>
          <View style={styles.badgeTableInfo}>
            <Text style={styles.badgeTableTitle}>{item.title}</Text>
            <Text style={styles.badgeTableDescription}>{item.description}</Text>
            <View style={styles.badgeProgressContainer}>
              <Progress.Bar
                progress={item.progress / 100}
                width={null}
                height={10}
                color={COLORS.primary}
                unfilledColor={COLORS.lightGray}
                borderWidth={0}
                borderRadius={5}
                style={styles.badgeProgressBar}
              />
              <Text style={styles.badgeTableProgressText}>
                {currentCount}/{goalCount} ({item.progress.toFixed(0)}%)
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
      <View style={StyleSheet.absoluteFill}>
        <Particles
          windowWidth={SCREEN_WIDTH}
          windowHeight={SCREEN_HEIGHT}
          density={0.005}
          color={isDarkMode ? COLORS.particlesDark : COLORS.particlesLight}
        />
      </View>
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
          ListFooterComponent={<View style={{ height: 20 }} />}
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
              data: [],
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
