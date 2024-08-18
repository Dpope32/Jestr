import React, { useCallback, useRef } from 'react';
import { Dimensions, FlatList, ViewToken } from 'react-native';
import MediaPlayer from './MediaPlayer';
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
  setCurrentMediaIndex: (index: number) => void;
};

const MemeList: React.FC<MemeListProps> = ({
  memes,
  user,
  isDarkMode,
  onEndReached,
  toggleCommentFeed,
  updateLikeStatus,
  goToPrevMedia,
  goToNextMedia,
  currentMediaIndex,
  setCurrentMediaIndex,
}) => {
  const flatListRef = useRef<FlatList>(null);

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
        handleLike={() => {}}
        handleDownload={() => {}}
        toggleCommentFeed={toggleCommentFeed}
        currentMediaIndex={index}
        user={user}
        likeCount={item.likeCount}
        downloadCount={item.downloadCount}
        commentCount={item.commentCount}
        shareCount={item.shareCount}
        profilePicUrl={item.profilePicUrl}
        memeID={item.memeID}
        liked={false}
        doubleLiked={false}
        isDarkMode={isDarkMode}
        onLikeStatusChange={updateLikeStatus}
        initialLikeStatus={{ liked: false, doubleLiked: false }}
        likedIndices={new Set()}
        doubleLikedIndices={new Set()}
        downloadedIndices={new Set()}
        likeDislikeCounts={{}}
        nextMedia={null}
        prevMedia={null}
      />
    ),
    [user, isDarkMode, toggleCommentFeed, updateLikeStatus, goToPrevMedia, goToNextMedia]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentMediaIndex(viewableItems[0].index || 0);
      }
    },
    [setCurrentMediaIndex]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <FlatList
      ref={flatListRef}
      data={memes}
      renderItem={renderItem}
      keyExtractor={(item) => item.memeID}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled
      initialScrollIndex={currentMediaIndex}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
};

export default React.memo(MemeList);