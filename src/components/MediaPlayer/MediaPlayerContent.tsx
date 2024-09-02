import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faThumbsUp,
  faComment,
  faShare,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {BlurView} from 'expo-blur';
import {Animated} from 'react-native';

import styles from './MP.styles';
import {ShareType, User} from '../../types/types';
import { COLORS } from '../../theme/theme';

import {fetchComments} from '../Meme/memeService';

interface IconButtonProps {
  icon: any;
  count: number;
  onPress: () => void;
  color?: string;
  memeID: string;
}

interface IconsAndContentProps {
  memeUser: any;
  caption: string;
  uploadTimestamp: string;
  index: number;
  isFollowed: boolean;
  currentIndex: number;
  isFollowing?: boolean;
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
  handleDownloadPress: () => void;
  isSaved: boolean;
  toggleCommentFeed: () => void;
  formatDate: (date: string) => string;
  animatedBlurIntensity: Animated.Value;
  iconAreaRef: React.RefObject<View>;
  onShare: (type: ShareType, username: string, message: string) => void;
  user: User | null;
  memeID: string;
  numOfComments: number;
}

const IconButton: React.FC<IconButtonProps> = React.memo(({
  icon,
  count,
  onPress,
  color = COLORS.primary,
  memeID,
}) => {
  // UNECESSARY !!!
  // const [commentsLength, setCommentsLength] = useState(0);
  // console.log('count in IconButton ===>', count);

  // useEffect(() => {
  //   const getCommentsLength = async () => {
  //     const updatedComments = await fetchComments(memeID);
  //     setCommentsLength(updatedComments.length);
  //   };

  //   getCommentsLength();
  // }, [memeID]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.iconWrapper}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <FontAwesomeIcon icon={icon} size={28} color={color} />
      <Text style={[styles.iconText, {color: '#FFFFFF'}]}>{count}</Text>
    </TouchableOpacity>
  );
});

export const IconsAndContent: React.FC<IconsAndContentProps> = React.memo(({
  memeUser,
  caption,
  uploadTimestamp,
  counts,
  debouncedHandleLike,
  liked,
  doubleLiked,
  handleDownloadPress,
  isSaved,
  toggleCommentFeed,
  formatDate,
  animatedBlurIntensity,
  iconAreaRef,
  isFollowing,
  isFollowed,
  index,
  currentIndex,
  handleFollow,
  onShare,
  user,
  memeID,
  numOfComments,
}) => {
  // console.log('memeID in IconsAndContent ===>', memeID);
  // console.log('numOfComments in IconsAndContent ===>', numOfComments);

  const isActive = index === currentIndex;

  if (!isActive) {
    return null; // Don't render if not the active item
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

        <View
          ref={iconAreaRef}
          style={styles.iconColumn}
          onLayout={event => {
            const {x, y, width, height} = event.nativeEvent.layout;
          }}>
          <View style={styles.profilePicContainer}>
            <Image
              source={
                memeUser?.profilePic
                  ? {uri: memeUser.profilePic}
                  : require('../../assets/images/Jestr.jpg')
              }
              style={styles.profilePic}
            />
            {!isFollowed && (
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
            memeID={memeID}
            onPress={handleLikePress}
            color={liked || doubleLiked ? '#023020' :  COLORS.primary}
          />
          <IconButton
            icon={faComment}
            memeID={memeID}
            // count={counts.comments}
            count={numOfComments}
            onPress={handleCommentPress}
          />
          <IconButton
            icon={faShare}
            memeID={memeID}
            count={counts.shares}
            onPress={handleSharePress}
          />
        </View>
      </BlurView>
    </Animated.View>
  );
});

export default IconsAndContent;
