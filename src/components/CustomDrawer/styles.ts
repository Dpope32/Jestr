import {StyleSheet, Platform} from 'react-native';
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
    paddingVertical: 10,
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
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 26,
  },
  iconLabel: {
    color: '#fff',
    fontSize: 20,
    fontFamily: FONTS.regular,
    marginLeft: -30,
  },
  bottomContainer: {
    position: 'absolute',
    bottom:  25,
    fontFamily: FONTS.regular,
    left: 0,
    right: 0,
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
    justifyContent: 'flex-end',
    flex: 1,
  },
  darkModeIcon: {
    color: '#1bd40b',
    marginLeft: 10,
  },
});

export default styles;
