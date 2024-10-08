import {StyleSheet} from 'react-native';
// import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    flexDirection: 'column',
    right: 10,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',

    // borderWidth: 2,
    // borderColor: 'red',
  },
  profilePicContainer: {
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  followButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#1bd40b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default styles;
