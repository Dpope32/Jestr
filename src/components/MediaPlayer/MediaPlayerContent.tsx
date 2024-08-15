import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faSave, faComment, faShare } from '@fortawesome/free-solid-svg-icons';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';
import styles from './MP.styles';

interface IconButtonProps {
  icon: any;
  count: number;
  onPress: () => void;
  color?: string;
}

export const IconButton: React.FC<IconButtonProps> = React.memo(({ icon, count, onPress, color = "#1bd40b" }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconWrapper}>
    <FontAwesomeIcon icon={icon} size={28} color={color} />
    <Text style={[styles.iconText, { color: '#FFFFFF' }]}>{count}</Text>
  </TouchableOpacity>
));

interface IconsAndContentProps {
  memeUser: any;
  caption: string;
  uploadTimestamp: string;
  counts: any;
  debouncedHandleLike: () => void;
  liked: boolean;
  doubleLiked: boolean;
  handleDownloadPress: () => void;
  isSaved: boolean;
  toggleCommentFeed: () => void;
  formatDate: (date: string) => string;
  animatedBlurIntensity: Animated.Value;
}

export const IconsAndContent: React.FC<IconsAndContentProps> = React.memo(({
  memeUser,
  caption,
  uploadTimestamp,
  counts,
  debouncedHandleLike,
  liked,
  doubleLiked,

  toggleCommentFeed,
  formatDate,
  animatedBlurIntensity
}) => (
  <Animated.View 
    style={[
      styles.blurContainer,
      { opacity: Animated.subtract(1, Animated.divide(animatedBlurIntensity, 150)) }
    ]}
  >
    <BlurView intensity={100} tint="dark" style={styles.blurInner}>
      <View style={styles.textContainer}>
        <Image 
          source={memeUser?.profilePic ? { uri: memeUser.profilePic } : require('../../assets/images/Jestr.jpg')} 
          style={styles.profilePic} 
        />
        <View style={styles.textContent}>
          <Text style={styles.username}>{memeUser?.username || 'Anonymous'}</Text>
          {caption && <Text style={styles.caption}>{caption}</Text>}
          <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
        </View>
      </View>
      <View style={styles.iconColumn}>
        <IconButton icon={faThumbsUp} count={counts.likes} onPress={debouncedHandleLike} color={liked || doubleLiked ? '#006400' : "#1bd40b"} />
        <IconButton icon={faComment} count={counts.comments} onPress={toggleCommentFeed} />
        <IconButton icon={faShare} count={counts.shares} onPress={() => {}} />
      </View>
    </BlurView>
  </Animated.View>
));