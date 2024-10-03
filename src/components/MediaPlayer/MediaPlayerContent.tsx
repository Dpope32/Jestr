import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faThumbsUp,
  faComment,
  faShare,
  faPlus,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';
import styles from './MPContent.styles';
import { IconsAndContentProps, ShareType } from '../../types/types';
import { COLORS } from '../../theme/theme';
import ShareModal from '../Modals/ShareModal';
import CommentFeed from '../Modals/CommentFeed/CommentFeed';

interface IconButtonProps {
  icon: IconDefinition;
  count: number;
  onPress: () => void;
  color?: string;
  memeID: string;
  isDimmed?: boolean;
}

const IconButton: React.FC<IconButtonProps> = React.memo(
  ({
    icon,
    count,
    onPress,
    color = COLORS.primary,
    memeID,
    isDimmed,
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.iconWrapper}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <FontAwesomeIcon icon={icon} size={28} color={color} />
        <Text style={[styles.iconText, { color: '#FFFFFF' }]}>{count}</Text>
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
    liked,
    doubleLiked,
    handleFollow,
    onShare,
    formatDate,
    debouncedHandleLike,
    animatedBlurIntensity,
    iconAreaRef,
    index,
    currentIndex,
    isFollowed,
    memeID,
    numOfComments,
    friends,
    currentMedia,
    isDimmed,
    isCommentFeedVisible,
    toggleCommentFeed,
    user,
  }) => {
    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const isActive = index === currentIndex;

    const handleLikePress = useCallback(() => {
      debouncedHandleLike();
    }, [debouncedHandleLike]);

    const handleCommentPress = useCallback(() => {
      toggleCommentFeed();
    }, [toggleCommentFeed]);

    const handleSharePress = useCallback(() => {
      setShareModalVisible(true);
    }, []);

    const handleShareModalClose = useCallback(() => {
      setShareModalVisible(false);
    }, []);

    const handleShare = useCallback(
      async (type: ShareType, username?: string, message?: string) => {
        try {
          await onShare(type, username ?? '', message ?? '');
        } catch (error) {
          console.error('Error in handleShare:', error);
        }
      },
      [onShare],
    );

    const profilePicSource = useMemo(
      () =>
        memeUser?.profilePic
          ? { uri: memeUser.profilePic }
          : require('../../assets/images/Jestr.jpg'),
      [memeUser?.profilePic],
    );

    const animatedOpacity = useMemo(
      () =>
        Animated.subtract(
          1,
          Animated.divide(animatedBlurIntensity, 150),
        ),
      [animatedBlurIntensity],
    );

    if (!isActive) {
      return null;
    }

    return (
      <>
        <Animated.View
          style={[
            styles.blurContainer,
            { opacity: animatedOpacity },
            isDimmed && styles.dimmed,
          ]}>
          <BlurView intensity={100} tint="dark" style={styles.blurInner}>
            <View style={styles.textContainer}>
              <View style={styles.textContent}>
                <Text style={styles.username}>
                  {memeUser?.username || 'Anonymous'}
                </Text>
                {caption && (
                  <Text style={styles.caption}>{caption}</Text>
                )}
                <Text style={styles.date}>
                  {formatDate(uploadTimestamp)}
                </Text>
              </View>
            </View>

            <View ref={iconAreaRef} style={styles.iconColumn}>
              <View style={styles.profilePicContainer}>
                <Image
                  source={profilePicSource}
                  style={styles.profilePic}
                />
                {!isFollowed && (
                  <TouchableOpacity
                    onPress={handleFollow}
                    style={styles.followButton}>
                    <FontAwesomeIcon
                      icon={faPlus}
                      size={12}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <IconButton
                icon={faThumbsUp}
                count={counts.likes}
                memeID={memeID}
                onPress={handleLikePress}
                color={
                  liked || doubleLiked ? '#023020' : COLORS.primary
                }
              />
              <IconButton
                icon={faComment}
                memeID={memeID}
                count={numOfComments ?? 0}
                onPress={handleCommentPress}
              />
              <IconButton
                icon={faShare}
                memeID={memeID}
                count={counts.shares}
                onPress={handleSharePress}
              />
            </View>
            {isCommentFeedVisible && (
          <CommentFeed
            memeID={memeID}
            profilePicUrl={user?.profilePic || ''}
            user={user}
            isCommentFeedVisible={isCommentFeedVisible}
            toggleCommentFeed={toggleCommentFeed}
          />
        )}
          </BlurView>
        </Animated.View>


        <ShareModal
          visible={isShareModalVisible}
          onClose={handleShareModalClose}
          friends={friends || []}
          onShare={handleShare}
          currentMedia={currentMedia}
          user={user}
        />
      </>
    );
  },
);

export default IconsAndContent;
