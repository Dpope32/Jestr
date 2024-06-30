import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const itemSize = width / 3 - 4; // 3 items per row with 1px margin

export default StyleSheet.create({
  memeContainer: {
    width: itemSize,
    height: itemSize,
    margin: 1,
  },
  memeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
memeCaption: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  padding: 5,
},
fullScreenImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'contain',
},
editButton: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: 25,
  padding: 10,
},
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},
editIcon: {
  color: '#000',
  fontSize: 20,
},
closeButton: {
  position: 'absolute',
  top: 40,
  right: 30,
  backgroundColor: 'rgba(255, 255, 255, 0.0)',
  borderRadius: 30,
  padding: 10,
},
closeButtonText: {
  color: 'red',
  fontSize: 20,
  fontWeight: 'bold',
},
memeStats: {
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 5,
  fontSize: 12,
},
memeGrid: {
  padding: 1,
  justifyContent: 'flex-start',
},
container: {
  flex: 1,
  backgroundColor: '#333',
},
  headerContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: 160,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    left: '50%',
    bottom: -40, // Adjust to elevate above the header
    transform: [{ translateX: -60 }],
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 50, // Adjusted for elevated profile image
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Maintain a bold, white color for emphasis
  },
  username: {
    fontSize: 20,
    color: '#ccc',
    marginBottom: 5,
  },
  bio: {
    fontSize: 18,
    color: '#aaa',
  },
  jestrFor: {
    fontSize: 16,
    color: '#aaa',
  },
  followInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  followInfo: {
    alignItems: 'center',
  },
  followCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  followLabel: {
    fontSize: 16,
    color: '#aaa',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    backgroundColor: '#444',
  },
  tabButton: {
    alignItems: 'center',
    padding: 10,
  },
  tabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  tabContent: {
    padding: 1,
    backgroundColor: '#333333',
  },
});
