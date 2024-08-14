import { useState, useCallback, useEffect } from 'react';
import { GestureResponderEvent } from 'react-native';
import { debounce } from 'lodash';
import { updateMemeReaction, getLikeStatus } from '../Meme/memeService';
import { handleShareMeme } from '../../services/authFunctions';
import { ShareType, User } from '../../types/types';
import { Video, AVPlaybackStatus } from 'expo-av';

interface UseMediaPlayerLogicProps {
  initialLiked: boolean;
  initialDoubleLiked: boolean;
  mediaType: 'image' | 'video';
  initialLikeCount: number;
  initialDownloadCount: number;
  video: React.RefObject<Video>;
  status: AVPlaybackStatus;
  initialShareCount: number;
  initialCommentCount: number;
  user: User | null;
  memeID: string;
  handleDownload: () => void;
  handleSingleTap: () => void;
  onLikeStatusChange: (
    memeId: string,
    likeStatus: { liked: boolean; doubleLiked: boolean },
    newLikeCount: number
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
  mediaType,
  video,
  status,
  handleSingleTap,
}: UseMediaPlayerLogicProps) => {
  const [liked, setLiked] = useState(initialLiked);
  const [doubleLiked, setDoubleLiked] = useState(initialDoubleLiked);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likePosition, setLikePosition] = useState({ x: 0, y: 0 });
  const [counts, setCounts] = useState({
    likes: initialLikeCount,
    downloads: initialDownloadCount,
    shares: initialShareCount,
    comments: initialCommentCount,
  });
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && user.email) {
        try {
          const result = await getLikeStatus(memeID, user.email);
          if (result) {
            setLiked(result.liked);
            setDoubleLiked(result.doubleLiked);
          }
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };
    checkLikeStatus();
  }, [memeID, user]);

  const handleLikePress = useCallback(async () => {
    if (user) {
      const newLikedState = !liked;
      let newDoubleLikedState = doubleLiked;
      let newLikeCount = counts.likes;
  
      if (newLikedState) {
        if (doubleLiked) {
          newDoubleLikedState = false;
          newLikeCount -= 1;
        } else {
          newLikeCount += 1;
        }
      } else {
        newLikeCount -= 1;
      }
  
      // Update only if there's a change to reduce unnecessary renders
      if (newLikedState !== liked || newDoubleLikedState !== doubleLiked) {
        setLiked(newLikedState);
        setDoubleLiked(newDoubleLikedState);
        setCounts(prevCounts => ({ ...prevCounts, likes: newLikeCount }));
      }
  
      try {
        await updateMemeReaction(memeID, newLikedState, newDoubleLikedState, false, user.email);
        onLikeStatusChange(memeID, { liked: newLikedState, doubleLiked: newDoubleLikedState }, newLikeCount);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
        // Revert changes if the request fails
        setLiked(initialLiked);
        setDoubleLiked(initialDoubleLiked);
        setCounts(prevCounts => ({ ...prevCounts, likes: initialLikeCount }));
      }
    }
  }, [user, liked, doubleLiked, counts.likes, memeID, onLikeStatusChange, initialLiked, initialDoubleLiked, initialLikeCount]);

  
  const debouncedHandleLike = useCallback(
    debounce(() => {
      handleLikePress();
    }, 300),
    [handleLikePress]
  );

  const handleDoubleTap = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    
    // Adjust these values as needed
    setLikePosition({ 
      x: pageX  - 100, // Adjust to -10 instead of -50 for finer control
      y: pageY  -200  // Adjust to -100 instead of -50 for finer control
    }); 
    
    setShowLikeAnimation(true);
    debouncedHandleLike();
  
    setTimeout(() => {
      setShowLikeAnimation(false);
    }, 1000); // Hide the animation after 1 second
  }, [debouncedHandleLike]);

  const handleDownloadPress = useCallback(async () => {
    if (user) {
      try {
        const newSavedState = !isSaved;
        await updateMemeReaction(memeID, false, false, newSavedState, user.email);
        handleDownload();
        setIsSaved(newSavedState);
        setCounts(prev => ({ ...prev, downloads: prev.downloads + (newSavedState ? 1 : -1) }));
        setToastMessage(newSavedState ? 'Meme added to your gallery!' : 'Meme has been removed from your gallery');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
      }
    }
  }, [user, memeID, handleDownload, isSaved]);

  const onShare = useCallback(async (type: ShareType, username: string, message: string) => {
    if (user && type === 'friend' && username) {
      try {
        await handleShareMeme(memeID, user.email, user.username, username, message, setShowShareModal, setToastMessage);
        setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
      } catch (error) {
        console.error('Sharing failed:', error);
        setToastMessage('Failed to share meme.');
      }
    }
  }, [user, memeID]);

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
    handleDoubleTap,
    debouncedHandleLike,
    handleDownloadPress,
    onShare,
    formatDate,
    setShowSaveModal,
    setShowShareModal,
    handleSingleTap,
  };
};
