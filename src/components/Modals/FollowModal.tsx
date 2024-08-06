import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { getFollowers, getFollowing, addFollow, removeFollow, getUserById, checkFollowStatus } from '../../services/authFunctions';
import { User } from '../../types/types';
import { FlashList } from '@shopify/flash-list';

interface FollowModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
    initialTab: 'followers' | 'following';
  }

  interface FollowUser extends User {
    isFollowing: boolean;
    userId: string; // This ensures userId is always present for FollowUser
    animatedValue: Animated.Value;
}

const FollowModal: React.FC<FollowModalProps> = ({ visible, onClose, userId, initialTab }) => {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (visible) {
        fetchData();
      }
    }, [visible, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const followersIds = await getFollowers(userId);
      const followingIds = await getFollowing(userId);
      
      const fetchFollowers = followersIds.map(async id => {
        const userData = await getUserById(id);
        const followStatus = await checkFollowStatus(userId, id);
        return { 
          ...userData, 
          isFollowing: followStatus.isFollowing,
          animatedValue: new Animated.Value(followStatus.isFollowing ? 1 : 0)
        } as FollowUser;
      });
      
      const fetchFollowing = followingIds.map(async id => {
        const userData = await getUserById(id);
        return { 
          ...userData, 
          isFollowing: true,
          animatedValue: new Animated.Value(1)
        } as FollowUser;
      });
      
      setFollowers(await Promise.all(fetchFollowers));
      setFollowing(await Promise.all(fetchFollowing));
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateButton = (user: FollowUser, toValue: number) => {
    Animated.timing(user.animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      await addFollow(userId, targetUserId);
      const updatedUsers = activeTab === 'followers' ? followers : following;
      const userIndex = updatedUsers.findIndex(user => user.email === targetUserId);
      if (userIndex !== -1) {
        updatedUsers[userIndex].isFollowing = true;
        animateButton(updatedUsers[userIndex], 1);
        activeTab === 'followers' ? setFollowers([...updatedUsers]) : setFollowing([...updatedUsers]);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await removeFollow(userId, targetUserId);
      const updatedUsers = activeTab === 'followers' ? followers : following;
      const userIndex = updatedUsers.findIndex(user => user.email === targetUserId);
      if (userIndex !== -1) {
        updatedUsers[userIndex].isFollowing = false;
        animateButton(updatedUsers[userIndex], 0);
        activeTab === 'followers' ? setFollowers([...updatedUsers]) : setFollowing([...updatedUsers]);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const renderUserItem = ({ item }: { item: FollowUser }) => {
    const backgroundColor = item.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#ffffff', '#000000']
    });
    const textColor = item.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#000000', '#ffffff']
    });

    return (
      <View style={styles.userRow}>
        <Image 
          source={{ uri: item.profilePic || 'https://via.placeholder.com/150' }} 
          style={styles.profilePic} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.displayName}>{item.displayName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => item.isFollowing ? handleUnfollow(item.email) : handleFollow(item.email)}
        >
          <Animated.View style={[styles.followButton, { backgroundColor }]}>
            <Animated.Text style={[styles.followButtonText, { color: textColor }]}>
              {item.isFollowing ? 'Following' : 'Follow Back'}
            </Animated.Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
            onPress={() => setActiveTab('followers')}
          >
            <Text style={styles.tabText}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.activeTab]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={styles.tabText}>Following</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : (
          <FlashList
            data={activeTab === 'followers' ? followers : following}
            renderItem={renderUserItem}
            keyExtractor={(item, index) => `${activeTab}-${item.email}-${index}`}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>No users found</Text>
            )}
          />
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
}


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    width: '90%',
    height: '80%', // Changed from maxHeight to height
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between', // This will push the close button to the bottom
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00ff00',
  },
  followButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000000',
  },
  followButtonText: {
    fontSize: 14,
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#00ff00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  displayName: {
    color: '#fff',
    fontSize: 14,
  },
  followBackButton: {
    backgroundColor: '#fff',
  },
  followingButton: {
    backgroundColor: '#000',
  },
  followBackText: {
    color: '#000',
  },
  followingText: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyListText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FollowModal;