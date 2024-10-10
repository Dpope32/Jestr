// src/config/BadgeToast.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Badge } from '../stores/badgeStore';
import { badgeImages } from '../screens/AppNav/Badges/Badges.types'; // Adjust the path if necessary

interface BadgeToastProps {
  badge: Badge;
}

const BadgeToast: React.FC<BadgeToastProps> = ({ badge }) => {
  if (!badge) {
    return null; // Or display a default message or placeholder
  }

  return (
    <View style={styles.toastContainer}>
      <Image source={badgeImages[badge.type]} style={styles.badgeIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.badgeTitle}>You've earned the {badge.title} badge!</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badgeTitle: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#d4d4d4',
    marginTop: 3,
  },
});

export default BadgeToast;
