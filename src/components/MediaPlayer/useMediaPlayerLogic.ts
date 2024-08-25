import {useState, useCallback} from 'react';
import {debounce} from 'lodash';
import {Video, AVPlaybackStatus} from 'expo-av';

import {updateMemeReaction} from '../Meme/memeService';
import {handleShareMeme} from '../../services/authFunctions';
import {ShareType, User} from '../../types/types';

interface UseMediaPlayerLogicProps {
  initialLiked: boolean;
  initialDoubleLiked: boolean;
  initialLikeCount: number;
  initialDownloadCount: number;
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
  initialLikeCount,
  initialDownloadCount,
  initialShareCount,
  initialCommentCount,
  user,
  memeID,
  handleDownload,
  onLikeStatusChange,
  handleSingleTap,
}: UseMediaPlayerLogicProps) => {
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

  const [counts, setCounts] = useState({
    likes: initialLikeCount,
    downloads: initialDownloadCount,
    shares: initialShareCount,
    comments: initialCommentCount,
  });

  const [friends, setFriends] = useState([]);
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
        // Revert changes if the request fails
        setLiked(!newLikedState);
        setDoubleLiked(!newDoubleLikedState);
        setCounts(prevCounts => ({...prevCounts, likes: initialLikeCount}));
      }
    }
  }, [
    user,
    liked,
    doubleLiked,
    counts.likes,
    memeID,
    onLikeStatusChange,
    initialLikeCount,
  ]);

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
    async (type: ShareType, username: string, message: string) => {
      if (user && type === 'friend' && username) {
        try {
          await handleShareMeme(
            memeID,
            user.email,
            user.username,
            username,
            message,
            setShowShareModal,
            setToastMessage,
          );
          setCounts(prev => ({...prev, shares: prev.shares + 1}));
        } catch (error) {
          console.error('Sharing failed:', error);
          setToastMessage('Failed to share meme.');
        }
      }
    },
    [user, memeID],
  );

  return {
    liked,
    doubleLiked,
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
    setShowSaveModal,
    setShowShareModal,
    handleSingleTap,
    handleLongPress,
  };
};
