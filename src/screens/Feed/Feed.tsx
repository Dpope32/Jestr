import React, {useState, useCallback, useMemo} from 'react';
import {View, FlatList, ViewToken} from 'react-native';
import {ActivityIndicator, Dimensions} from 'react-native';
import {debounce} from 'lodash';
// import {useNavigation} from '@react-navigation/native';
// import * as Haptics from 'expo-haptics';

import {useTheme} from '../../theme/ThemeContext';
import {useMemes} from './useMemes';
import {useUserStore} from '../../store/userStore';
// import {fetchComments} from '../../components/Meme/memeService';

import MediaPlayer from '../../components/MediaPlayer/MediaPlayer';
import styles from './Feed.styles';
import {Meme, User} from '../../types/types';
import ProfilePanel from '../../components/Panels/ProfilePanel';
import {useTabBarStore} from '../../store/tabBarStore';
// import {FeedNavProp} from '../../navigation/NavTypes/FeedTypes';

// import {LoadingText} from '../../components/ErrorFallback/ErrorFallback';

const viewabilityConfig = {itemVisiblePercentThreshold: 50};
// const {height} = Dimensions.get('window');

const Feed = () => {
  // const navigation = useNavigation<FeedNavProp>();
  const {isDarkMode} = useTheme();

  const user = useUserStore(state => state as User);
  const setTabBarVisibility = useTabBarStore(
    state => state.setTabBarVisibility,
  );
  const setSidePanelVisibility = useTabBarStore(
    state => state.setSidePanelVisibility,
  );
  const isSidePanelVisible = useTabBarStore(state => state.isSidePanelVisible);

  const bgdColor = isDarkMode ? '#000' : '#1C1C1C';

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // == CUSTOM HOOK for DATA in LISTING ==
  const {memes, isLoading, error, fetchMoreMemes, fetchInitialMemes} =
    useMemes();

  // Debounced Fetch More Memes
  const debouncedFetchMoreMemes = useMemo(
    () => debounce(fetchMoreMemes, 500, {leading: true, trailing: false}),
    [fetchMoreMemes],
  );

  // Handle End Reached
  const handleEndReached = useCallback(() => {
    if (!isLoading && memes.length > 0) {
      debouncedFetchMoreMemes();
    }
  }, [isLoading, memes.length, debouncedFetchMoreMemes]);

  const onCloseSidePanel = () => {
    setTabBarVisibility(true);
    setSidePanelVisibility(false);
  };

  const setCurrentMediaIndexCallback = useCallback(
    (index: number) => {
      if (index >= 0 && index < memes.length) {
        setCurrentMediaIndex(index);
      }
    },
    [setCurrentMediaIndex],
  );

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

  const keyExtractor = (item: Meme | undefined, index: number) =>
    item?.memeID || `meme-${index}`;

  const goToNextMedia = useCallback(() => {
    setCurrentMediaIndexCallback(
      Math.min(currentMediaIndex + 1, memes.length - 1),
    );
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  const goToPrevMedia = useCallback(() => {
    setCurrentMediaIndexCallback(Math.max(currentMediaIndex - 1, 0));
  }, [currentMediaIndex, setCurrentMediaIndexCallback]);

  // == ITEM IN THE LIST ==
  const renderItem = ({
    item,
    index,
  }: {
    item: Meme | undefined;
    index: number;
  }) => {
    if (!item || !item.url) {
      return null;
    }

    // console.log('MemeList - Rendering item:', item);

    return (
      <MediaPlayer
        {...item}
        key={item.memeID}
        index={index}
        currentIndex={currentMediaIndex}
        //
        user={user}
        currentUserId={user.email}
        memeUser={item.memeUser || {}}
        //
        currentMedia={item.url}
        liked={item.liked ?? false}
        numOfComments={0}
        //
        goToPrevMedia={goToPrevMedia}
        goToNextMedia={goToNextMedia}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // TODO: should apply a linear gradient overlay for bottom half of screen
  return (
    <View style={[styles.container, {backgroundColor: bgdColor}]}>
      {/* == PROFILE SIDE PANEL == */}
      {isSidePanelVisible && (
        <ProfilePanel
          isVisible={isSidePanelVisible}
          onClose={onCloseSidePanel}
        />
      )}

      {/* add here what is <IconsAndContent /> */}
      {/* also <LongPressModal /> */}
      {/* also <ShareModal /> */}
      {/* also <SaveSuccessModal /> */}

      {/* == M E M E S  L I S T == */}
      <FlatList
        keyExtractor={keyExtractor}
        data={memes}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        style={{}}
        contentContainerStyle={{}}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default Feed;
