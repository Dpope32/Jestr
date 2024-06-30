import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTh, faSave, faBox, faHistory, faHeart, faUser, faEdit } from '@fortawesome/free-solid-svg-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from './ProfileStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomPanel from '../../components/Panels/BottomPanel';
import { getDaysSinceCreation } from '../../utils/dateUtils';
import { Meme, User } from '../../screens/Feed/Feed';
import { getUserMemes, updateProfileImage } from '../../services/authFunctions';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { Asset, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { RNFetchBlob } from 'react-native-fetch-blob';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const Profile = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { user } = route.params;
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'profile' | 'header' | null>(null)
  const [selectedTab, setSelectedTab] = useState('posts');
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [followersCount, setFollowersCount] = useState(user?.followersCount || 0);
  const [followingCount, setFollowingCount] = useState(user?.followingCount || 0);
  const [daysSinceCreation, setDaysSinceCreation] = useState(getDaysSinceCreation(user?.creationDate || ''));
  const [userMemes, setUserMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchUserMemes();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operation: 'getUser', email: parsedUser.email }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON response');
        }

        const responseData = await response.json();
        const updatedUser = responseData.data;

        setLocalUser(updatedUser);
        setFollowersCount(updatedUser.FollowersCount);
        setFollowingCount(updatedUser.FollowingCount);
        setDaysSinceCreation(getDaysSinceCreation(updatedUser.CreationDate));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserMemes = async () => {
    if (localUser && localUser.email) {
      try {
        const memes = await getUserMemes(localUser.email);
        setUserMemes(memes);
      } catch (error) {
        console.error('Error fetching user memes:', error);
      }
    }
  };

const renderMeme = ({ item }: { item: Meme }) => (
  <TouchableOpacity style={styles.memeContainer} onPress={() => handleMemePress(item)}>
    <Image source={{ uri: item.url }} style={styles.memeImage} />
  </TouchableOpacity>
);

const handleMemePress = (meme: Meme) => {
  // Implement navigation to a detailed meme view
  console.log('Meme pressed:', meme);
};

const renderTabContent = () => {
  switch (selectedTab) {
    case 'posts':
      return (
        <FlatList
          data={userMemes}
          renderItem={renderMeme}
          keyExtractor={item => item.memeID}
          numColumns={3}
          contentContainerStyle={styles.memeGrid}
        />
      );
      // ... (other cases for different tabs)
      default:
        return <Text>No content available</Text>;
    }
  };

  const handleImagePress = (type: 'profile' | 'header') => {
    setImageType(type);
    ImagePicker.openPicker({
      width: type === 'profile' ? 300 : 1000, // Adjust based on your needs
      height: type === 'profile' ? 300 : 300, // Adjust header height as needed
      cropping: true,
      cropperCircleOverlay: type === 'profile',
      aspectRatio: type === 'profile' ? [1, 1] : [16, 9], // Adjust ratio for header as needed
      mediaType: 'photo',
    }).then(image => {
      handleUpdateImage(image.path, type);
    }).catch(error => {
      console.log('ImagePicker Error: ', error);
    });
  };

  const handleUpdateImage = async (imagePath: string, type: 'profile' | 'header') => {
    setIsLoading(true);
    try {
      await updateProfileImage(localUser?.email || '', type, imagePath);
      setLocalUser(prev => {
        if (!prev) return null;
        return type === 'profile'
          ? { ...prev, profilePic: imagePath }
          : { ...prev, headerPic: imagePath };
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


  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => handleImagePress('header')}>
          <Image source={{ uri: localUser?.headerPic }} style={styles.headerImage} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleImagePress('profile')}>
          <Image source={{ uri: localUser?.profilePic }} style={styles.profileImage} />
        </TouchableOpacity>
      </View>
    <View style={styles.userInfoContainer}>
      <Text style={styles.displayName}>{localUser?.displayName || 'Anon'}</Text>
      <Text style={styles.bio}>{localUser?.Bio || localUser?.bio || 'No bio available'}</Text>
      <Text style={styles.username}>@{localUser?.username || 'Username'}</Text>
      <Text style={styles.jestrFor}>Jestr for {daysSinceCreation} days</Text>
    </View>
    <View style={styles.followInfoContainer}>
      <View style={styles.followInfo}>
        <Text style={styles.followCount}>{followersCount}</Text>
        <Text style={styles.followLabel}>Followers</Text>
      </View>
      <View style={styles.followInfo}>
        <Text style={styles.followCount}>{followingCount}</Text>
        <Text style={styles.followLabel}>Following</Text>
      </View>
    </View>
    <View style={styles.tabContainer}>
      <TouchableOpacity style={styles.tabButton} onPress={() => setSelectedTab('posts')}>
        <FontAwesomeIcon icon={faUser} style={styles.tabIcon} />
      </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <FontAwesomeIcon icon={faBox} style={styles.tabIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <FontAwesomeIcon icon={faHistory} style={styles.tabIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <FontAwesomeIcon icon={faHeart} style={styles.tabIcon} />
          </TouchableOpacity>
        </View>
    {renderTabContent()}
      <BottomPanel
          onHomeClick={() => { }}
          handleLike={() => { }}
          handleDislike={() => { }}
          likedIndices={new Set()}
          dislikedIndices={new Set()}
          likeDislikeCounts={{}}
          currentMediaIndex={0}
          toggleCommentFeed={() => { }}
          user={localUser}
        />
     <Modal visible={!!fullScreenImage} transparent={true} onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.modalContainer}>
          <Image source={{ uri: fullScreenImage || undefined }} style={styles.fullScreenImage} />
          <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => handleImagePress(imageType || 'profile')}
            >
              <FontAwesomeIcon icon={faEdit} style={styles.editIcon} />
            </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullScreenImage(null)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;