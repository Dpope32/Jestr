import {StyleSheet} from 'react-native';
import {COLORS} from '../../../theme/theme';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 70,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  icon: {
    marginRight: 16,
    color: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  arrowIcon: {
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 95,
    marginRight: 10,
  },
  logoutButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    marginTop: 60,
    width: 200,
  },
  logoutText: {
    color: '#FFFFFF',
  },
  logoutIcon: {
    color: '#1bd40b',
  },
});
