// src/hooks/useMediaPlayerLogic.ts

import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { Video, AVPlaybackStatus } from 'expo-av';

import { useUpdateMemeReaction, useShareMeme, updateMemeReaction } from '../../../services/reactionServices';
import { ShareType, User } from '../../../types/types';
import { useBadgeStore } from '../../../stores/badgeStore';
import Toast from 'react-native-toast-message';
import { formatDate } from '../../../utils/dateUtils';

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
  handleDownload,
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
    console.log('handleLikePress triggered');
    console.log('Initial liked state:', liked, 'Initial doubleLiked state:', doubleLiked);
    
    if (!user) return;
  
    const newLikedState = !liked;
    let newDoubleLikedState = doubleLiked;
    let newLikeCount = typeof counts.likes === 'string' ? parseInt(counts.likes, 10) : counts.likes;
  
    console.log('New liked state:', newLikedState, 'New doubleLiked state:', newDoubleLikedState);
  
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
      console.log('Updating meme reaction', { memeID, newLikedState, newDoubleLikedState });
      const result = await updateMemeReactionMutation.mutateAsync({
        memeID,
        incrementLikes: newLikedState,
        doubleLike: newDoubleLikedState,
        incrementDownloads: false,
        email: user.email,
      });
      console.log('Meme reaction update result:', result);
  
      if (result && result.badgeEarned) {
        badgeStore.earnBadge(result.badgeEarned);
      }
  
      onLikeStatusChange(
        memeID,
        { liked: newLikedState, doubleLiked: newDoubleLikedState },
        newLikeCount,
      );
    } catch (error) {
      console.error('Error updating meme reaction:', error);
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

  const onShare = useCallback(
    async (type: ShareType, username?: string, message?: string) => {
      console.log('onShare triggered');
      console.log('Share details:', { type, username, message });
  
      if (user && type === 'friend' && username) {
        try {
          console.log('Sharing meme with', { memeID, username });
          const result = await shareMemeMutation.mutateAsync({
            memeID,
            email: user.email,
            username: user.username,
            catchUser: username,
            message: message || '',
          });
          console.log('Meme share result:', result);
  
          setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
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
  
  const handleDownloadPress = useCallback(async () => {
    console.log('handleDownloadPress triggered');
    console.log('Initial saved state:', isSaved);
  
    if (user) {
      try {
        const newSavedState = !isSaved;
        console.log('Updating download state to:', newSavedState);
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
          badgeStore.incrementDownloadCount(user.email);
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
