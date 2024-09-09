import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Animated, StyleSheet} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faHistory, faHeart, faUser, faEdit, faTimes, faSadTear, faShare } from '@fortawesome/free-solid-svg-icons';
import { BlurView } from 'expo-blur';
import styles from './ProfileStyles';
import MemeGrid from './MemeGrid';
import EditableBio from './EditableBio';
import { useTheme } from '../../theme/ThemeContext';
import { COLORS } from '../../theme/theme';
import BottomPanel from '../../components/Panels/BottomPanel';
import FollowModal from '../../components/Modals/FollowModal';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import EditProfileModal from '../../components/Modals/EditProfileModal';
import { useProfileLogic, TabName } from './useProfileLogic';
import { UserState, useUserStore } from '../../stores/userStore';
import { RootStackParamList, Meme } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { RouteProp } from '@react-navigation/native';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList,'Profile'>;
type ProfileProps = {route: ProfileScreenRouteProp; navigation: ProfileScreenNavigationProp;};

const Profile: React.FC<ProfileProps> = React.memo(({ route, navigation }) => {
  const { isDarkMode } = useTheme();
  const {
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
    isEditProfileModalVisible,
    fullScreenImage,
    isBlurVisible,
    isUploading,
    handleEditImagePress,
    handleBioUpdate,
    handleHeightChange,
    loadMoreMemes,
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
  } = useProfileLogic(route, navigation);

  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 0],
    extrapolate: 'clamp',
  });

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

  const renderTabContent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
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
          ? { uri: thumbnails[item.memeID] }
          : { uri: item.url };
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
        itemSize={styles.memeContainer.width}
      />
    );
  }, [isLoading, tabMemes, selectedTab, user, thumbnails, handleMemePress, loadMoreMemes, handleHeightChange, handleDeleteMeme, handleRemoveDownloadedMeme]);

  if (!user) return <ActivityIndicator />;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' },
      ]}>
      {isUploading && <ActivityIndicator size="large" color="#00ff00" />}
      <ScrollView>
        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
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
          <View style={styles.statsContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.displayName}>{user?.displayName || 'Anon'}</Text>
              <Text style={styles.username}>@{user?.username || 'Username'}</Text>
            </View>
            <View style={styles.numContainer}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => openFollowModal('following')}
              >
                <Text style={styles.statCount}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.jestrForDays}>{daysSinceCreation} days</Text>
                <Text style={styles.statLabel}>Jestr for</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => openFollowModal('followers')}
              >
                <Text style={styles.statCount}>{followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.bioWrapper, { alignItems: 'center', justifyContent: 'center' }]}>
            <EditableBio
              initialBio={user?.bio || 'No bio available'}
              userEmail={user?.email || ''}
              onBioUpdate={handleBioUpdate}
              editable={false}
            />
          </View>
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
            style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}>
            <View style={styles.fullScreenContainer}>
              <Image
                source={{ uri: fullScreenImage }}
                style={[
                  fullScreenImage === (user?.profilePic || '')
                    ? styles.fullScreenProfileImage
                    : styles.fullScreenHeaderImage,
                  { zIndex: 1 },
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