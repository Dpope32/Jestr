import React, { useCallback, useRef } from 'react';
import { Dimensions, FlatList, ViewToken, ListRenderItem } from 'react-native';
import MediaPlayer from './MediaPlayer';
import { Meme, User, MediaPlayerProps } from '../../types/types';

const { height } = Dimensions.get('window');

type MemeListProps = {
  memes: Meme[];
  user: User | null;
  isDarkMode: boolean;
  onEndReached: () => void;
  toggleCommentFeed: () => void;
  updateLikeStatus: (memeID: string, status: any, newLikeCount: number) => void;
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  currentUserId: string | undefined;
};

const MemeList: React.FC<MemeListProps> = ({
  memes,
  user,
  isDarkMode,
  onEndReached,
  toggleCommentFeed,
  updateLikeStatus,
  currentMediaIndex,
  setCurrentMediaIndex,
  currentUserId,
}) => {
  const flatListRef = useRef<FlatList<Meme>>(null);

  const goToNextMedia = useCallback(() => {
    if (currentMediaIndex < memes.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  }, [currentMediaIndex, memes.length, setCurrentMediaIndex]);

  const goToPrevMedia = useCallback(() => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  }, [currentMediaIndex, setCurrentMediaIndex]);

  const renderItem: ListRenderItem<Meme> = useCallback(
    ({ item, index }) => (
      <MediaPlayer
        {...item}
        liked={item.liked ?? false}
        doubleLiked={item.doubleLiked ?? false}
        memeUser={item.memeUser || {}}
        currentMedia={item.url}
        user={user}
        isDarkMode={isDarkMode}
        toggleCommentFeed={toggleCommentFeed}
        goToPrevMedia={goToPrevMedia}
        goToNextMedia={goToNextMedia}
        onLikeStatusChange={updateLikeStatus}
        prevMedia={index > 0 ? memes[index - 1].url : null}
        nextMedia={index < memes.length - 1 ? memes[index + 1].url : null}
        handleLike={() => {}}  // Placeholder, should be handled inside MediaPlayer
        handleDownload={() => {}}  // Placeholder, should be handled inside MediaPlayer
        likedIndices={new Set()}  // Placeholder, should be handled inside MediaPlayer
        doubleLikedIndices={new Set()}  // Placeholder, should be handled inside MediaPlayer
        downloadedIndices={new Set()}  // Placeholder, should be handled inside MediaPlayer
        likeDislikeCounts={{}}  // Placeholder, should be handled inside MediaPlayer
        currentMediaIndex={index}
        initialLikeStatus={{ liked: false, doubleLiked: false }}
        onLongPressStart={() => {}}
        onLongPressEnd={() => {}}
      />
    ),
    [memes, user, isDarkMode, toggleCommentFeed, updateLikeStatus, goToPrevMedia, goToNextMedia]
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
      keyExtractor={(item: Meme) => item.memeID}
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