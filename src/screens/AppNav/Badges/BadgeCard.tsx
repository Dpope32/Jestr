import React, { useRef, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import * as Progress from 'react-native-progress';
import { COLORS } from '../../../theme/theme';
import { Badge, useBadgeStore } from '../../../stores/badgeStore';
import styles from './Badges.styles'; 

type BadgeCardProps = {
  badge: Badge;
  badgeImage: any;
  isDarkMode: boolean;
};

const CARD_MARGIN = 15;
const NUM_COLUMNS = 2;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;
const PROGRESS_BAR_WIDTH = CARD_WIDTH - 30;

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, badgeImage, isDarkMode }) => {
  const setPinnedBadge = useBadgeStore((state) => state.setPinnedBadge);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFront, setIsFront] = useState(true);

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFront ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFront(!isFront);
    });
  };

  const handleLongPress = () => {
    if (!badge.earned) return;

    Alert.alert('Pin Badge', 'Do you want to pin this badge to your profile?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pin', onPress: () => setPinnedBadge(badge.id) },
    ]);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.badgeContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFlip}
        onLongPress={handleLongPress}
        disabled={!badge.earned}
        accessible
        accessibilityLabel={`Badge: ${badge.title}`}
      >
        <Animated.View style={[styles.badgeCard, frontAnimatedStyle, { opacity: frontOpacity }]}>
          <View style={styles.badgeIconContainer}>
            <Image
              source={badgeImage}
              style={styles.badgeImage}
              resizeMode="contain"
              accessible
              accessibilityLabel={`${badge.title} Icon`}
            />
          </View>
          {!badge.earned && (
            <View style={styles.lockOverlay}>
              <FontAwesomeIcon icon={faLock} size={20} color={COLORS.error} />
            </View>
          )}
          <Text style={styles.badgeTitle}>{badge.title}</Text>
          <View style={styles.progressSection}>
            <Progress.Bar
              progress={badge.progress / 100}
              width={PROGRESS_BAR_WIDTH}
              color={COLORS.primary}
              unfilledColor={isDarkMode ? COLORS.darkGray : COLORS.lightGray}
              borderWidth={0}
              height={8}
              borderRadius={4}
              animated={true}
            />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.badgeCard, 
            styles.badgeBackCard, 
            backAnimatedStyle, 
            { opacity: backOpacity },
            badge.earned ? {} : styles.unearnedBadge,
          ]}
        >
          <Text style={styles.badgeBackTitle}>{badge.title}</Text>
          <Text style={styles.badgeDetails}>{badge.description}</Text>
          <Text style={styles.badgeDetails}>
            Acquired:{' '}
            {badge.acquiredDate
              ? new Date(badge.acquiredDate).toLocaleDateString()
              : 'N/A'}
          </Text>
          {badge.holdersCount !== undefined && (
            <Text style={styles.badgeDetails}>Holders: {badge.holdersCount}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default BadgeCard;