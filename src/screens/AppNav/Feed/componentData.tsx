import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  ViewToken,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { FONTS } from '../../../theme/theme';

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type ViewableItemsType = {
  viewableItems: ViewToken[];
};

export const ListEmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTxt}>No memes available. Pull to refresh.</Text>
  </View>
);

export const LoadingComponent = ({ style }: { style: ViewStyle }) => {
  console.log('Loading...STATUS IS PENDING');
  return (
    <View style={[styles.loadingContainer, style]}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

export const ErrorComponent = ({
  error,
  style,
}: {
  error: Error;
  style: ViewStyle;
}) => {
  console.log('ERROR FEED QUERY:', error);
  return (
    <View style={[styles.errorContainer, style]}>
      <Text style={styles.errorText}>Error: {error?.message || 'Something went wrong'}</Text>
      <Text style={styles.errorText}>Please try again later.</Text>
    </View>
  );
};

export const NoDataComponent = ({ style }: { style: ViewStyle }) => {
  return (
    <View style={[styles.loadingContainer, style]}>
      <Text style={styles.noDataText}>NO MEMES AVAILABLE!</Text>
    </View>
  );
};

export const lottieStyle = {
  width: 150,
  height: 150,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex:1
  },
  flatlistStyle: {
    flex: 1,
  },
  contentCtrStyle: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    fontFamily: FONTS.regular,
  },
  overlay: {
    position: 'absolute',
    top: '50%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  imgContainer: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
  },
  emptyTxt: {
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  noDataText: {
    color: '#FFF',
    fontSize: 26,
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
});

export default styles;
