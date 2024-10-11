// src/screens/AppNav/Badges/BadgeCard.tsx

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Badge, useBadgeStore } from '../../../stores/badgeStore';
import { getStyles } from './Badges.styles';
import { COLORS } from '../../../theme/theme';

type BadgeCardProps = {
  badge: Badge;
  badgeImage: any;
  isDarkMode: boolean;
};

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, badgeImage, isDarkMode }) => {
  const styles = getStyles(isDarkMode);
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
    <View style={styles.earnedBadgeContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFlip}
        onLongPress={handleLongPress}
        accessible
        accessibilityLabel={`Badge: ${badge.title}`}
      >
        <Animated.View
          style={[styles.badgeCard, frontAnimatedStyle, { opacity: frontOpacity }]}
        >
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
              <FontAwesomeIcon icon={faLock} size={16} color={COLORS.error} />
            </View>
          )}
          <Text style={styles.badgeTitle}>{badge.title}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.badgeCard,
            styles.badgeBackCard,
            backAnimatedStyle,
            { opacity: backOpacity },
            !badge.earned ? styles.unearnedBadge : {},
          ]}
        >
          <Text style={styles.badgeBackTitle}>{badge.title}</Text>
          <Text style={styles.badgeDetails}>{badge.description}</Text>
          {badge.earned && (
            <Text style={styles.badgeDetails}>
              Acquired: {new Date(badge.acquiredDate || '').toLocaleDateString()}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default BadgeCard;
