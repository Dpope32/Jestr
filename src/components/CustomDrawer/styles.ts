import {StyleSheet} from 'react-native';
import {FONTS} from '../../theme/theme';

const styles = StyleSheet.create({
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
  icon: {
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    marginRight: 20,
  },
  navItemsCtr: {
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  iconLabel: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.regular,
    marginLeft: -35,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    fontFamily: FONTS.regular,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
