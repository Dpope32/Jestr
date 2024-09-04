import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {View,Text,Image,TouchableOpacity,Modal,Dimensions,ActivityIndicator,Alert,StyleSheet,ScrollView,Animated, ToastAndroid, Clipboard } from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faBox,faHistory,faHeart,faUser,faEdit,faTimes,IconDefinition,faSadTear,faCog,faShare } from '@fortawesome/free-solid-svg-icons';
import {RouteProp} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {StackNavigationProp} from '@react-navigation/stack';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as Haptics from 'expo-haptics';
import {BlurView} from 'expo-blur';
import {useUserStore, UserState} from '../../utils/userStore';
import {RootStackParamList} from '../../types/types';
import styles from './ProfileStyles';
import MemeGrid from './MemeGrid';
import EditableBio from './EditableBio';
import {useTheme} from '../../theme/ThemeContext';
import {COLORS} from '../../theme/theme';
import {getDaysSinceCreation} from 'utils/dateUtils';
import {User, Meme} from '../../types/types';
import {useProfileHandlers} from './ProfileHandlers';
import BottomPanel from '../../components/Panels/BottomPanel';
import FollowModal from '../../components/Modals/FollowModal';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import EditProfileModal from '../../components/Modals/EditProfileModal';

const {width, height} = Dimensions.get('window');
const itemSize = width / 3 - 4; 

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList,'Profile'>;
type ProfileProps = {route: ProfileScreenRouteProp; navigation: ProfileScreenNavigationProp;};

export type TabName = 'posts' | 'liked' | 'history' | 'downloaded';

