import React, { useState, useEffect,  } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Dimensions, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faHistory, faHeart, faUser, faEdit, faTimes, IconDefinition, faSadTear } from '@fortawesome/free-solid-svg-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import styles from './ProfileStyles';
import BottomPanel from '../../components/Panels/BottomPanel';
import { getDaysSinceCreation } from '../../utils/dateUtils';
import { User, Meme, FetchMemesResult } from '../../types/types';
import { getUserMemes, updateProfileImage, fetchMemes } from '../../services/authFunctions';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import FollowModal from '../../components/Modals/FollowModal';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import EditableBio from './EditableBio';
import EditProfileModal from '../../components/Modals/EditProfileModal';
import { COLORS} from '../../theme/theme';
import { BlurView } from 'expo-blur';
import { useUserStore, UserState } from '../../utils/userStore';
import MemeGrid from './MemeGrid';

const { width, height } = Dimensions.get('window');

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type TabName = 'posts' | 'liked' | 'history' | 'downloaded';

const Profile = () => {
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
  const bio = user?.bio || 'Default bio';
  const [isBlurVisible, setIsBlurVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMemes, setHasMoreMemes] = useState(true);

  useEffect(() => {
    if (route.params?.user) {
      useUserStore.getState().setUserDetails(route.params.user);
    }
  }, [route.params?.user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
   //   console.log('Profile screen focused');
    });
  
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setFollowersCount(user.followersCount || 0);
    setFollowingCount(user.followingCount || 0);
    setDaysSinceCreation(getDaysSinceCreation(user.creationDate || ''));
  }, [user]);

  useEffect(() => {
    //console.log('User data in Profile:', user);
    if (user.email) {
      fetchTabMemes(selectedTab);
    } else {
      console.log('No user data available');
    }
  }, [user, selectedTab]);


  const loadMoreMemes = () => {
    if (hasMoreMemes && !isLoading) {
      setCurrentPage(prevPage => prevPage + 1);
      fetchTabMemes(selectedTab, currentPage + 1);
    }
  };

  const fetchTabMemes = async (tab: TabName, page: number = 1, pageSize: number = 30) => {
    if (user && user.email) {
      try {
        setIsLoading(true);
       // console.log(`Fetching memes for tab: ${tab}, page: ${page}`);
        let result: FetchMemesResult;
        switch (tab) {
          case 'posts':
            result = await getUserMemes(user.email);
            break;
          case 'liked':
            result = await fetchMemes(user.email, 'liked', lastEvaluatedKey, pageSize);
            break;
          case 'history':
            result = await fetchMemes(user.email, 'viewed', lastEvaluatedKey, pageSize);
            break;
          case 'downloaded':
            result = await fetchMemes(user.email, 'downloaded', lastEvaluatedKey, pageSize);
            break;
          default:
            result = { memes: [], lastEvaluatedKey: null };
        }
       // console.log(`Fetched ${result.memes.length} memes for ${tab} tab`);
        setTabMemes(prevMemes => [...prevMemes, ...result.memes]);
        setLastEvaluatedKey(result.lastEvaluatedKey);
        setHasMoreMemes(result.memes.length === pageSize);
      } catch (error) {
        console.error(`Error fetching ${tab} memes:`, error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('No local user data available');
    }
  };

  const handleMemePress = (meme: Meme, index: number) => {
   // console.log("Meme selected", meme);
    setSelectedMeme(meme);
    setCurrentMemeIndex(index);
    setIsCommentFeedVisible(false); // Ensure comment feed is closed when another meme is selected
  };

  const goToPrevMeme = () => {
    if (currentMemeIndex > 0) {
      setCurrentMemeIndex(currentMemeIndex - 1);
      setSelectedMeme(tabMemes[currentMemeIndex - 1]);
    }
  };

  const goToNextMeme = () => {
    if (currentMemeIndex < tabMemes.length - 1) {
      setCurrentMemeIndex(currentMemeIndex + 1);
      setSelectedMeme(tabMemes[currentMemeIndex + 1]);
    }
  };

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

  const handleHeightChange = (height: number) => {
    setGridHeight(height);
  };

  const handleCloseMediaPlayer = () => {
    setSelectedMeme(null);
    setCurrentMemeIndex(0);
  };

  const handleTabSelect = (tabName: TabName) => {
    setSelectedTab(tabName);
    setTabMemes([]); // Clear previous tab memes
    setLastEvaluatedKey(null); // Reset lastEvaluatedKey
    fetchTabMemes(tabName); // Fetch new tab memes
  };

  const toggleCommentFeed = () => {
  //  console.log("Toggling Comment Feed", !isCommentFeedVisible);
    setIsCommentFeedVisible(!isCommentFeedVisible);
  };

  if (!user) return <ActivityIndicator />; // Show loading indicator or other placeholder if user is null

  const renderTabButton = (tabName: TabName, icon: IconDefinition, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabName && styles.activeTabButton]}
      onPress={() => handleTabSelect(tabName)}
    >
      <FontAwesomeIcon
        icon={icon}
        color={selectedTab === tabName ? styles.activeTabIcon.color : styles.tabIcon.color}
        size={24} // Adjust size as needed
      />
      <Text style={[styles.tabLabel, selectedTab === tabName && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
  
    return (
      <View style={{ flex: 1, height: gridHeight }}>
        <MemeGrid 
          memes={tabMemes} 
          renderMeme={renderMeme} 
          onLoadMore={loadMoreMemes}
          onHeightChange={handleHeightChange}
        />
      </View>
    );
  };
  

  const handleImagePress = (type: 'profile' | 'header') => {
    const imageUri = type === 'profile' ? user?.profilePic || '' : user?.headerPic || '';
    
    const finalImageUri: string | null = typeof imageUri === 'string' ? imageUri : null;
    
    console.log('Image Pressed:', type, finalImageUri);
    setFullScreenImage(finalImageUri);
    setIsBlurVisible(true);
  };
  


  const handleEditImagePress = async (type: 'profile' | 'header') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        const manipResult = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [
            {
              resize: {
                width: type === 'profile' ? 300 : 1000,
                height: type === 'profile' ? 300 : 300,
              },
            },
          ],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        handleUpdateImage(manipResult.uri, type);
      }
    } catch (error) {
      console.log('ImagePicker Error: ', error);
    }
  };

  const handleUpdateImage = async (imagePath: string, type: 'profile' | 'header') => {
    setIsLoading(true);
    try {
      await updateProfileImage(user.email, type, imagePath);
      
      // Update Zustand store
      useUserStore.getState().setUserDetails({
        [type]: { uri: imagePath, width: 300, height: 300 } // You might want to get actual dimensions
      });
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        props: { backgroundColor: '#333', textColor: '#00ff00' },
      });
    } catch (error) {
      console.error('Failed to update image:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile image',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        props: { backgroundColor: '#333', textColor: '#00ff00' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertUserStateToUser = (userState: UserState): User => ({
    ...userState,
    profilePic: typeof userState.profilePic === 'string' ? userState.profilePic : '',
    headerPic: typeof userState.headerPic === 'string' ? userState.headerPic : '',
  });
  

  const onLikeStatusChange = (memeID: string, status: { liked: boolean; doubleLiked: boolean }, newLikeCount?: number) => {
    setTabMemes(prevMemes =>
      prevMemes.map(meme =>
        meme.memeID === memeID
          ? { ...meme, likeCount: newLikeCount || meme.likeCount }
          : meme
      )
    );
  };

  const handleBioUpdate = (newBio: string) => {
    useUserStore.getState().setUserDetails({ bio: newBio });
  };

 
  return (
  <View style={[styles.container, { backgroundColor: isDarkMode ? '#696969' : '#1C1C1C', flexDirection: 'column' }]}>
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEventThrottle={16}
    >
        <View style={styles.headerContainer}>
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

      </View>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity style={styles.editContainer} onPress={() => setIsEditProfileModalVisible(true)}>
          <FontAwesomeIcon icon={faEdit} size={24} color="#1bd40b" />
          <Text style={styles.edit}>Edit Profile</Text>
        </TouchableOpacity>
        <Text style={styles.displayName}>{user?.displayName || 'Anon'}</Text>
        <Text style={styles.username}>@{user?.username || 'Username'}</Text>
        <View style={styles.bioWrapper}>
          <EditableBio
            initialBio={user?.bio || user?.bio || 'No bio available'}
            userEmail={user?.email || ''}
            onBioUpdate={handleBioUpdate}
            editable={false} // Disable editing in EditableBio
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
      <View style={{ flex: 1, minHeight: 300, maxHeight: 1200 }}>
        {renderTabContent()}
      </View>
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
          onRequestClose={handleCloseMediaPlayer}
        >
          <View style={styles.mediaPlayerContainer}>
            <MediaPlayer
              memeUser={selectedMeme.memeUser || {}}
              mediaType={selectedMeme.mediaType || 'image'}
              currentMedia={selectedMeme.url}
              prevMedia={currentMemeIndex > 0 ? tabMemes[currentMemeIndex - 1].url : null}
              nextMedia={currentMemeIndex < tabMemes.length - 1 ? tabMemes[currentMemeIndex + 1].url : null}
              username={selectedMeme.username}
              caption={selectedMeme.caption}
              uploadTimestamp={selectedMeme.uploadTimestamp}
              handleLike={() => {}}
              handleDownload={() => {}}
              toggleCommentFeed={toggleCommentFeed}
              goToPrevMedia={goToPrevMeme}
              goToNextMedia={goToNextMeme}
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
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseMediaPlayer}>
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
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
      <TouchableOpacity
        style={[absoluteFill, { width: '100%', height: '100%' }]}
        onPress={() => { setFullScreenImage(null); setIsBlurVisible(false); }}
      >
        <View style={[styles.fullScreenContainer, { width: '100%', height: '100%' }]}>
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
        </View>
      </TouchableOpacity>
    </BlurView>
  </Modal>
)}
    </ScrollView>
    </View>
  );
};


export default Profile;
