import {useState, useEffect, useCallback, useRef} from 'react';
import {useUserStore, UserState} from '../../../stores/userStore';
import {useProfileHandlers} from './ProfileHandlers';
import {User, Meme} from '../../../types/types';
import {getDaysSinceCreation} from '../../../utils/dateUtils';
import * as Haptics from 'expo-haptics';
import {AppNavProp} from '../../../navigation/NavTypes/RootNavTypes';

export type TabName = 'posts' | 'liked' | 'history' | 'downloaded';

export const useProfileLogic = (
  // route: ProfileScreenRouteProp,
  navigation: AppNavProp,
) => {
  const user = useUserStore(state => state);
  const followersCount = useUserStore(state => state.followersCount);
  const followingCount = useUserStore(state => state.followingCount);
  const [daysSinceCreation, setDaysSinceCreation] = useState(
    getDaysSinceCreation(user.creationDate || ''),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<TabName>('posts');
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});
  const [tabMemes, setTabMemes] = useState<Meme[]>([]);
  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<
    'followers' | 'following'
  >('followers');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const memesFetchedRef = useRef<{[key in TabName]: boolean}>({
    posts: false,
    liked: false,
    history: false,
    downloaded: false,
  });

  const {
    handleEditImagePress,
    handleBioUpdate,
    handleHeightChange,
    loadMoreMemes,
    fetchTabMemes,
    handleMemePress,
    handleDeleteMeme,
    handleShareProfile,
    handleRemoveDownloadedMeme,
  } = useProfileHandlers(
    user,
    setTabMemes,
    navigation,
    setIsLoading,
    setLastEvaluatedKey,
    setHasMoreMemes,
    setSelectedMeme,
    setCurrentMemeIndex,
    setIsCommentFeedVisible,
  );

  // useEffect(() => {
  //   const routeUser = route.params.user;
  //   if (routeUser) {
  //     useUserStore.getState().setUserDetails(routeUser);
  //   }
  // }, [route.params.user]);

  useEffect(() => {
    const calculatedDaysSinceCreation = getDaysSinceCreation(
      user.creationDate || user.CreationDate || '',
    );
    setDaysSinceCreation(calculatedDaysSinceCreation);
  }, [user]);

  useEffect(() => {
    if (user.email && !memesFetchedRef.current[selectedTab] && !isLoading) {
      fetchTabMemes(selectedTab);
      memesFetchedRef.current[selectedTab] = true;
    }
  }, [user.email, selectedTab, isLoading, fetchTabMemes]);

  const handleTabSelect = useCallback((tabName: TabName) => {
    setSelectedTab(tabName);
    setTabMemes([]);
    setLastEvaluatedKey(null);
    memesFetchedRef.current[tabName] = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const openFollowModal = useCallback((tab: 'followers' | 'following') => {
    setFollowModalTab(tab);
    setIsFollowModalVisible(true);
  }, []);

  const handleImagePress = useCallback(
    (type: 'profile' | 'header') => {
      const imageUri =
        type === 'profile' ? user?.profilePic || '' : user?.headerPic || '';
      const finalImageUri: string | null =
        typeof imageUri === 'string' ? imageUri : null;
      setFullScreenImage(finalImageUri);
      setIsBlurVisible(true);
    },
    [user],
  );

  const convertUserStateToUser = useCallback(
    (userState: UserState): User => ({
      ...userState,
      profilePic:
        typeof userState.profilePic === 'string' ? userState.profilePic : '',
      headerPic:
        typeof userState.headerPic === 'string' ? userState.headerPic : '',
      CreationDate: userState.CreationDate || userState.creationDate || '',
    }),
    [],
  );

  return {
    user,
    followersCount,
    followingCount,
    daysSinceCreation,
    isLoading,
    selectedTab,
    thumbnails,
    tabMemes,
    isFollowModalVisible,
    followModalTab,
    selectedMeme,
    currentMemeIndex,
    isCommentFeedVisible,
    lastEvaluatedKey,
    isEditProfileModalVisible,
    fullScreenImage,
    isBlurVisible,
    hasMoreMemes,
    isUploading,
    handleEditImagePress,
    handleBioUpdate,
    handleHeightChange,
    loadMoreMemes,
    fetchTabMemes,
    handleMemePress,
    handleDeleteMeme,
    handleShareProfile,
    handleRemoveDownloadedMeme,
    handleTabSelect,
    openFollowModal,
    handleImagePress,
    convertUserStateToUser,
    setIsFollowModalVisible,
    setIsEditProfileModalVisible,
    setFullScreenImage,
    setIsBlurVisible,
    setSelectedMeme,
    setIsCommentFeedVisible,
    setCurrentMemeIndex,
  };
};
