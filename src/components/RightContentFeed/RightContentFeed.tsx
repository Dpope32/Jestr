// RightContentFeed.tsx

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faComment, faShare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import styles from './styles';
import { COLORS } from '../../theme/theme';
import { addFollow } from '../../services/socialService';
import { useLikeMutation } from '../../screens/AppNav/Feed/useLikeMutation';
import { useUserStore } from '../../stores/userStore';
import { useFollowStore } from '../../stores/followStore';
import { useBadgeStore } from '../../stores/badgeStore';
import { getUser } from '../../services/userService';

interface IconButtonProps {
  icon: any;
  count: number;
  onPress: () => void;
  color?: string;
}

interface IconsAndContentProps {
  isFollowing: boolean;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  userImgSrc: string;
  memeUserEmail: string;
  userEmail: string;
  currentMemeID: string;
  likedByUser: boolean;
  onShare: () => void;
  memeUsername: string;
  setIsCommentFeedVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const IconButton: React.FC<IconButtonProps> = React.memo(
  ({ icon, count, onPress, color = COLORS.white }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.iconWrapper}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesomeIcon icon={icon} size={28} color={color} />
        <Text style={[styles.iconText, { color: COLORS.white }]}>{count}</Text>
      </TouchableOpacity>
    );
  },
);

const useAddFollowMutation = (userEmail: string, memeUserEmail: string) => {
  const incrementFollowing = useUserStore((state) => state.incrementFollowingCount);
  const addFollowing = useFollowStore((state) => state.addFollowing);
  const incrementFollowerBadge = useBadgeStore((state) => state.incrementCount);

  return useMutation({
    mutationFn: async () => {
      const result = await addFollow(userEmail, memeUserEmail);
      return result;
    },
    onSuccess: async (data) => {
      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Followed Successfully',
          text2: `You are now following ${memeUserEmail}`,
          position: 'top',
          visibilityTime: 3000,
        });

        incrementFollowing();
        incrementFollowerBadge('followerCount');

        // Fetch full user data
        const userData = await getUser(memeUserEmail);
        if (userData) {
          await addFollowing(userEmail, userData);
        } else {
          console.error('Failed to fetch user data for', memeUserEmail);
        }
      } else {
        console.error('Failed to add follow:', data.message);
        Toast.show({
          type: 'error',
          text1: 'Follow Failed',
          text2: data.message || 'Unable to follow the user.',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Error in addFollow mutation:', error);
      Toast.show({
        type: 'error',
        text1: 'Follow Failed',
        text2: 'Unable to follow the user. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    },
  });
};

export const RightContentFeed: React.FC<IconsAndContentProps> = ({
  isFollowing,
  likesCount,
  sharesCount,
  commentsCount,
  userImgSrc,
  memeUserEmail,
  userEmail,
  currentMemeID,
  likedByUser,
  onShare,
  memeUsername,
  setIsCommentFeedVisible,
}) => {
  const tabBarHeight = useBottomTabBarHeight();
  const likeMutation = useLikeMutation(userEmail);

  const addFollowMutation = useAddFollowMutation(userEmail, memeUserEmail);

  const imgSrc = userImgSrc
    ? { uri: userImgSrc }
    : require('../../assets/images/Jestr.jpg');

  const handleFollow = useCallback(() => {
    console.log('Follow button pressed');
    addFollowMutation.mutate();
  }, [addFollowMutation]);

  const handleLikePress = () => {
    console.log('Like button pressed');
    const incrementLikes = !likedByUser;
    likeMutation.mutate({
      memeID: currentMemeID,
      incrementLikes,
      email: userEmail,
      doubleLike: false,
      incrementDownloads: false,
    });
  };

  const handleCommentPress = () => {
    console.log('Comment button pressed');
    setIsCommentFeedVisible(true);
  };

  const handleSharePress = () => {
    console.log('Share button pressed');
    if (memeUsername) {
      onShare();
    }
  };

  return (
    <View
      pointerEvents="auto"
      style={[styles.contentContainer, { bottom: tabBarHeight + 10 }]}
    >
      {/* === MEME USER AVATAR + FOLLOW BUTTON ==== */}
      <View style={styles.profilePicContainer}>
        {!isFollowing && (
          <TouchableOpacity onPress={handleFollow} style={styles.followButton}>
            <FontAwesomeIcon icon={faPlus} size={12} color="#F3F4F8" />
          </TouchableOpacity>
        )}
        <Image source={imgSrc} style={styles.profilePic} />
      </View>
      {/* ==== LIKE BUTTON ==== */}
      <IconButton
        icon={faThumbsUp}
        count={likesCount}
        onPress={handleLikePress}
        color={likedByUser ? COLORS.primary : '#F3F4F8'}
      />
      {/* == COMMENTS BUTTON ==  */}
      <IconButton
        icon={faComment}
        count={commentsCount}
        onPress={handleCommentPress}
      />
      {/* === SHARE BUTTON == */}
      <IconButton
        icon={faShare}
        count={sharesCount}
        onPress={handleSharePress}
      />
    </View>
  );
};

export default RightContentFeed;
