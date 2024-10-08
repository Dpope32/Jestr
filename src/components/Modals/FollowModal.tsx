import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {User} from '../../types/types';
import {FlashList} from '@shopify/flash-list';
import {useFollowStore} from '../../stores/followStore';
import styles from './ModalStyles/FollowModalStyles';

interface FollowModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  initialTab: 'followers' | 'following';
}

interface FollowUser extends User {
  isFollowing: boolean;
  userId: string;
  animatedValue: Animated.Value;
}

const FollowModal: React.FC<FollowModalProps> = ({
  visible,
  onClose,
  userId,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab,
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    followers,
    following,
    loadFollowers,
    loadFollowing,
    addFollowing,
    removeFollowing,
  } = useFollowStore();

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadFollowers(userId), loadFollowing(userId)]);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userEmailToFollow: string) => {
    setIsLoading(true);
    try {
      const userToFollow = followers.find(f => f.email === userEmailToFollow);
      if (userToFollow) {
        await addFollowing(userId, userToFollow);
      } else {
        console.error('User not found in followers list');
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (userEmailToUnfollow: string) => {
    setIsLoading(true);
    try {
      await removeFollowing(userId, userEmailToUnfollow);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({item}: {item: FollowUser}) => {
    const isFollowing = following.some(user => user.email === item.email);
    const buttonText =
      activeTab === 'following'
        ? 'Unfollow'
        : isFollowing
        ? 'Following'
        : 'Follow Back';

    return (
      <View style={styles.userRow}>
        <Image
          source={{
            uri:
              typeof item.profilePic === 'string'
                ? item.profilePic
                : item.profilePic?.uri || 'https://via.placeholder.com/150',
          }}
          style={styles.profilePic}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.displayName}>{item.displayName}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            isFollowing ? handleUnfollow(item.email) : handleFollow(item.email)
          }>
          <View
            style={[
              styles.followButton,
              {
                backgroundColor:
                  activeTab === 'following'
                    ? '#ff0000'
                    : isFollowing
                    ? '#000000'
                    : '#ffffff',
              },
            ]}>
            <Text
              style={[
                styles.followButtonText,
                {
                  color:
                    activeTab === 'following'
                      ? '#ffffff'
                      : isFollowing
                      ? '#ffffff'
                      : '#000000',
                },
              ]}>
              {buttonText}
            </Text>
          </View>
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
              style={[
                styles.tab,
                activeTab === 'followers' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('followers')}>
              <Text style={styles.tabText}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'following' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('following')}>
              <Text style={styles.tabText}>Following</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <FlashList
              data={activeTab === 'followers' ? followers : following}
              renderItem={renderUserItem}
              keyExtractor={(item, index) =>
                `${activeTab}-${item.email}-${index}`
              }
              estimatedItemSize={66}
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
};

export default FollowModal;
