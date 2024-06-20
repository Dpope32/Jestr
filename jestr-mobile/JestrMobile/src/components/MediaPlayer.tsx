import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faSave, faComment, faShare, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State, TapGestureHandler } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import CommentFeed from './Modals/CommentFeed';
import { User } from '../screens/Feed/Feed';
import { updateMemeReaction } from './Meme/memeService';
import SaveSuccessModal from './Modals/SaveSuccessModal'; 
import ShareModal from './Modals/ShareModal'; 
import { handleShareMeme, addFollow, checkFollowStatus,  } from '../services/authFunctions'
import { getLikeStatus } from './Meme/memeService'

const DARK_GREEN = "#006400";

const testFriends: Friend[] = [
  {
    username: 'LOSER99',
    profilePic: 'https://placekitten.com/200/200',
    
  },
  {
    username: 'jane_smith',
    profilePic: 'https://placekitten.com/200/200',
  },
  {
    username: 'mike_johnson',
    profilePic: 'https://placekitten.com/200/200',
  },
  {
    username: 'sarah_davis',
    profilePic: 'https://placekitten.com/200/200',
  },
  {
    username: 'david_wilson',
    profilePic: 'https://placekitten.com/200/200',
  },
];

const { width, height } = Dimensions.get('window'); // Get device width and height

interface Friend {
  username: string;
  profilePic: string;
}

export type ShareType = 'copy' | 'message' | 'snapchat' | 'facebook' | 'twitter' | 'email' | 'friend' | 'instagram';

