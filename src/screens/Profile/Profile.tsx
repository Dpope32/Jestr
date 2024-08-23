import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faBox,
  faHistory,
  faHeart,
  faUser,
  faEdit,
  faTimes,
  IconDefinition,
  faSadTear,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import * as VideoThumbnails from 'expo-video-thumbnails';
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
const itemSize = width / 3 - 4; // 3 items per row with 2px margin on each side

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;

type ProfileProps = {
  route: ProfileScreenRouteProp;
  navigation: ProfileScreenNavigationProp;
};

export type TabName = 'posts' | 'liked' | 'history' | 'downloaded';

const Profile: React.FC<ProfileProps> = React.memo(({route, navigation}) => {
  const {isDarkMode} = useTheme();
  const user = useUserStore(state => state);
  const {absoluteFill} = StyleSheet;
  const scrollY = new Animated.Value(0);

  // const [gridHeight, setGridHeight] = useState(300);
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
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  // const [contentHeight, setContentHeight] = useState(height);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0],
    extrapolate: 'clamp',
  });

  const {
    // handleUpdateImage,
    handleEditImagePress,
    // onLikeStatusChange,
    handleBioUpdate,
    handleHeightChange,
    // handleCloseMediaPlayer,
    loadMoreMemes,
    fetchTabMemes,
    handleMemePress,
    handleDeleteMeme,
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

  console.log('Profile screen rendered');
  // console.log('User:', user);
  // console.log('useUserStore.getState(): ===>', useUserStore.getState());

  useEffect(() => {
    if (route.params?.user) {
      useUserStore.getState().setUserDetails(route.params.user);
    }
  }, [route.params?.user]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     // console.log('Profile screen focused');
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    tabMemes.forEach(async (meme: Meme) => {
      if (meme.mediaType === 'video' && !thumbnails[meme.memeID]) {
        try {
          const {uri} = await VideoThumbnails.getThumbnailAsync(meme.url);
          setThumbnails(prev => ({...prev, [meme.memeID]: uri}));
        } catch (e) {
          console.warn("Couldn't generate thumbnail", e);
        }
      }
    });
  }, [tabMemes]);

  const handleImagePress = (type: 'profile' | 'header') => {
    const imageUri =
      type === 'profile' ? user?.profilePic || '' : user?.headerPic || '';
    const finalImageUri: string | null =
      typeof imageUri === 'string' ? imageUri : null;
    console.log('Image Pressed:', type, finalImageUri);
    setFullScreenImage(finalImageUri);
    setIsBlurVisible(true);
  };

  useEffect(() => {
    setDaysSinceCreation(getDaysSinceCreation(user.CreationDate || ''));
    const calculatedDaysSinceCreation = getDaysSinceCreation(
      user.creationDate || user.CreationDate || '',
    );
    setDaysSinceCreation(calculatedDaysSinceCreation);
  }, [user]);

  useEffect(() => {
    if (user.email) {
      setTabMemes([]); // Clear previous memes
      setLastEvaluatedKey(null);
      setCurrentPage(1);
      fetchTabMemes(selectedTab);
    } else {
      console.log('No user data available');
    }
  }, [user, selectedTab]);

  const renderTabButton = (
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
  );

  const handleTabSelect = (tabName: TabName) => {
    setSelectedTab(tabName); // Update the selected tab state
    setTabMemes([]); // Clear previous tab memes
    setLastEvaluatedKey(null); // Reset lastEvaluatedKey
    fetchTabMemes(tabName); // Fetch new tab memes
  };

  const convertUserStateToUser = (userState: UserState): User => ({
    ...userState,
    profilePic:
      typeof userState.profilePic === 'string' ? userState.profilePic : '',
    headerPic:
      typeof userState.headerPic === 'string' ? userState.headerPic : '',
    CreationDate: userState.CreationDate || userState.creationDate || '',
  });

  // const handleContentSizeChange = (width: number, newHeight: number) => {
  //   setContentHeight(Math.max(height, newHeight));
  // };

  const renderTabContent = () => {
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
  };
  if (!user) return <ActivityIndicator />;

  return (
    <ScrollView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000' : '#1C1C1C'},
      ]}>
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
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Text style={styles.displayName}>{user?.displayName || 'Anon'}</Text>
          <Text style={styles.username}>@{user?.username || 'Username'}</Text>
          <View
            style={[
              styles.bioWrapper,
              {alignItems: 'flex-start', justifyContent: 'flex-start'},
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
          <View style={styles.followInfo}>
            <TouchableOpacity
              style={styles.followInfo}
              onPress={() => {
                setFollowModalTab('followers');
                setIsFollowModalVisible(true);
              }}>
              <Text style={styles.followCount}>{followersCount || 0}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.jestrForContainer}>
            <Text style={styles.jestrFor}>Jestr for</Text>
            <Text style={styles.jestrForDays}>{daysSinceCreation} days</Text>
          </View>
          <View style={styles.followInfo}>
            <TouchableOpacity
              style={styles.followInfo}
              onPress={() => {
                setFollowModalTab('following');
                setIsFollowModalVisible(true);
              }}>
              <Text style={styles.followCount}>{followingCount || 0}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tabContainer}>
          {renderTabButton('posts', faUser, 'Posts')}
          {renderTabButton('downloaded', faBox, 'Gallery')}
          {renderTabButton('history', faHistory, 'History')}
          {renderTabButton('liked', faHeart, 'Likes')}
        </View>
        <View style={styles.memeGridContainer}>{renderTabContent()}</View>
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
        initialTab={followModalTab as 'followers' | 'following'}
      />

      {selectedMeme && (
        <Modal
          visible={!!selectedMeme}
          transparent={true}
          onRequestClose={() => setSelectedMeme(null)}>
          <View style={styles.modalContainer}>
            <MediaPlayer
              memeUser={selectedMeme?.memeUser || {}}
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
              memes={tabMemes} // Pass the memes array
              likedIndices={new Set()} // Replace with actual liked indices
              doubleLikedIndices={new Set()} // Replace with actual double liked indices
              downloadedIndices={new Set()} // Replace with actual downloaded indices
              likeDislikeCounts={{}} // Replace with actual like/dislike counts
              currentMediaIndex={currentMemeIndex} // Current index in the memes array
              user={convertUserStateToUser(user)}
              likeCount={selectedMeme.likeCount}
              downloadCount={selectedMeme.downloadCount}
              commentCount={selectedMeme.commentCount}
              shareCount={selectedMeme.shareCount}
              profilePicUrl={selectedMeme.profilePicUrl}
              memeID={selectedMeme.memeID}
              index={currentMemeIndex} // Current index in the memes array
              currentIndex={currentMemeIndex} // Provide the current index as well
              setCurrentIndex={setCurrentMemeIndex} // A function to update the current index
              initialLikeStatus={{liked: false, doubleLiked: false}} // Replace with actual like status
              onLikeStatusChange={(memeID, status, newLikeCount) => {
                // Implement the function to handle like status change
              }}
              liked={false} // Replace with actual like status
              doubleLiked={false} // Replace with actual double like status
              isDarkMode={isDarkMode}
              onLongPressStart={() => {}} // Implement this function as needed
              onLongPressEnd={() => {}} // Implement this function as needed
              isCommentFeedVisible={isCommentFeedVisible} // Add this prop
              isProfilePanelVisible={false} // Add this prop
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
