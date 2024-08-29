import {StyleSheet, Platform} from 'react-native';
import {Dimensions} from 'react-native';
import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   // height: height,
  //   // width: width,
  //   // justifyContent: 'center',
  //   // alignItems: 'center',

  //   // borderWidth: 2,
  //   // borderColor: 'yellow',
  // },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  imgContainer: {
    // width: '100%',
    // height: '100%',
    // resizeMode: 'cover',
  },
  videoContainer: {
    // alignItems: 'center',
    // width: '100%',
    // height: '100%',
    // backgroundColor: '#FFF',
    // borderWidth: 2,
    // borderColor: 'red',
  },
  video: {
    width: '100%',
    height: '100%',

    // borderWidth: 3,
    // borderColor: 'blue',
  },
  errorText: {
    fontSize: 20,
    color: '#ff0000',
  },
});

export default styles;
