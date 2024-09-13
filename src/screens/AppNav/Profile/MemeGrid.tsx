import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  FlashList,
  ListRenderItem as FlashListRenderItem,
} from '@shopify/flash-list';
import {Meme} from '../../../types/types';

interface MemeGridProps {
  memes: Meme[];
  renderMeme: (item: Meme, index: number) => React.ReactElement;
  onLoadMore: () => void;
  onHeightChange: (height: number) => void;
  isLoading: boolean;
  onDeleteMeme: (memeID: string) => Promise<void>;
  onRemoveDownloadedMeme: (memeID: string) => Promise<void>;
  selectedTab: string;
  itemSize: number;
}

const MemeGrid: React.FC<MemeGridProps> = ({
  memes,
  renderMeme,
  onLoadMore,
  onHeightChange,
  isLoading,
  onDeleteMeme,
  onRemoveDownloadedMeme,
  selectedTab,
  itemSize,
}) => {
  const [containerHeight, setContainerHeight] = useState(300);

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      const newHeight = Math.max(300, Math.min(1200, height));
      setContainerHeight(newHeight);
      onHeightChange(newHeight);
    },
    [onHeightChange],
  );

  const renderItemWrapper: FlashListRenderItem<Meme> = useCallback(
    ({item, index}) => {
      return renderMeme(item, index);
    },
    [renderMeme],
  );

  const renderSkeletonItem = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonInner} />
    </View>
  );

  return (
    <View style={styles.memeGridContainer}>
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonInner} />
              </View>
            ))}
        </View>
      ) : (
        <FlashList
          data={memes}
          renderItem={renderItemWrapper}
          keyExtractor={(item: Meme, index: number) =>
            `${item.memeID}-${index}`
          }
          numColumns={3}
          estimatedItemSize={itemSize}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.memeGrid}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  flashListContent: {
    paddingBottom: 0,
  },
  skeletonItem: {
    width: '33%',
    aspectRatio: 1,
    padding: 2,
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  memeGrid: {
    padding: 2,
  },
  skeletonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  memeGridContainer: {
    flex: 1,
  },
});

export default React.memo(MemeGrid);
