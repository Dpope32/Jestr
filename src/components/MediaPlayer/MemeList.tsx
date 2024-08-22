import React, { useCallback, useRef, useMemo } from 'react';
import { Dimensions, ViewToken, View, FlatList } from 'react-native';
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
  const flatListRef = useRef<FlatList>(null);

  const memoizedMemes = useMemo(() => memes, [memes]);

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndex(Math.min(currentMediaIndex + 1, memes.length - 1));
  }, [memes.length, setCurrentMediaIndex, currentMediaIndex]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndex(Math.max(currentMediaIndex - 1, 0));
  }, [setCurrentMediaIndex, currentMediaIndex]);

  const renderItem = useCallback(
    ({ item, index }: { item: Meme; index: number }) => (
      <MediaPlayer
        key={item.memeID}
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
        handleLike={() => {}}
        handleDownload={() => {}}
        likedIndices={new Set()}
        doubleLikedIndices={new Set()}
        downloadedIndices={new Set()}
        likeDislikeCounts={{}}
        currentMediaIndex={index}
        initialLikeStatus={{ liked: false, doubleLiked: false }}
        onLongPressStart={() => {}}
        onLongPressEnd={() => {}}
        currentUserId={currentUserId}
      />
    ),
    [user, isDarkMode, toggleCommentFeed, updateLikeStatus, goToPrevMedia, goToNextMedia, currentUserId, memes]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setCurrentMediaIndex(viewableItems[0].index);
      }
    },
    [setCurrentMediaIndex]
  );

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 50 }), []);

  return (
    <FlatList
      ref={flatListRef}
      data={memoizedMemes}
      renderItem={renderItem}
      keyExtractor={(item) => item.memeID}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled
      initialScrollIndex={Math.max(0, currentMediaIndex)}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
};

export default React.memo(MemeList);