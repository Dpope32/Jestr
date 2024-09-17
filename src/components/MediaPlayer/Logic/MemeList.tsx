import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Dimensions,
  ViewToken,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MediaPlayer from '../MediaPlayer';
import { Meme, MemeListProps } from '../../../types/types';

const { height } = Dimensions.get('window');

const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

const MemeList: React.FC<MemeListProps> = React.memo((props) => {
  const {
    memes,
    user,
    onEndReached,
    toggleCommentFeed,
    updateLikeStatus,
    currentMediaIndex,
    setCurrentMediaIndex,
    currentUserId,
    isLoadingMore,
    isCommentFeedVisible,
    numOfComments,
    handleMemeViewed,
  } = props;

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('Memes updated:', memes.length);
  }, [memes]);

  useEffect(() => {
    if (
      flatListRef.current &&
      currentMediaIndex >= 0 &&
      currentMediaIndex < memes.length
    ) {
      flatListRef.current.scrollToIndex({
        index: currentMediaIndex,
        animated: false,
      });
      console.log('Scrolling to meme index:', currentMediaIndex);
    }
  }, [currentMediaIndex, memes.length]);

  const handleMemeViewedRef = useRef(handleMemeViewed);
  useEffect(() => {
    handleMemeViewedRef.current = handleMemeViewed;
  }, [handleMemeViewed]);

  const setCurrentMediaIndexCallback = useCallback(
    (index: number) => {
      if (index >= 0 && index < memes.length) {
        console.log('Setting current media index to:', index);
        setCurrentMediaIndex(index);
        handleMemeViewedRef.current(memes[index].memeID);
      }
    },
    [setCurrentMediaIndex, memes]
  );

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndexCallback(
      Math.min(currentMediaIndex + 1, memes.length - 1)
    );
  }, [currentMediaIndex, setCurrentMediaIndexCallback, memes.length]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.max(currentMediaIndex - 1, 0));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const initialLikeStatus = useMemo(
    () => ({ liked: false, doubleLiked: false }),
    []
  );

  const noop = useCallback(() => {}, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Meme | undefined; index: number }) => {
      if (!item || !item.url) {
        return null;
      }

      console.log('Rendering meme at index:', index);

      const prevMedia = index > 0 ? memes[index - 1].url : null;
      const nextMedia = index < memes.length - 1 ? memes[index + 1].url : null;

      return (
        <MediaPlayer
          {...item}
          liked={item.liked ?? false}
          doubleLiked={item.doubleLiked ?? false}
          memeUser={item.memeUser || {}}
          currentMedia={item.url}
          user={user}
          toggleCommentFeed={toggleCommentFeed}
          goToPrevMedia={goToPrevMedia}
          goToNextMedia={goToNextMedia}
          onLikeStatusChange={updateLikeStatus}
          handleLike={noop}
          handleDownload={noop}
          prevMedia={prevMedia}
          nextMedia={nextMedia}
          currentMediaIndex={index}
          initialLikeStatus={initialLikeStatus}
          onLongPressStart={noop}
          onLongPressEnd={noop}
          currentUserId={currentUserId}
          isCommentFeedVisible={isCommentFeedVisible}
          index={index}
          currentIndex={currentMediaIndex}
          setCurrentIndex={setCurrentMediaIndex}
          numOfComments={numOfComments}
          onMemeViewed={() => handleMemeViewed(item.memeID)}
          memes={memes}
          likedIndices={new Set()} // Provide actual data
          doubleLikedIndices={new Set()}
          downloadedIndices={new Set()}
          likeDislikeCounts={{}}
        />
      );
    },
    [
      user,
      toggleCommentFeed,
      goToPrevMedia,
      goToNextMedia,
      updateLikeStatus,
      currentUserId,
      isCommentFeedVisible,
      numOfComments,
      handleMemeViewed,
      currentMediaIndex,
      setCurrentMediaIndex,
      initialLikeStatus,
      noop,
      memes,
    ]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        typeof viewableItems[0].index === 'number'
      ) {
        setCurrentMediaIndexCallback(viewableItems[0].index);
      }
    },
    [setCurrentMediaIndexCallback]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: Meme | undefined, index: number) =>
      item?.memeID || `meme-${index}`,
    []
  );

  return (
    <FlatList
      ref={flatListRef}
      data={memes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
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
      getItemLayout={getItemLayout}
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null
      }
      removeClippedSubviews={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21} // Increase from 11 to 21
    />
  );
});

export default MemeList;
