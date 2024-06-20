import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTh, faSave, faBox, faHistory, faHeart, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from './ProfileStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomPanel from '../../components/Panels/BottomPanel';
import { getDaysSinceCreation } from '../../utils/dateUtils';
import { User } from '../../screens/Feed/Feed';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const Profile = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const { user } = route.params;
  
  const [selectedTab, setSelectedTab] = useState('posts');
  const [localUser, setLocalUser] = useState<User | null>(user || null);
  const [followersCount, setFollowersCount] = useState(user?.followersCount || 0);
  const [followingCount, setFollowingCount] = useState(user?.followingCount || 0);
  const [daysSinceCreation, setDaysSinceCreation] = useState(getDaysSinceCreation(user?.creationDate || ''));

  useEffect(() => {
    fetchUserData();
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

  const renderTabContent = () => {
    // Here you can implement the content of each tab
    return <Text>Posts content here...</Text>;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Image source={{ uri: localUser?.headerPic }} style={styles.headerImage} />
          <Image source={{ uri: localUser?.profilePic }} style={styles.profileImage} />
        </View>
        <View style={styles.userInfoContainer}>
          <Text style={styles.displayName}>{localUser?.displayName || 'Anon'}</Text>
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
          <TouchableOpacity style={styles.tabButton}>
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
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>
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
    </View>
  );
};

export default Profile;