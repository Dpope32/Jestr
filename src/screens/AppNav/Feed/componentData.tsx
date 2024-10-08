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
    height: screenHeight,
    // width: screenWidth,
    // zIndex: 108740,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  mediaCtr: {
    // flex: 1,
    width: screenWidth,
    height: screenHeight,
    // zIndex: 108740,
    // borderWidth: 1,
    // borderColor: 'red',
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
    height: '100%',
    // borderWidth: 3,
    // borderColor: 'red',
    // backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    backgroundColor: 'gray',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default styles;
