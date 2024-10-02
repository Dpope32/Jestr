import React from 'react';
import {Animated, View, TouchableOpacity} from 'react-native';
import {Slide} from './componentData';
import {styles} from './styles';

interface PaginationProps {
  slides: Slide[];
  scrollX: Animated.Value;
  windowWidth: number;
  slideRef: React.RefObject<Animated.FlatList<Slide>>;
}

const Pagination: React.FC<PaginationProps> = ({
  slides,
  scrollX,
  windowWidth,
  slideRef,
}) => {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * windowWidth,
          index * windowWidth,
          (index + 1) * windowWidth,
        ];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1.4, 0.8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        return (
          <TouchableOpacity
            key={index.toString()}
            onPress={() =>
              slideRef.current?.scrollToIndex({index, animated: true})
            }>
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{scale}],
                  opacity,
                },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default Pagination;
