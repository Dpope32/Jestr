import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent, View, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem as FlashListRenderItem } from '@shopify/flash-list';
import { Meme } from '../../types/types';

interface MemeGridProps {
  memes: Meme[];
  renderMeme: (item: Meme, index: number) => React.ReactElement;
  onLoadMore: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const MemeGrid: React.FC<MemeGridProps> = React.memo(({ memes, renderMeme, onLoadMore, onLayout }) => {
  const [gridHeight, setGridHeight] = useState(300);
  const animatedHeight = useRef(new Animated.Value(300)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const listener = animatedHeight.addListener(({ value }) => setGridHeight(value));
    return () => animatedHeight.removeListener(listener);
  }, [animatedHeight]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const maxHeight = 900; // Assuming max height you want to expand to

    // Adjust the height based on the scroll position
    const newHeight = Math.max(300, Math.min(maxHeight, gridHeight + offsetY));
    console.log('gridHeight before moving', gridHeight)
    Animated.spring(animatedHeight, {
      toValue: newHeight,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    console.log('Scroll event: offsetY, maxHeight, newHeight', { offsetY, maxHeight, newHeight });
  }, [gridHeight, animatedHeight]);
  console.log('gridHeight after moving', gridHeight)
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    console.log('Content size changed:', { width, height });
    setContentHeight(height);
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    console.log('Container layout changed:', { height });
    setContainerHeight(height);
    if (onLayout) {
      onLayout(event);
    }
  }, [onLayout]);

  const renderItemWrapper: FlashListRenderItem<Meme> = useCallback(({ item, index }) => {
    return renderMeme(item, index);
  }, [renderMeme]);

 // console.log('MemeGrid render:', { contentHeight, gridHeight, memesCount: memes.length });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.animatedContainer, { height: animatedHeight }]}>
        <FlashList
          data={memes}
          renderItem={renderItemWrapper}
          keyExtractor={(item: Meme) => item.memeID}
          numColumns={3}
          estimatedItemSize={135}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={styles.flashListContent}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    maxHeight: 1200,
    backgroundColor: '#333',
    zIndex: 9999,
  },
  animatedContainer: {
    minHeight: 300,
    maxHeight: 1200,
  },
  flashListContent: {
    paddingBottom: 20, // Add some padding at the bottom
  },
});

export default MemeGrid;
