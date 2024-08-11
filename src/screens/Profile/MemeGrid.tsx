import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem as FlashListRenderItem } from '@shopify/flash-list';
import { Meme } from '../../types/types';

interface MemeGridProps {
  memes: Meme[];
  renderMeme: (item: Meme, index: number) => React.ReactElement;
  onLoadMore: () => void;
  onHeightChange: (height: number) => void;
  isLoading: boolean;
  onDeleteMeme: (memeID: string) => Promise<void>;
  onRemoveDownloadedMeme: (memeID: string) => Promise<void>;
  selectedTab: string;
}

const MemeGrid: React.FC<MemeGridProps> = ({ 
  memes, 
  renderMeme, 
  onLoadMore, 
  onHeightChange, 
  isLoading, 
  onDeleteMeme, 
  onRemoveDownloadedMeme, 
  selectedTab 
}) => {
  const [containerHeight, setContainerHeight] = useState(300);

  const handleContentSizeChange = useCallback((width: number, height: number) => {
    const newHeight = Math.max(300, Math.min(1200, height));
    setContainerHeight(newHeight);
    onHeightChange(newHeight);
  }, [onHeightChange]);

  const renderItemWrapper: FlashListRenderItem<Meme> = useCallback(({ item, index }) => {
    return renderMeme(item, index);
  }, [renderMeme]);

  return (
    <View style={[styles.container, { height: containerHeight }]}>
     <FlashList
  data={memes}
  renderItem={renderItemWrapper}
  keyExtractor={(item: Meme, index: number) => `${item.memeID}-${index}`}
        numColumns={3}
        estimatedItemSize={135}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={styles.flashListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
  },
  flashListContent: {
    paddingBottom: 20,
  },
});

export default React.memo(MemeGrid);