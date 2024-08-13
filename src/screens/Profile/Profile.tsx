import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Dimensions, ActivityIndicator, Alert, StyleSheet, ScrollView, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faHistory, faHeart, faUser, faEdit, faTimes, IconDefinition, faSadTear, faCog } from '@fortawesome/free-solid-svg-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import styles from './ProfileStyles';
import BottomPanel from '../../components/Panels/BottomPanel';
import { User, Meme, FetchMemesResult } from '../../types/types';
import FollowModal from '../../components/Modals/FollowModal';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import EditableBio from './EditableBio';
import EditProfileModal from '../../components/Modals/EditProfileModal';
import { COLORS } from '../../theme/theme';
import { BlurView } from 'expo-blur';
import { useUserStore, UserState } from '../../utils/userStore';
import MemeGrid from './MemeGrid';
import { useProfileHandlers } from './ProfileHandlers';
import { getDaysSinceCreation } from 'utils/dateUtils';

const { width, height } = Dimensions.get('window');

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export type TabName = 'posts' | 'liked' | 'history' | 'downloaded';

const Profile: React.FC<ProfileScreenRouteProp> = React.memo(() => {
  const user = useUserStore(state => state);
  const [gridHeight, setGridHeight] = useState(300);
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
  const [followingCount, setFollowingCount] = useState(user.followingCount || 0);
  const [daysSinceCreation, setDaysSinceCreation] = useState(getDaysSinceCreation(user.creationDate || ''));
  const { absoluteFill } = StyleSheet;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<TabName>('posts');

  const [tabMemes, setTabMemes] = useState<Meme[]>([]);
  const [isFollowModalVisible, setIsFollowModalVisible] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'followers' | 'following'>('followers');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);

  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0],
    extrapolate: 'clamp',
  });

  const {
    handleUpdateImage,
    handleEditImagePress,
    onLikeStatusChange,
    handleBioUpdate,
    handleHeightChange,
    handleCloseMediaPlayer,
    loadMoreMemes,
    fetchTabMemes,
    handleMemePress,
    handleDeleteMeme,
    handleRemoveDownloadedMeme,
    handleSettingsClick,
  } = useProfileHandlers(user, setTabMemes, navigation, setIsLoading, setLastEvaluatedKey, setHasMoreMemes, setSelectedMeme, setCurrentMemeIndex, setIsCommentFeedVisible);

  useEffect(() => {
    if (route.params?.user) {
      useUserStore.getState().setUserDetails(route.params.user);
    }
  }, [route.params?.user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // console.log('Profile screen focused');
    });

  
    return unsubscribe;
  }, [navigation]);

  const handleImagePress = (type: 'profile' | 'header') => {
    const imageUri = type === 'profile' ? user?.profilePic || '' : user?.headerPic || '';
    const finalImageUri: string | null = typeof imageUri === 'string' ? imageUri : null;
    console.log('Image Pressed:', type, finalImageUri);
    setFullScreenImage(finalImageUri);
    setIsBlurVisible(true);
  };

  useEffect(() => {
    setFollowersCount(user.followersCount || 0);
    setFollowingCount(user.followingCount || 0);
    setDaysSinceCreation(getDaysSinceCreation(user.CreationDate || ''));
    const calculatedDaysSinceCreation = getDaysSinceCreation(user.creationDate || user.CreationDate || '');
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

  const renderTabButton = (tabName: TabName, icon: IconDefinition, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabName && styles.activeTabButton]}
      onPress={() => handleTabSelect(tabName)}
    >
      <FontAwesomeIcon
        icon={icon}
        color={selectedTab === tabName ? styles.activeTabIcon.color : styles.tabIcon.color}
        size={24}
      />
      <Text style={[styles.tabLabel, selectedTab === tabName && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleTabSelect = (tabName: TabName) => {
    setSelectedTab(tabName);  // Update the selected tab state
    setTabMemes([]); // Clear previous tab memes
    setLastEvaluatedKey(null); // Reset lastEvaluatedKey
    fetchTabMemes(tabName); // Fetch new tab memes
  };

  const convertUserStateToUser = (userState: UserState): User => ({
    ...userState,
    profilePic: typeof userState.profilePic === 'string' ? userState.profilePic : '',
    headerPic: typeof userState.headerPic === 'string' ? userState.headerPic : '',
    CreationDate: userState.CreationDate || userState.creationDate || '',
  });

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <BlurView intensity={90} style={{ position: 'absolute', top: 20, bottom: 0, left: 0, right: 0, width, height }}>
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
    return (
      <TouchableOpacity
        key={item.memeID}
        style={styles.memeContainer}
        onPress={() => handleMemePress(item, index)}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.memeImage}
          resizeMode="cover"
        />
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
    />
  );
};
  if (!user) return <ActivityIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#696969' : '#1C1C1C', flexDirection: 'column' }]}>
      <ScrollView>
        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
          <TouchableOpacity onPress={() => handleImagePress('header')}>
            <Image 
              source={{ uri: typeof user.headerPic === 'string' ? user.headerPic : undefined }} 
              style={styles.headerImage} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleImagePress('profile')}>
            <Image 
              source={{ uri: typeof user.profilePic === 'string' ? user.profilePic : undefined }} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity style={styles.editContainer} onPress={() => setIsEditProfileModalVisible(true)}>
            <FontAwesomeIcon icon={faEdit} size={24} color="#1bd40b" />
            <Text style={styles.edit}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsIcon} onPress={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} size={24} color="#1bd40b" />
          </TouchableOpacity>
          <Text style={styles.displayName}>{user?.displayName || 'Anon'}</Text>
          <Text style={styles.username}>@{user?.username || 'Username'}</Text>
          <View style={styles.bioWrapper}>
            <EditableBio
              initialBio={user?.bio || user?.bio || 'No bio available'}
              userEmail={user?.email || ''}
              onBioUpdate={handleBioUpdate}
              editable={false}
            />
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.followInfo}>
            <Text style={styles.followCount}>{followersCount || 0}</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
          <View style={styles.jestrForContainer}>
            <Text style={styles.jestrFor}>Jestr for</Text>
            <Text style={styles.jestrForDays}>{daysSinceCreation} days</Text>
          </View>
          <View style={styles.followInfo}>
            <Text style={styles.followCount}>{followingCount || 0}</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
        </View>
        <View style={styles.tabContainer}>
    {renderTabButton('posts', faUser, 'Posts')}
    {renderTabButton('downloaded', faBox, 'Gallery')}
    {renderTabButton('history', faHistory, 'History')}
    {renderTabButton('liked', faHeart, 'Likes')}
  </View>
        <Animated.View style={{ flex: 1, minHeight: 300, maxHeight: Animated.add(300, Animated.multiply(scrollY, 2)) }}>
          {renderTabContent()}
        </Animated.View>
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
          onRequestClose={() => setSelectedMeme(null)}
        >
          <View style={styles.modalContainer}>
            <MediaPlayer
               memeUser={selectedMeme?.memeUser || {}}
              mediaType={selectedMeme.mediaType}
              currentMedia={selectedMeme.url}
              prevMedia={currentMemeIndex > 0 ? tabMemes[currentMemeIndex - 1].url : null}
              nextMedia={currentMemeIndex < tabMemes.length - 1 ? tabMemes[currentMemeIndex + 1].url : null}
              username={selectedMeme.username}
              caption={selectedMeme.caption}
              uploadTimestamp={selectedMeme.uploadTimestamp}
              handleLike={() => {}}
              handleDownload={() => {}}
              toggleCommentFeed={() => setIsCommentFeedVisible(!isCommentFeedVisible)}
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
              likedIndices={new Set()}
              doubleLikedIndices={new Set()}
              downloadedIndices={new Set()}
              likeDislikeCounts={{}}
              currentMediaIndex={currentMemeIndex}
              user={convertUserStateToUser(user)}
              likeCount={selectedMeme.likeCount}
              downloadCount={selectedMeme.downloadCount}
              commentCount={selectedMeme.commentCount}
              shareCount={selectedMeme.shareCount}
              profilePicUrl={selectedMeme.profilePicUrl}
              memeID={selectedMeme.memeID}
              initialLikeStatus={{ liked: false, doubleLiked: false }}
              onLikeStatusChange={onLikeStatusChange}
              liked={false}
              doubleLiked={false}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedMeme(null)}
            >
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
            {selectedTab === 'posts' && (
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteMeme(selectedMeme.memeID)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
            {selectedTab === 'downloaded' && (
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => handleRemoveDownloadedMeme(selectedMeme.memeID)}
              >
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
          onUpdateUser={(updatedUser) => {
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
    onRequestClose={() => { setFullScreenImage(null); setIsBlurVisible(false); }}
  >
    <BlurView 
      intensity={100} 
      tint="dark" 
      style={[absoluteFill, { width: '100%', height: '100%' }]}
    >
      <View style={styles.fullScreenContainer}>
        <Image
          source={{ uri: fullScreenImage }}
          style={[
            fullScreenImage === (user?.profilePic || '') ? styles.fullScreenProfileImage : styles.fullScreenHeaderImage,
            { zIndex: 1 }
          ]}
        />
        <TouchableOpacity
          style={[styles.editButton, { zIndex: 2 }]}
          onPress={() => handleEditImagePress(fullScreenImage === (user?.profilePic || '') ? 'profile' : 'header')}
        >
          <FontAwesomeIcon icon={faEdit} size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => { setFullScreenImage(null); setIsBlurVisible(false); }}
        >
          <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </BlurView>
  </Modal>
)}

    </View>
  );
});



export default Profile;