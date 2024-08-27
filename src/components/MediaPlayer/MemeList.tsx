import React, {useCallback, useRef, useEffect} from 'react';
import {Dimensions, ViewToken, FlatList, ActivityIndicator} from 'react-native';

import MediaPlayer from './MediaPlayer';
import {Meme, User} from '../../types/types';

const {height} = Dimensions.get('window');

const viewabilityConfig = {itemVisiblePercentThreshold: 50};

type MemeListProps = {
  memes: Meme[];
  user: User | null;
  isDarkMode: boolean;
  onEndReached: () => void;
  toggleCommentFeed: () => void;
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  currentUserId: string | undefined;
  isCommentFeedVisible: boolean;
  isProfilePanelVisible: boolean;
  isLoadingMore: boolean;
  numOfComments: number;
};

const MemeList: React.FC<MemeListProps> = ({
  memes,
  user,
  isDarkMode,
  onEndReached,
  toggleCommentFeed,
  currentMediaIndex,
  setCurrentMediaIndex,
  currentUserId,
  isLoadingMore,
  isCommentFeedVisible,
  isProfilePanelVisible,
  numOfComments,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const memesRef = useRef(memes);

  // console.log('MemeList - Rendering MemeList with', memes);

  useEffect(() => {
    // console.log('MemeList - Received memes:', memes.length);
    memesRef.current = memes;
  }, [memes]);

  // useEffect(() => {
  //   //   console.log('MemeList - Current media index changed:', currentMediaIndex);
  //   if (
  //     flatListRef.current &&
  //     currentMediaIndex >= 0 &&
  //     currentMediaIndex < memes.length
  //   ) {
  //     flatListRef.current.scrollToIndex({
  //       index: currentMediaIndex,
  //       animated: false,
  //     });
  //   }
  // }, [currentMediaIndex, memes.length]);

  const setCurrentMediaIndexCallback = useCallback(
    (index: number) => {
      if (index >= 0 && index < memesRef.current.length) {
        setCurrentMediaIndex(index);
      }
    },
    [setCurrentMediaIndex],
  );

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndexCallback(
      Math.min(currentMediaIndex + 1, memesRef.current.length - 1),
    );
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.max(currentMediaIndex - 1, 0));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (
        viewableItems.length > 0 &&
        typeof viewableItems[0].index === 'number'
      ) {
        setCurrentMediaIndexCallback(viewableItems[0].index);
      }
    },
    [setCurrentMediaIndexCallback],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  const keyExtractor = (item: Meme | undefined, index: number) =>
    item?.memeID || `meme-${index}`;

  const ListFooterComponent = useCallback(() => {
    return isLoadingMore ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : null;
  }, [isLoadingMore]);

  // == ITEM IN THE LIST ==
  const renderItem = useCallback(
    ({item, index}: {item: Meme | undefined; index: number}) => {
      if (!item || !item.url) {
        return null;
      }

      // console.log('MemeList - memesRef.current[index]', memesRef?.current);
      // console.log('MemeList - Rendering item:', item);

      return (
        <MediaPlayer
          {...item}
          key={item.memeID}
          index={index}
          currentIndex={currentMediaIndex}
          //
          user={user}
          currentUserId={currentUserId}
          memeUser={item.memeUser || {}}
          //
          currentMedia={item.url}
          liked={item.liked ?? false}
          numOfComments={numOfComments}
          //
          goToPrevMedia={goToPrevMedia}
          goToNextMedia={goToNextMedia}
          toggleCommentFeed={toggleCommentFeed}
        />
      );
    },
    [
      user,
      isDarkMode,
      toggleCommentFeed,
      currentMediaIndex,
      setCurrentMediaIndex,
      currentUserId,
      isCommentFeedVisible,
      isProfilePanelVisible,
      goToPrevMedia,
      goToNextMedia,
    ],
  );

  return (
    <FlatList
      style={{}}
      contentContainerStyle={{}}
      keyExtractor={keyExtractor}
      data={memes}
      renderItem={renderItem}
      initialScrollIndex={Math.max(0, currentMediaIndex)}
      initialNumToRender={2}
      ref={flatListRef}
      windowSize={5}
      maxToRenderPerBatch={3}
      getItemLayout={getItemLayout}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      pagingEnabled
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

export default MemeList;
