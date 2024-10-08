// src/hooks/useMediaPlayerLogic.ts

import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { Video, AVPlaybackStatus } from 'expo-av';

import { useUpdateMemeReaction, useShareMeme, updateMemeReaction } from '../../../services/reactionServices';
import { ShareType, User } from '../../../types/types';
import { useBadgeStore } from '../../../stores/badgeStore';
import Toast from 'react-native-toast-message';

interface UseMediaPlayerLogicProps {
  initialLiked: boolean;
  initialDoubleLiked: boolean;
  mediaType: 'image' | 'video';
  initialLikeCount: number;
  initialDownloadCount: number;
  initialShareCount: number;
  initialCommentCount: number;
  video: React.RefObject<Video>;
  status: AVPlaybackStatus;
  user: User | null;
  memeID: string;
  handleDownload: () => void;
  handleSingleTap: () => void;
  onLikeStatusChange: (
    memeId: string,
    likeStatus: { liked: boolean; doubleLiked: boolean },
    newLikeCount: number,
  ) => void;
}

export const useMediaPlayerLogic = ({
  initialLiked,
  initialDoubleLiked,
  initialLikeCount,
  initialDownloadCount,
  initialShareCount,
  initialCommentCount,
  user,
  memeID,
  mediaType,
  video,
  status,
  handleDownload,
  handleSingleTap,
  onLikeStatusChange,
}: UseMediaPlayerLogicProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [doubleLiked, setDoubleLiked] = useState(initialDoubleLiked);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likePosition, setLikePosition] = useState({ x: 0, y: 0 });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [friends, setFriends] = useState([]);
  const badgeStore = useBadgeStore();

  const [counts, setCounts] = useState({
    likes: initialLikeCount,
    downloads: initialDownloadCount,
    shares: initialShareCount,
    comments: initialCommentCount,
  });

  const handleLongPress = () => {
    console.log('longpress pressed');
    setModalVisible(true);
  };

  const updateMemeReactionMutation = useUpdateMemeReaction();
  const shareMemeMutation = useShareMeme();
  
  // Handle Like Press
  const handleLikePress = useCallback(async () => {
    if (!user) return;

    const newLikedState = !liked;
    let newDoubleLikedState = doubleLiked;
    let newLikeCount = typeof counts.likes === 'string' ? parseInt(counts.likes, 10) : counts.likes;

    if (newLikedState) {
      if (doubleLiked) {
        newDoubleLikedState = false;
        newLikeCount -= 1;
      } else {
        newLikeCount += 1;
      }
    } else {
      newDoubleLikedState = false;
      newLikeCount -= 1;
    }

    setLiked(newLikedState);
    setDoubleLiked(newDoubleLikedState);
    setCounts(prevCounts => ({ ...prevCounts, likes: newLikeCount }));

    try {
      const result = await updateMemeReactionMutation.mutateAsync({
        memeID,
        incrementLikes: newLikedState,
        doubleLike: newDoubleLikedState,
        incrementDownloads: false,
        email: user.email,
      });

      if (result && result.badgeEarned) {
        badgeStore.earnBadge(result.badgeEarned);
        Toast.show({
          type: 'success',
          text1: 'Congratulations!',
          text2: `You earned the ${result.badgeEarned.title} badge!`,
          position: 'top',
          visibilityTime: 4000,
        });
      }

      onLikeStatusChange(
        memeID,
        { liked: newLikedState, doubleLiked: newDoubleLikedState },
        newLikeCount,
      );

    } catch (error) {
      console.error('Error updating meme reaction:', error);
      // Revert the state changes
      setLiked(!newLikedState);
      setDoubleLiked(!newDoubleLikedState);
      setCounts(prevCounts => ({ ...prevCounts, likes: initialLikeCount }));
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update like status. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  }, [user, liked, doubleLiked, counts.likes, memeID, updateMemeReactionMutation]);

  // Handle Share
  const onShare = useCallback(
    async (type: ShareType, username?: string, message?: string) => {
      if (user && type === 'friend' && username) {
        try {
          const result = await shareMemeMutation.mutateAsync({
            memeID,
            email: user.email,
            username: user.username,
            catchUser: username,
            message: message || '',
          });

          setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));

          // Check for ViralSensation badge
          await badgeStore.checkViralSensationBadge(user.email);

          Toast.show({
            type: 'success',
            text1: 'Meme Shared!',
            text2: 'Your meme has been shared successfully.',
            position: 'top',
            visibilityTime: 3000,
          });
        } catch (error) {
          console.error('Sharing failed:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to share meme.',
            position: 'top',
            visibilityTime: 3000,
          });
        }
      }
    },
    [user, memeID, shareMemeMutation, badgeStore]
  );

  // Handle Download Press
  const handleDownloadPress = useCallback(async () => {
    if (user) {
      try {
        const newSavedState = !isSaved;
        await updateMemeReaction(
          memeID,
          false,
          false,
          newSavedState,
          user.email,
        );
        handleDownload();
        setIsSaved(newSavedState);
        setCounts(prev => ({
          ...prev,
          downloads: prev.downloads + (newSavedState ? 1 : -1),
        }));

        if (newSavedState) {
          badgeStore.incrementDownloadCount();
        } else {
          badgeStore.decrementDownloadCount();
        }

        setToastMessage(
          newSavedState
            ? 'Meme added to your gallery!'
            : 'Meme has been removed from your gallery',
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);

        // Check for MemeCollector badge
        await badgeStore.checkMemeCollectorBadge(user.email);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update download status. Please try again.',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    }
  }, [
    user,
    memeID,
    handleDownload,
    isSaved,
    badgeStore,
  ]);

  const debouncedHandleLike = useCallback(
    debounce(() => {
      handleLikePress();
    }, 300),
    [handleLikePress],
  );

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return `Yesterday`;
    } else {
      return `${diffDays} days ago`;
    }
  }, []);

  return {
    liked,
    doubleLiked,
    isSaved,
    showSaveModal,
    showShareModal,
    showToast,
    toastMessage,
    showLikeAnimation,
    likePosition,
    counts,
    friends,
    debouncedHandleLike,
    handleDownloadPress,
    onShare,
    formatDate,
    setShowSaveModal,
    setShowShareModal,
    setIsSaved,
    setCounts,
    handleLongPress,
  };
};
