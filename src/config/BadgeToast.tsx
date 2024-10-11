// src/config/BadgeToast.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Badge } from '../stores/badgeStore';
import { badgeImages } from '../screens/AppNav/Badges/Badges.types'; // Adjust the path if necessary

interface BadgeToastProps {
  badge: Badge;
  onDismiss: () => void; // Callback function to dismiss the toast
}

const BadgeToast: React.FC<BadgeToastProps> = ({ badge, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!badge) {
    return null; // Or display a default message or placeholder
  }

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
      <BlurView intensity={50} style={styles.blurContainer}>
        <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={styles.innerContainer}>
          <Image source={badgeImages[badge.type]} style={styles.badgeIcon} />
          <View style={styles.textContainer}>
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.badgeTitle}>You've earned the {badge.title} badge!</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  blurContainer: {
    borderRadius: 10,
    borderColor: '#1bd40b',
    borderWidth: 2,
    padding: 15,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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