import {useState, useCallback} from 'react';
import {debounce} from 'lodash';
import {Video, AVPlaybackStatus} from 'expo-av';

import {updateMemeReaction} from '../../../services/memeService';
import {handleShareMeme} from '../../../services/memeService';
import {ShareType, User} from '../../../types/types';

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
    likeStatus: {liked: boolean; doubleLiked: boolean},
    newLikeCount: number,
  ) => void;
}

export const useMediaPlayerLogic = ({
  initialLikeCount,initialDownloadCount,initialShareCount,initialCommentCount,user,memeID,
  handleDownload,onLikeStatusChange,handleSingleTap}: UseMediaPlayerLogicProps) => {
  const [liked, setLiked] = useState(false);
  const [doubleLiked, setDoubleLiked] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likePosition, setLikePosition] = useState({x: 0, y: 0});
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [friends, setFriends] = useState([]);

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

      setLiked(newLikedState);
      setDoubleLiked(newDoubleLikedState);
      setCounts(prevCounts => ({...prevCounts, likes: newLikeCount}));

      try {
        await updateMemeReaction(
          memeID,
          newLikedState,
          newDoubleLikedState,
          false,
          user.email,
        );
        onLikeStatusChange(
          memeID,
          {liked: newLikedState, doubleLiked: newDoubleLikedState},
          newLikeCount,
        );
      } catch (error) {
        console.error('Error updating meme reaction:', error);
        setLiked(!newLikedState);
        setDoubleLiked(!newDoubleLikedState);
        setCounts(prevCounts => ({...prevCounts, likes: initialLikeCount}));
      }
    }
  }, [user, liked, doubleLiked, counts.likes, memeID, onLikeStatusChange, initialLikeCount]);

  const debouncedHandleLike = useCallback(
    debounce(() => {
      handleLikePress();
    }, 300),
    [handleLikePress],
  );

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
        setToastMessage(
          newSavedState
            ? 'Meme added to your gallery!'
            : 'Meme has been removed from your gallery',
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
      }
    }
  }, [user, memeID, handleDownload, isSaved]);

  const onShare = useCallback(
    async (type: ShareType, username?: string, message?: string) => {
      if (user && type === 'friend' && username) {
        try {
          // Provide default values for username and message if they are undefined
          const validUsername = username ?? 'Anonymous';
          const validMessage = message ?? '';
  
          await handleShareMeme(
            memeID,
            user.email,
            user.username,
            validUsername,
            validMessage,
            setShowShareModal,
            setToastMessage,
          );
          setCounts(prev => ({ ...prev, shares: prev.shares + 1 }));
        } catch (error) {
          console.error('Sharing failed:', error);
          setToastMessage('Failed to share meme.');
        }
      }
    },
    [user, memeID],
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
    liked,doubleLiked,isSaved,showSaveModal,showShareModal,showToast,toastMessage,showLikeAnimation,likePosition,counts,friends,debouncedHandleLike,
    handleDownloadPress,onShare,formatDate,setShowSaveModal,setShowShareModal,handleSingleTap,setIsSaved,setCounts,handleLongPress,
  };
};