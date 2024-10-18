import { StyleSheet } from 'react-native';
import { COLORS } from '../../theme/theme';

const styles = StyleSheet.create({
  contentContainer: {
    position: 'absolute',
    flexDirection: 'column',
    right: 5,
  },
  profilePicContainer: {
    marginBottom: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  followButton: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: '#1bd40b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    zIndex: 10,
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 2,
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: COLORS.white,
  },
  overlay: {
    backgroundColor: 'red',
  },
  gradient: {
    alignItems: 'center',
  },
});

export default styles;
