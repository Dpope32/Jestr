import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faThumbsUp, faComment} from '@fortawesome/free-solid-svg-icons';
import {faShare, faPlus} from '@fortawesome/free-solid-svg-icons';
import {BlurView} from 'expo-blur';
import {Animated} from 'react-native';

import styles from './MP.styles';
import {ShareType, User} from '../../types/types';
import {COLORS} from '../../theme/theme';
import {formatDate} from '../../utils/dateUtils';

interface IconButtonProps {
  icon: any;
  count: number;
  onPress: () => void;
  color?: string;
}

interface IconsAndContentProps {
  memeUser: any;
  caption: string;
  uploadTimestamp: string;
  index: number;
  currentIndex: number;
  isFollowing: boolean;
  handleFollow: () => void;
  counts: {
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
  };
  debouncedHandleLike: () => void;
  liked: boolean;
  doubleLiked: boolean;
  toggleCommentFeed: () => void;
  animatedBlurIntensity: Animated.Value;
  iconAreaRef: React.RefObject<View>;
  onShare: (type: ShareType, username: string, message: string) => void;
  user: User | null;
  numOfComments: number;
}

const IconButton: React.FC<IconButtonProps> = React.memo(
  ({icon, count, onPress, color = COLORS.primary}) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.iconWrapper}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <FontAwesomeIcon icon={icon} size={28} color={color} />
        <Text style={[styles.iconText, {color: '#FFFFFF'}]}>{count}</Text>
      </TouchableOpacity>
    );
  },
);

export const IconsAndContent: React.FC<IconsAndContentProps> = React.memo(
  ({
    memeUser,
    caption,
    uploadTimestamp,
    counts,
    debouncedHandleLike,
    liked,
    doubleLiked,
    toggleCommentFeed,
    animatedBlurIntensity,
    iconAreaRef,
    isFollowing,
    index,
    currentIndex,
    handleFollow,
    onShare,
    user,
    numOfComments,
  }) => {
    // console.log('memeID in IconsAndContent ===>', memeID);
    // console.log('numOfComments in IconsAndContent ===>', numOfComments);

    const isActive = index === currentIndex;

    if (!isActive) {
      return null;
    }

    const handleLikePress = useCallback(() => {
      console.log('Like button pressed');
      debouncedHandleLike();
    }, [debouncedHandleLike]);

    const handleCommentPress = useCallback(() => {
      toggleCommentFeed();
    }, [toggleCommentFeed]);

    const handleSharePress = useCallback(() => {
      if (user && memeUser?.username) {
        onShare('friend', memeUser.username, 'Check out this meme!');
      }
    }, [user, memeUser, onShare]);

    return (
      <Animated.View
        style={[
          styles.blurContainer,
          {
            opacity: Animated.subtract(
              1,
              Animated.divide(animatedBlurIntensity, 150),
            ),
          },
        ]}>
        <BlurView intensity={100} tint="dark" style={styles.blurInner}>
          <View style={styles.textContainer}>
            <View style={styles.textContent}>
              <Text style={styles.username}>
                {memeUser?.username || 'Anonymous'}
              </Text>
              {caption && <Text style={styles.caption}>{caption}</Text>}
              <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
            </View>
          </View>

          <View ref={iconAreaRef} style={styles.iconColumn}>
            <View style={styles.profilePicContainer}>
              <Image
                source={
                  memeUser?.profilePic
                    ? {uri: memeUser.profilePic}
                    : require('../../assets/images/Jestr.jpg')
                }
                style={styles.profilePic}
              />
              {!isFollowing && (
                <TouchableOpacity
                  onPress={handleFollow}
                  style={styles.followButton}>
                  <FontAwesomeIcon icon={faPlus} size={12} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            <IconButton
              icon={faThumbsUp}
              count={counts.likes}
              onPress={handleLikePress}
              color={liked || doubleLiked ? '#023020' : COLORS.primary}
            />
            <IconButton
              icon={faComment}
              // count={counts.comments}
              count={numOfComments}
              onPress={handleCommentPress}
            />
            <IconButton
              icon={faShare}
              count={counts.shares}
              onPress={handleSharePress}
            />
          </View>
        </BlurView>
      </Animated.View>
    );
  },
);

export default IconsAndContent;
