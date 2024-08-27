import {StyleSheet, Dimensions, Platform} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  wp,
  elevationShadowStyle,
  FONTS,
} from '../../theme/theme';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  profilePanel: {
    position: 'absolute',
    width: width * 0.7,
    height: height * 1.08,
    left: 0,
    top: 0,
    bottom: Platform.OS === 'ios' ? 20 : 0,
    zIndex: 390000,
    elevation: 1000000000000,
    marginTop: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    fontFamily: FONTS.regular,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonIcon: {
    color: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 80,
    fontFamily: FONTS.regular,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1bd40b',
  },
  userInfoContainer: {
    marginTop: 15,
    alignItems: 'center',
    fontFamily: FONTS.regular,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  username: {
    fontSize: 16,
    color: '#1bd40b',
    marginTop: 5,
    fontFamily: FONTS.regular,
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  followCount: {
    alignItems: 'center',
    fontFamily: FONTS.regular,
  },
  followValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.regular,
  },
  followLabel: {
    color: '#1bd40b',
    fontSize: 14,
    marginTop: 5,
    fontFamily: FONTS.regular,
  },
  iconSection: {
    marginTop: 30,
    fontFamily: FONTS.regular,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    fontFamily: FONTS.regular,
    paddingHorizontal: 30,
  },
  icon: {
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    marginRight: 20,
  },
  iconLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.regular,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    // bottom: Platform.OS === 'ios' ? 200 : 20,
    fontFamily: FONTS.regular,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  signoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signoutIcon: {
    color: '#FF6B6B',
    marginRight: 10,
  },
  signoutText: {
    color: '#FF6B6B',
    fontFamily: FONTS.regular,
    fontSize: 18,
  },
  darkModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeIcon: {
    color: '#1bd40b',
    marginLeft: 10,
  },
});

export default styles;