const Profile: React.FC<ProfileProps> = React.memo(({route, navigation}) => {
  //console.log('Profile component rendering');
  const { isDarkMode } = useTheme();
  const routeUser = route.params.user;
  const user = useUserStore(state => state);
  const {absoluteFill} = StyleSheet;
  const scrollY = new Animated.Value(0);
  const followersCount = useUserStore(state => state.followersCount);
  const followingCount = useUserStore(state => state.followingCount);
  const [daysSinceCreation, setDaysSinceCreation] = useState(getDaysSinceCreation(user.creationDate || ''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<TabName>('posts');
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});
  const [tabMemes, setTabMemes] = useState<Meme[]>([]);
  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
    const memesFetchedRef = useRef<{[key in TabName]: boolean}>({
      posts: false,
      liked: false,
      history: false,
      downloaded: false,
    });
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0],
    extrapolate: 'clamp',
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
    handleSettingsClick,
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

  useEffect(() => {
    if (routeUser) {
      useUserStore.getState().setUserDetails(routeUser);
    }
  }, [routeUser]);

  useEffect(() => {
    const calculatedDaysSinceCreation = getDaysSinceCreation(
      user.creationDate || user.CreationDate || '',
    );
    setDaysSinceCreation(calculatedDaysSinceCreation);
  }, [user]);

  useEffect(() => {
    console.log('Effect triggered. State:', { 
      userEmail: user.email, 
      tabMemesLength: tabMemes.length, 
      isLoading, 
      selectedTab,
      memesFetched: memesFetchedRef.current[selectedTab]
    });
    if (user.email && !memesFetchedRef.current[selectedTab] && !isLoading) {
      console.log('Fetching tab memes...');
      fetchTabMemes(selectedTab);
      memesFetchedRef.current[selectedTab] = true;
    }
  }, [user.email, selectedTab, isLoading, fetchTabMemes]);

  const handleTabSelect = useCallback((tabName: TabName) => {
    setSelectedTab(tabName);
    setTabMemes([]);
    setLastEvaluatedKey(null);
    memesFetchedRef.current[tabName] = false;  // Reset the fetched flag for the new tab
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const openFollowModal = (tab: 'followers' | 'following') => {
    setFollowModalTab(tab);
    setIsFollowModalVisible(true);
  };

  const handleImagePress = useCallback((type: 'profile' | 'header') => {
    const imageUri =
      type === 'profile' ? user?.profilePic || '' : user?.headerPic || '';
    const finalImageUri: string | null =
      typeof imageUri === 'string' ? imageUri : null;
    setFullScreenImage(finalImageUri);
    setIsBlurVisible(true);
  }, [user]);

  const renderTabButton = useCallback((
    tabName: TabName,
    icon: IconDefinition,
    label: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tabName && styles.activeTabButton,
      ]}
      onPress={() => handleTabSelect(tabName)}>
      <FontAwesomeIcon
        icon={icon}
        color={
          selectedTab === tabName
            ? styles.activeTabIcon.color
            : styles.tabIcon.color
        }
        size={24}
      />
      <Text
        style={[
          styles.tabLabel,
          selectedTab === tabName && styles.activeTabLabel,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [selectedTab, handleTabSelect]);

  const convertUserStateToUser = useCallback((userState: UserState): User => ({
    ...userState,
    profilePic:
      typeof userState.profilePic === 'string' ? userState.profilePic : '',
    headerPic:
      typeof userState.headerPic === 'string' ? userState.headerPic : '',
    CreationDate: userState.CreationDate || userState.creationDate || '',
  }), []);

  const renderTabContent = useMemo(() => {
    if (isLoading) {
      return (
        <BlurView
          intensity={90}
          style={{
            position: 'absolute',
            top: 20,
            bottom: 0,
            left: 0,
            right: 0,
            width,
            height,
          }}>
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </BlurView>
      );
    }

    if (tabMemes.length === 0) {
      let message = '';
      switch (selectedTab) {
        case 'posts':
          message = `${user?.username || 'User'} has not posted any memes`;
          break;
        case 'downloaded':
          message = `${user?.username || 'User'} has not downloaded any memes`;
          break;
        case 'history':
          message = `${user?.username || 'User'} has not viewed any memes`;
          break;
        case 'liked':
          message = `${user?.username || 'User'} has not liked any memes`;
          break;
      }
      return (
        <View style={styles.noMemesContainer}>
          <FontAwesomeIcon icon={faSadTear} size={50} color="#1bd40b" />
          <Text style={styles.noMemesText}>{message}</Text>
        </View>
      );
    }

    const renderMeme = (item: Meme, index: number) => {
      const source =
        item.mediaType === 'video' && thumbnails[item.memeID]
          ? {uri: thumbnails[item.memeID]}
          : {uri: item.url};
      return (
        <TouchableOpacity
          key={item.memeID}
          style={styles.memeContainer}
          onPress={() => handleMemePress(item, index)}>
          <Image source={source} style={styles.memeImage} resizeMode="cover" />
        </TouchableOpacity>
      );
    };

    return (
      <MemeGrid
        memes={tabMemes}
        renderMeme={renderMeme}
        onLoadMore={loadMoreMemes}
        onHeightChange={handleHeightChange}
        isLoading={isLoading}
        onDeleteMeme={handleDeleteMeme}
        onRemoveDownloadedMeme={handleRemoveDownloadedMeme}
        selectedTab={selectedTab}
        itemSize={itemSize}
      />
    );
  }, [isLoading, tabMemes, selectedTab, user, thumbnails, handleMemePress, loadMoreMemes, handleHeightChange, handleDeleteMeme, handleRemoveDownloadedMeme]);

  if (!user) return <ActivityIndicator />;

  return (
    <ScrollView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000' : '#1C1C1C'},
      ]}>
        {isUploading && <ActivityIndicator size="large" color="#00ff00" />}
      <ScrollView>
        <Animated.View style={[styles.headerContainer, {height: headerHeight}]}>
          <TouchableOpacity onPress={() => handleImagePress('header')}>
            <Image
              source={{
                uri:
                  typeof user.headerPic === 'string'
                    ? user.headerPic
                    : undefined,
              }}
              style={styles.headerImage}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleImagePress('profile')}>
            <Image
              source={{
                uri:
                  typeof user.profilePic === 'string'
                    ? user.profilePic
                    : undefined,
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            style={styles.editContainer}
            onPress={() => setIsEditProfileModalVisible(true)}>
            <FontAwesomeIcon icon={faEdit} size={24} color="#1bd40b" />
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareIcon} onPress={handleShareProfile}>
          <FontAwesomeIcon icon={faShare} size={24} color="#1bd40b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsIcon} onPress={handleSettingsClick}>
          <FontAwesomeIcon icon={faCog} size={24} color="#1bd40b" />
        </TouchableOpacity>
          <Text style={styles.displayName}>{user?.displayName || 'Anon'}</Text>
          <Text style={styles.username}>@{user?.username || 'Username'}</Text>
          <View
            style={[
              styles.bioWrapper,
              {alignItems: 'center', justifyContent: 'center'},
            ]}>
            <EditableBio
              initialBio={user?.bio || 'No bio available'}
              userEmail={user?.email || ''}
              onBioUpdate={handleBioUpdate}
              editable={false}
            />
          </View>
        </View>
        <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => openFollowModal('followers')}
        >
          <Text style={styles.statCount}>{followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>

        <View style={styles.jestrForContainer}>
          <Text style={styles.jestrFor}>Jestr for</Text>
          <Text style={styles.jestrForDays}>{daysSinceCreation} days</Text>
        </View>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => openFollowModal('following')}
        >
          <Text style={styles.statCount}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>
        <View style={styles.tabContainer}>
          {renderTabButton('posts', faUser, 'Posts')}
          {renderTabButton('downloaded', faBox, 'Gallery')}
          {renderTabButton('history', faHistory, 'History')}
          {renderTabButton('liked', faHeart, 'Likes')}
        </View>
 <View style={styles.memeGridContainer}>{renderTabContent}</View>
      </ScrollView>
      <BottomPanel
        onHomeClick={() => navigation.navigate('Feed' as never)}
        handleLike={() => {}}
        handleDislike={() => {}}
        likedIndices={new Set()}
        dislikedIndices={new Set()}
        likeDislikeCounts={{}}
        currentMediaIndex={0}
        toggleCommentFeed={() => {}}
        user={user}
      />
      <FollowModal
        visible={isFollowModalVisible}
        onClose={() => setIsFollowModalVisible(false)}
        userId={user?.email ?? ''}
        initialTab={followModalTab}
      />

{selectedMeme && (
  <Modal
    visible={!!selectedMeme}
    transparent={true}
    onRequestClose={() => setSelectedMeme(null)}>
    <View style={styles.modalContainer}>
      <MediaPlayer
        memeUser={{
          email: selectedMeme.email,
          username: selectedMeme.username,
          profilePic: selectedMeme.profilePicUrl,
          displayName: selectedMeme.username, 
        }}
        mediaType={selectedMeme.mediaType}
        currentMedia={selectedMeme.url}
        prevMedia={
          currentMemeIndex > 0 ? tabMemes[currentMemeIndex - 1].url : null
        }
        nextMedia={
          currentMemeIndex < tabMemes.length - 1
            ? tabMemes[currentMemeIndex + 1].url
            : null
        }
        username={selectedMeme.username}
        caption={selectedMeme.caption}
        uploadTimestamp={selectedMeme.uploadTimestamp}
        handleLike={() => {}}
        handleDownload={() => {}}
        toggleCommentFeed={() =>
          setIsCommentFeedVisible(!isCommentFeedVisible)
        }
        goToPrevMedia={() => {
          if (currentMemeIndex > 0) {
            setCurrentMemeIndex(currentMemeIndex - 1);
            setSelectedMeme(tabMemes[currentMemeIndex - 1]);
          }
        }}
        goToNextMedia={() => {
          if (currentMemeIndex < tabMemes.length - 1) {
            setCurrentMemeIndex(currentMemeIndex + 1);
            setSelectedMeme(tabMemes[currentMemeIndex + 1]);
          }
        }}
        memes={tabMemes}
        likedIndices={new Set(tabMemes.filter(meme => meme.liked).map(meme => tabMemes.indexOf(meme)))}
        doubleLikedIndices={new Set(tabMemes.filter(meme => meme.doubleLiked).map(meme => tabMemes.indexOf(meme)))}
        downloadedIndices={new Set(tabMemes.filter(meme => meme.downloaded).map(meme => tabMemes.indexOf(meme)))}
        likeDislikeCounts={{
          [currentMemeIndex]: {
            likeCount: selectedMeme.likeCount,
            dislikeCount: 0, 
          }
        }}
        currentMediaIndex={currentMemeIndex}
        user={convertUserStateToUser(user)}
        likeCount={selectedMeme.likeCount}
        downloadCount={selectedMeme.downloadCount}
        commentCount={selectedMeme.commentCount}
        shareCount={selectedMeme.shareCount}
        profilePicUrl={selectedMeme.profilePicUrl}
        memeID={selectedMeme.memeID}
        index={currentMemeIndex}
        currentIndex={currentMemeIndex}
        setCurrentIndex={setCurrentMemeIndex}
        initialLikeStatus={{
          liked: selectedMeme.liked || false,
          doubleLiked: selectedMeme.doubleLiked || false
        }}
        onLikeStatusChange={(memeID, status, newLikeCount) => {}}
        liked={selectedMeme.liked || false}
        doubleLiked={selectedMeme.doubleLiked || false}
        isDarkMode={isDarkMode}
        onLongPressStart={() => {}}
        onLongPressEnd={() => {}}
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={false}
      />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMeme(null)}>
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
            {selectedTab === 'posts' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMeme(selectedMeme.memeID)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
            {selectedTab === 'downloaded' && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveDownloadedMeme(selectedMeme.memeID)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}

      {isEditProfileModalVisible && (
        <EditProfileModal
          isVisible={isEditProfileModalVisible}
          onClose={() => setIsEditProfileModalVisible(false)}
          user={convertUserStateToUser(user)}
          onUpdateUser={updatedUser => {
            const updatedUserState: Partial<UserState> = {
              ...updatedUser,
              profilePic: updatedUser.profilePic || null,
              headerPic: updatedUser.headerPic || null,
            };
            useUserStore.getState().setUserDetails(updatedUserState);
          }}
        />
      )}
      {fullScreenImage && (
        <Modal
          visible={!!fullScreenImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setFullScreenImage(null);
            setIsBlurVisible(false);
          }}>
          <BlurView
            intensity={100}
            tint="dark"
            style={[absoluteFill, {width: '100%', height: '100%'}]}>
            <View style={styles.fullScreenContainer}>
              <Image
                source={{uri: fullScreenImage}}
                style={[
                  fullScreenImage === (user?.profilePic || '')
                    ? styles.fullScreenProfileImage
                    : styles.fullScreenHeaderImage,
                  {zIndex: 1},
                ]}
              />
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonOverlay]}
                onPress={() =>
                  handleEditImagePress(
                    fullScreenImage === (user?.profilePic || '')
                      ? 'profile'
                      : 'header',
                  )
                }>
                <FontAwesomeIcon icon={faEdit} size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setFullScreenImage(null);
                  setIsBlurVisible(false);
                }}>
                <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Modal>
      )}
    </ScrollView>
  );
});

export default Profile;
