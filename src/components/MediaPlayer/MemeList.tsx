import React, { useCallback, useRef, useMemo } from 'react';
import { Dimensions, ViewToken, FlatList } from 'react-native';
import MediaPlayer from './MediaPlayer';
import { Meme, User } from '../../types/types';

const { height } = Dimensions.get('window');

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

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
  isCommentFeedVisible: boolean;
  isProfilePanelVisible: boolean;
};

const MemeList: React.FC<MemeListProps> = React.memo(({
  memes,
  user,
  isDarkMode,
  onEndReached,
  toggleCommentFeed,
  updateLikeStatus,
  currentMediaIndex,
  setCurrentMediaIndex,
  currentUserId,
  isCommentFeedVisible,
  isProfilePanelVisible,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const memesRef = useRef(memes);

  const setCurrentMediaIndexCallback = useCallback((index: number) => {
    setCurrentMediaIndex(index);
  }, [setCurrentMediaIndex]);

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.min(currentMediaIndex + 1, memesRef.current.length - 1));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.max(currentMediaIndex - 1, 0));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

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
        prevMedia={index > 0 ? memesRef.current[index - 1].url : null}
        nextMedia={index < memesRef.current.length - 1 ? memesRef.current[index + 1].url : null}
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
        isCommentFeedVisible={isCommentFeedVisible}
        isProfilePanelVisible={isProfilePanelVisible}
      />
    ),
    [user, isDarkMode, toggleCommentFeed, updateLikeStatus, goToPrevMedia, goToNextMedia, currentUserId, isCommentFeedVisible, isProfilePanelVisible]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
        setCurrentMediaIndexCallback(viewableItems[0].index);
      }
    },
    [setCurrentMediaIndexCallback]
  );

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
      initialScrollIndex={Math.max(0, currentMediaIndex)}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={useCallback((_: any, index: number) => ({
        length: height,
        offset: height * index,
        index,
      }), [])}
    />
  );
});

export default MemeList;