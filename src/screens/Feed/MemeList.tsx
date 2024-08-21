import React, { useCallback, useRef } from 'react';
import { Dimensions, Animated } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import { Meme, User } from '../../types/types';

const { height } = Dimensions.get('window');

type MemeListProps = {
    memes: Meme[];
    user: User | null;
    isDarkMode: boolean;
    onEndReached: () => void;
    toggleCommentFeed: () => void;
    updateLikeStatus: (memeID: string, status: any, newLikeCount: number) => void;
    goToPrevMedia: () => void;
    goToNextMedia: () => void;
    currentMediaIndex: number;
    currentUserId: string | undefined;
  };

    const translateY = useRef(new Animated.Value(0)).current;
const MemeList: React.FC<MemeListProps> = ({
  memes,
  user,
  isDarkMode,
  onEndReached,
  toggleCommentFeed,
  updateLikeStatus,
  goToPrevMedia,
  goToNextMedia,
  currentUserId,
}) => {
  const renderItem = useCallback(
    ({ item, index }: { item: Meme; index: number }) => (
      <MediaPlayer
        memeUser={{
          email: item.email,
          username: item.username,
          profilePic: item.profilePicUrl,
        }}
        currentMedia={item.url}
        mediaType={item.mediaType}
        goToPrevMedia={goToPrevMedia}
        goToNextMedia={goToNextMedia}
        username={item.username}
        caption={item.caption}
        uploadTimestamp={item.uploadTimestamp}
        handleLike={() => {}} // Implement this if needed
        handleDownload={() => {}} // Implement this if needed
        toggleCommentFeed={toggleCommentFeed}
        currentMediaIndex={index}
        user={user}
        likeCount={item.likeCount}
        downloadCount={item.downloadCount}
        commentCount={item.commentCount}
        shareCount={item.shareCount}
        profilePicUrl={item.profilePicUrl}
        memeID={item.memeID}
        liked={false} // You might want to manage this state
        doubleLiked={false} // You might want to manage this state
        isDarkMode={isDarkMode}
        onLikeStatusChange={updateLikeStatus}
        initialLikeStatus={{ liked: false, doubleLiked: false }}
        likedIndices={new Set()}
        doubleLikedIndices={new Set()}
        downloadedIndices={new Set()}
        likeDislikeCounts={{}}
        nextMedia={null}
        currentUserId={currentUserId}
        prevMedia={null}
        onLongPressStart={() => {}} // Add this line
        onLongPressEnd={() => {}} // Add this line
      />
    ),
    [user, isDarkMode, toggleCommentFeed, updateLikeStatus, goToPrevMedia, goToNextMedia]
  );

  return (
    <FlashList
      data={memes}
      renderItem={renderItem}
      estimatedItemSize={height}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      keyExtractor={(item) => item.memeID}
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled={true}
    />
  );
};

export default React.memo(MemeList);