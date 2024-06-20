import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
  },
  headerContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    left: '50%',
    bottom: -50,
    transform: [{ translateX: -50 }],
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 18,
    color: '#aaa',
  },
  jestrFor: {
    fontSize: 14,
    color: '#aaa',
  },
  followInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  followInfo: {
    alignItems: 'center',
  },
  followCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  followLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#444',
  },
  tabButton: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  tabContent: {
    padding: 20,
    color: '#fff',
  },
});
