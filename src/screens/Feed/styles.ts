import {StyleSheet, Dimensions} from 'react-native';
import {FONTS} from '../../theme/theme';
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    // borderWidth: 1,
    // borderColor: 'yellow',
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
    // resizeMode: 'cover',

    // borderWidth: 3,
    // borderColor: 'red',
  },
  itemContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  // overlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   justifyContent: 'space-between',
  //   padding: 20,
  // },
});

export default styles;