type MediaPlayerProps = {
  memeUser: User;
  currentMedia: string;
  username: string;
  caption: string;
  uploadTimestamp: string;
  handleLike: () => void;
  handleDownload: () => void;
  toggleCommentFeed: () => void;
  goToPrevMedia: () => void;
  goToNextMedia: () => void;
  likedIndices: Set<number>;
  doubleLikedIndices: Set<number>;
  downloadedIndices: Set<number>;
  likeDislikeCounts: Record<number, number>;
  currentMediaIndex: number;
  user: User | null;
  likeCount: number;
  downloadCount: number;
  commentCount: number;
  shareCount: number;
  profilePicUrl: string;
  memeID: string;
  nextMedia: string | null;
  prevMedia: string | null;
  initialLikeStatus: {
    liked: boolean;
    doubleLiked: boolean;
  };
  onLikeStatusChange: (memeID: string, status: { liked: boolean; doubleLiked: boolean }) => void;
};

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  memeUser,
  currentMedia,
  prevMedia,
  nextMedia,
  username,
  caption,
  uploadTimestamp,
  handleLike,
  handleDownload,
  toggleCommentFeed,
  goToPrevMedia,
  goToNextMedia,
  currentMediaIndex,
  likedIndices,
  doubleLikedIndices,
  downloadedIndices,
  likeDislikeCounts,
  user,
  likeCount,
  downloadCount,
  commentCount,
  shareCount,
  profilePicUrl,
  memeID,
  initialLikeStatus,
  onLikeStatusChange,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [imageHeight, setImageHeight] = useState(height - 150);
  const [imageSize, setImageSize] = useState({ width: width, height: height - 150 });
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localDownloadCount, setLocalDownloadCount] = useState(downloadCount);
  const [localShareCount, setLocalShareCount] = useState(shareCount);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const [followIconVisible, setFollowIconVisible] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const lastTap = useRef(0);
  const onSwipe = Animated.event([{ nativeEvent: { translationY: translateY } }], { useNativeDriver: true });
  const [liked, setLiked] = useState(initialLikeStatus.liked);
  const [doubleLiked, setDoubleLiked] = useState(initialLikeStatus.doubleLiked);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const doubleTapRef = useRef(null);
  const SWIPE_THRESHOLD = height / 4; // For example, 1/4 of the screen height
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const friends: Friend[] = [];
  const [shareStatus, setShareStatus] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const followButtonScale = useRef(new Animated.Value(1)).current;
  const [hasFollowed, setHasFollowed] = useState(false);
  const [isCurrentUserFollowed, setIsCurrentUserFollowed] = useState(false);
  
  
  useEffect(() => {
    setLiked(initialLikeStatus.liked);
    setDoubleLiked(initialLikeStatus.doubleLiked);
    setLocalLikeCount(likeCount);
    setLocalDownloadCount(downloadCount);
    setLocalShareCount(shareCount);
    setHasFollowed(false);
    setIsFollowing(false);
    checkIfFollowed();
  }, [memeID, initialLikeStatus, likeCount, downloadCount, shareCount, user, memeUser]);

  const toggleComments = () => {
    setShowComments(!showComments);
    toggleCommentFeed(); // Additional functionality can still be handled
  };

  const checkIfFollowed = async () => {
    if (user && memeUser) {
      try {
        const followStatus = await checkFollowStatus(user.email, memeUser.email);
        setIsCurrentUserFollowed(followStatus.isFollowing);
        setFollowIconVisible(followStatus.canFollow && !followStatus.isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
        // Handle error, maybe set default values
        setIsCurrentUserFollowed(false);
        setFollowIconVisible(true);
      }
    }
  };

  const checkLikeStatus = async () => {
    if (user) {
      try {
        const likeStatus = await getLikeStatus(memeID, user.email);
        setLiked(likeStatus.liked);
        setDoubleLiked(likeStatus.doubleLiked);
        setLocalLikeCount(likeCount); // Update local like count
      } catch (error) {
        console.error('Error checking like status:', error);
        setLiked(false);
        setDoubleLiked(false);
        setLocalLikeCount(likeCount); // Ensure local like count is updated even on error
      }
    } else {
      setLiked(false);
      setDoubleLiked(false);
      setLocalLikeCount(likeCount);
    }
  };

  useEffect(() => {
    Image.getSize(currentMedia, (imgWidth, imgHeight) => {
      const imgAspectRatio = imgWidth / imgHeight;
      const screenAspectRatio = width / (height - 150);
      if (imgAspectRatio > screenAspectRatio) {
        // Image is wider than screen
        setImageSize({ width: width, height: width / imgAspectRatio });
      } else {
        // Image is taller than screen or similar
        setImageSize({ height: height - 150, width: (height - 150) * imgAspectRatio });
      }
    });
  }, [currentMedia]);

  const currentMemeOpacity = translateY.interpolate({
    inputRange: [-height, -height / 2, 0, height / 2, height],
    outputRange: [0, 0, 1, 0, 0],
    extrapolate: 'clamp'
  });

  const nextMemeTranslateY = translateY.interpolate({
    inputRange: [-height, 0, height],
    outputRange: [height / 2, 0, -height / 2],
    extrapolate: 'clamp'
  });

  const nextMemeOpacity = translateY.interpolate({
    inputRange: [-height, -height / 2, 0, height / 2, height],
    outputRange: [0, 1, 0, 0, 0],
    extrapolate: 'clamp'
  });

  const prevMemeTranslateY = translateY.interpolate({
    inputRange: [-height, 0, height],
    outputRange: [-height / 2, 0, height / 2],
    extrapolate: 'clamp'
  });

  const prevMemeOpacity = translateY.interpolate({
    inputRange: [-height, -height / 2, 0, height / 2, height],
    outputRange: [0, 0, 0, 1, 0],
    extrapolate: 'clamp'
  });

  const handleSwipeRelease = (event: PanGestureHandlerGestureEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      let direction = nativeEvent.translationY > 0 ? 1 : -1;
      let isFullSwipe = Math.abs(nativeEvent.translationY) > SWIPE_THRESHOLD;
  
      if (isFullSwipe) {
        Animated.timing(translateY, {
          toValue: direction * height,
          duration: 25,  // Adjust duration
          easing: Easing.out(Easing.quad),   // Smoother easing
          useNativeDriver: true
        }).start(() => {
          translateY.setValue(0);
          direction < 0 ? goToNextMedia() : goToPrevMedia();
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true
        }).start();
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return `Yesterday`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const handleLikePress = async () => {
    if (user) {
      const newLikedState = !liked;
      setLiked(newLikedState);
      
      let newLikeCount = localLikeCount;
      if (newLikedState) {
        newLikeCount += 1;
      } else {
        newLikeCount -= 1;
      }
      
      setLocalLikeCount(newLikeCount);
      
      try {
        await updateMemeReaction(memeID, newLikedState, false, false, user.email);
        onLikeStatusChange(memeID, { liked: newLikedState, doubleLiked: false });
      } catch (error) {
        console.error('Error updating meme reaction:', error);
        setLiked(!newLikedState);
        setLocalLikeCount(localLikeCount);
      }
    }
  };

  const handleDownloadPress = async () => {
    if (user) {
      try {
        await updateMemeReaction(memeID, false, false, true, user.email);
        handleDownload();
        setLocalDownloadCount(prevCount => prevCount + 1);
        setShowSaveModal(true);
        setTimeout(() => setShowSaveModal(false), 2000);
      } catch (error) {
        console.error('Error updating meme reaction:', error);
      }
    }
  };

  const onSingleTap = (event: any) => {
    const { state } = event.nativeEvent;
    if (state === State.END) {
      console.log('Single tap detected');
      // Placeholder for single tap functionality
    }
  };

  const onDoubleTap = async (event: any) => {
    const { state } = event.nativeEvent;
    if (state === State.ACTIVE && user) {
      console.log('Double tap detected');
  
      let newLikeCount = localLikeCount;
      let newLikedState = liked;
      let newDoubleLikedState = !doubleLiked;
  
      if (newDoubleLikedState) {
        newLikeCount += liked ? 1 : 2;
        newLikedState = true;
      } else {
        newLikeCount -= 2;
        newLikedState = false;
      }
  
      setLocalLikeCount(newLikeCount);
      setLiked(newLikedState);
      setDoubleLiked(newDoubleLikedState);
  
      try {
        await updateMemeReaction(memeID, newLikedState, newDoubleLikedState, false, user.email);
        animateLogo();
        onLikeStatusChange(memeID, { liked: newLikedState, doubleLiked: newDoubleLikedState });
      } catch (error) {
        console.error('Error updating meme reaction:', error);
        // Revert states on error
        setLocalLikeCount(localLikeCount);
        setLiked(liked);
        setDoubleLiked(doubleLiked);
      }
    }
  };

  const animateLogo = () => {
    console.log('Animating logo now');
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.delay(500),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  };

  const onShare = async (type: ShareType, username: string, message: string) => {
    if (user && type === 'friend' && username) {
      console.log(`Sharing meme with ${username}`);
      setShareStatus('Sharing...');
      try {
        await handleShareMeme(memeID, user.email, user.username, username, message, setResponseModalVisible, setResponseMessage);
        setLocalShareCount(prevCount => prevCount + 1);
      } catch (error) {
        console.error('Sharing failed:', error);
        setResponseMessage('Failed to share meme.');
      }
    }
  };

  const handleFollow = async () => {
    console.log('User & MemeUser', user, memeUser);
    if (user && memeUser && !isCurrentUserFollowed) {
      try {
        await addFollow(user.email, memeUser.email);
        console.log('Followed successfully');
        setIsFollowing(true);
        setIsCurrentUserFollowed(true);
        animateFollowButton();
        
        // Hide the follow icon after 2 seconds
        setTimeout(() => {
          setFollowIconVisible(false);
        }, 2000);
      } catch (error) {
        console.error('Error following user:', error);
      }
    }
  };
  
  const animateFollowButton = () => {
    Animated.sequence([
      Animated.timing(followButtonScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(followButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

 return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onSwipe} onHandlerStateChange={handleSwipeRelease}>
        <Animated.View>
          <TapGestureHandler ref={doubleTapRef} onHandlerStateChange={onDoubleTap} numberOfTaps={2}>
            <TapGestureHandler onHandlerStateChange={onSingleTap} waitFor={doubleTapRef}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                {prevMedia && ( // Check if there's previous media
                  <Animated.Image
                    source={{ uri: prevMedia }}
                    style={[styles.memeImage, { height: imageSize.height, width: imageSize.width, position: 'absolute', top: -imageSize.height, opacity: prevMemeOpacity, transform: [{ translateY: prevMemeTranslateY }] }]}
                    resizeMode="contain"
                  />
                )}
                <Animated.Image
                  source={{ uri: currentMedia }}
                  style={[styles.memeImage, { height: imageSize.height, width: imageSize.width, opacity: currentMemeOpacity }]}
                  resizeMode="contain"
                />
                {nextMedia && (
                  <Animated.Image
                    source={{ uri: nextMedia }}
                    style={[styles.memeImage, { height: imageSize.height + 20, width: imageSize.width, position: 'absolute', bottom: -imageSize.height, opacity: nextMemeOpacity, transform: [{ translateY: nextMemeTranslateY }] }]}
                    resizeMode="contain"
                  />
                )}
<View style={styles.textContainer}>
  <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
  <View>
    <Text style={styles.username}>{username}</Text>
    <Text style={styles.caption}>{caption}</Text>
    <Text style={styles.date}>{formatDate(uploadTimestamp)}</Text>
  </View>
  {followIconVisible && (
  <TouchableOpacity
    onPress={handleFollow}
    style={[
      styles.followButton,
      { transform: [{ scale: followButtonScale }] },
      isFollowing ? styles.followedButton : {}
    ]}
    disabled={isCurrentUserFollowed || user?.email === memeUser.email}
  >
    <FontAwesomeIcon
      icon={isFollowing ? faCheck : faPlus}
      size={16}
      color={isFollowing ? 'white' : '#1bd40b'}
    />
  </TouchableOpacity>
)}
</View>
          <View style={styles.iconColumn}>
          <TouchableOpacity onPress={handleLikePress} style={styles.iconWrapper}>
  <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
    <FontAwesomeIcon 
      icon={faThumbsUp} 
      size={28} 
      color={liked ? DARK_GREEN : "#1bd40b"} 
    />
  </Animated.View>
  <Text style={styles.iconText}>{localLikeCount}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={handleDownloadPress} style={styles.iconWrapper}>
  <FontAwesomeIcon icon={faSave} size={28} color="#1bd40b" />
  <Text style={styles.iconText}>{localDownloadCount}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={toggleComments} style={styles.iconWrapper}>
  <FontAwesomeIcon icon={faComment} size={28} color="#1bd40b" />
  <Text style={styles.iconText}>{commentCount}</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => setShowShareModal(true)} style={styles.iconWrapper}>
  <FontAwesomeIcon icon={faShare} size={28} color="#1bd40b" />
  <Text style={styles.iconText}>{localShareCount}</Text>
</TouchableOpacity>
      </View>
              </Animated.View>
            </TapGestureHandler>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
      <Animated.Image
        source={require('../assets/images/Jestr.jpg')}
        style={{
          opacity: logoOpacity,
          position: 'absolute',
          width: 200,
          height: 200,
          alignSelf: 'center',
          top: '35%',
          left: '24%'
        }}
      />
      <SaveSuccessModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
          <ShareModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            friends={testFriends}  // Pass the actual testFriends array here
            onShare={onShare}
            currentMedia= {currentMedia}
          />

            {responseModalVisible && (
                <Text>{responseMessage}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Ensures content is centered vertically
    alignItems: 'center', // Ensures content is centered horizontally
    backgroundColor: '#1C1C1C',
  },
  memeImage: {
    width: width,
    maxHeight: height - 260,
    alignSelf: 'center', 
    marginTop: 40
  },
  followButton: {
    position: 'absolute',
    left: 35,
    top: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  followedButton: {
    backgroundColor: '#1bd40b',
  },
  iconColumn: {
    position: 'absolute',
    right: 10,  // Increase right margin for better spacing
    top: '10%',  // Start lower to avoid the very top edge of the screen
    justifyContent: 'space-between',  // Improved spacing between icons
    height: '60%',  // Decrease height for a more compact look
  },
  textContainer: {
    position: 'relative', // Changed from absolute to relative
    bottom: 10,  // Adjust the bottom position
    left: 0,  // Standard left margin for alignment
    backgroundColor: 'rgba(0, 0, 0, 0.4)',  // Increase opacity for readability
    padding: 12,  // Increased padding for better text separation
    borderRadius: 8,  // Soften the corners
    flexDirection: 'row',  // Layout direction for elements inside the container
    alignItems: 'center',  // Align items for a cleaner look
    marginTop: 10, // Ensure some space from the image
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,  // Circular shape
    marginRight: 12,  // Right margin for spacing between image and text
  },
  username: {
    fontWeight: 'bold',
    color: '#1bd40b',  // Bright green for visibility and design consistency
    fontSize: 18,  // Slightly larger for better readability
  },
  caption: {
    color: 'white',
    fontSize: 16,  // Standard size for body text
    flexShrink: 1,  // Allow text to shrink to avoid overflowing
  },
  date: {
    color: 'gray',  // Less emphasis on date
    fontSize: 12,  // Smaller font size for less importance
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',  // Clear background to reduce visual clutter
    borderRadius: 20,  // Rounded corners for a more modern look
    paddingVertical: 25,  // Consistent padding around icons
    marginTop: 10,  // Space between icon wrappers if stacked
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4, // Space between icon and text
  },
});

export default MediaPlayer;
