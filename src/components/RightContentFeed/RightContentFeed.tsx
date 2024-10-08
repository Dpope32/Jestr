import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faThumbsUp, faComment} from '@fortawesome/free-solid-svg-icons';
import {faShare, faPlus} from '@fortawesome/free-solid-svg-icons';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import styles from './styles';
import {COLORS} from '../../theme/theme';
import {addFollow} from '../../services/socialService';
import {useLikeMutation} from '../../screens/AppNav/Feed/useLikeMutation';
// import {ShareType, User} from '../../types/types';

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
  // onShare: (type: ShareType, username: string, message: string) => void;
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
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const likeMutation = useLikeMutation(userEmail);

  const imgSrc = userImgSrc
    ? {uri: userImgSrc}
    : require('../../assets/images/Jestr.jpg');

  const addFollowMutation = useMutation({
    mutationFn: ({
      followerId,
      followeeId,
    }: {
      followerId: string;
      followeeId: string;
    }) => addFollow(followerId, followeeId),
    onSuccess: (data, variables) => {
      if (data.success) {
        const queryKey = ['memez', userEmail];
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;

          const updatedPages = oldData.pages.map((page: any) => {
            const updatedMemes = page.memes.map((meme: any) => {
              if (meme.email === variables.followeeId) {
                return {...meme, isFollowed: true};
              }
              return meme;
            });
            return {...page, memes: updatedMemes};
          });

          return {...oldData, pages: updatedPages};
        });
      }
    },
    onError: error => {
      console.error('Error in addFollow mutation:', error);
    },
  });

  const handleFollow = () => {
    addFollowMutation.mutate({
      followerId: userEmail,
      followeeId: memeUserEmail,
    });
  };

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
    setIsCommentFeedVisible(true);
  };

  const handleSharePress = () => {
    // Here onShare only triggers the share modal
    // needs clarification!
    if (memeUsername) {
      // onShare('friend', memeUsername, 'Check out this meme!');
      onShare();
    }
  };

  return (
    <View
      pointerEvents="auto"
      style={[styles.contentContainer, {bottom: tabBarHeight + 10}]}>
      {/* === MEME USER AVATAR + FOLLOW BUTTON ==== */}
      <View style={styles.profilePicContainer}>
        {!isFollowing && (
          <TouchableOpacity onPress={handleFollow} style={styles.followButton}>
            <FontAwesomeIcon icon={faPlus} size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Image source={imgSrc} style={styles.profilePic} />
      </View>
      {/* ==== LIKE BUTTON ==== */}
      <IconButton
        icon={faThumbsUp}
        count={likesCount}
        onPress={handleLikePress}
        color={likedByUser ? '#023020' : COLORS.primary}
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
