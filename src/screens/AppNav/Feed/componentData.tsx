import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  ViewToken,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {FONTS} from '../../../theme/theme';

export const {width: screenWidth, height: screenHeight} =
  Dimensions.get('window');

// console.log('Screen Height:', screenHeight);

export type ViewableItemsType = {
  viewableItems: ViewToken[];
  // changed: ViewToken[];
};

export const ListEmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTxt}>No memes available. Pull to refresh.</Text>
  </View>
);

export const LoadingComponent = ({style}: {style: ViewStyle}) => {
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
      <Text>Error: {error?.message || 'Something went wrong'}</Text>
      <Text>Please try again later.</Text>
    </View>
  );
};

export const NoDataComponent = ({style}: {style: ViewStyle}) => {
  return (
    <View style={[styles.loadingContainer, style]}>
      <Text style={{color: '#FFF', fontSize: 26}}>
        NO MEMES FROM BACKEND !!!
      </Text>
    </View>
  );
};

export const lottieStyle = {
  // position: 'absolute',
  // left: 0,
  // top: 0,
  width: 200,
  height: 200,
  // zindex: 1099990,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  flatlistStyle: {
    flex: 1,
    // borderWidth: 12,
    // borderColor: 'red',
    // backgroundColor: 'red',
  },
  contentCtrStyle: {
    flexGrow: 1,
    // borderWidth: 1,
    // borderColor: 'blue',
    // backgroundColor: 'green',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    fontFamily: FONTS.regular,
  },
  overlay: {
    top: '50%',
    // backgroundColor: 'red',
  },
  video: {
    width: '100%',
    height: '100%',
    // borderWidth: 3,
    // borderColor: 'blue',
  },
  imgContainer: {
    width: '100%',
    // height: '100%',
    // height: screenHeight,
    // borderWidth: 3,
    // borderColor: 'yellow',
    // backgroundColor: 'green',
  },
  errorContainer: {
    backgroundColor: 'gray',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
    color: '#FFF',
  },
  emptyTxt: {
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
});

export default styles;
