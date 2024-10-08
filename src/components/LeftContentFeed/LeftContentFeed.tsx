import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';
import {formatDate} from '../../utils/dateUtils';

interface LeftContentFeedProps {
  username: string;
  caption: string;
  uploadTimestamp: string;
}

const LeftContentFeed: React.FC<LeftContentFeedProps> = ({
  username,
  caption,
  uploadTimestamp,
}) => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={[styles.textContainer, {bottom: tabBarHeight + 30}]}>
      <Text style={styles.username}>{username || 'Anonymous'}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
      <Text style={styles.date}>{formatDate(uploadTimestamp) || 'N/A'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    position: 'absolute',
    flexDirection: 'column',
    bottom: 0,
    left: 15,
    width: '60%',
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  caption: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
});

export default LeftContentFeed;
