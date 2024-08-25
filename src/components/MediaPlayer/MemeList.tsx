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
  updateLikeStatus: (memeID: string, status: any, newLikeCount: number) => void;
  currentMediaIndex: number;
  setCurrentMediaIndex: (index: number) => void;
  currentUserId: string | undefined;
  isCommentFeedVisible: boolean;
  isProfilePanelVisible: boolean;
  isLoadingMore: boolean;
  numOfComments: number;
};

const MemeList: React.FC<MemeListProps> = React.memo(
  ({
    memes,
    user,
    isDarkMode,
    onEndReached,
    toggleCommentFeed,
    updateLikeStatus,
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
        console.log('MemeList - Rendering item:', item);

        return (
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
            prevMedia={index > 0 ? memesRef?.current[index - 1]?.url : null}
            nextMedia={
              index < memesRef?.current?.length - 1
                ? memesRef?.current[index + 1]?.url
                : null
            }
            handleLike={() => {}}
            handleDownload={() => {}}
            likedIndices={new Set()}
            doubleLikedIndices={new Set()}
            downloadedIndices={new Set()}
            likeDislikeCounts={{}}
            currentMediaIndex={index}
            initialLikeStatus={{liked: false, doubleLiked: false}}
            onLongPressStart={() => {}}
            onLongPressEnd={() => {}}
            currentUserId={currentUserId}
            isCommentFeedVisible={isCommentFeedVisible}
            isProfilePanelVisible={isProfilePanelVisible}
            index={index}
            currentIndex={currentMediaIndex}
            numOfComments={numOfComments}
          />
        );
      },
      [
        user,
        isDarkMode,
        toggleCommentFeed,
        updateLikeStatus,
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
        ListFooterComponent={ListFooterComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />
    );
  },
);

export default MemeList;
