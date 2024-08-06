import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, wp, elevationShadowStyle, FONTS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
const itemSize = width / 3 - 4; // 3 items per row with 1px margin

export default StyleSheet.create({
  memeContainer: {
    width: itemSize,
    height: itemSize,
    margin: 1,
  },
  memeImage: {
    width: '100%',
    height: 150, // Adjust this value as needed
    borderRadius: 8,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
  },
  blurContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    marginTop: SPACING.md,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: height / 2 - 50,
    left: width / 2 - 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  height: '80%',
  margin: 20,
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
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
},
editIcon: {
  color: '#000',
  fontSize: 20,
},
interactionBar: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: 10,
},
caption: {
  padding: 10,
  color: 'white',
},
fullScreenContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)', // This will ensure a dim background even if BlurView doesn't work
},
interactionIcons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: 20,
},
  mediaPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
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
  backgroundColor: '#000',
  minHeight: '100%',
  zIndex: 10,
},
safeView: {
  marginBottom: 20,
  marginTop: 0
},
  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: 220,
  },
    bioWrapper: {
      width: '100%',
      marginVertical: 10,
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
    marginTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1bd40b',
    zIndex: 10,
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 10,
    zIndex: 10,
  },
  jestrFor: {
    fontSize: 14,
    color: '#aaa',
    zIndex: 10,
    marginTop: 0,
  },
  

    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 50,
      zIndex: 10,
      marginTop: 15,
      marginBottom: 10,
    },
    followInfo: {
      alignItems: 'center',
      zIndex: 10,
    },
    followCount: {
      fontSize: 18,
      fontWeight: 'bold',
      zIndex: 10,
      color: '#fff',
    },
    followLabel: {
      zIndex: 10,
      fontSize: 14,
      color: '#aaa',
    },
    jestrForContainer: {
      alignItems: 'center',
    },
    jestrForDays: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1bd40b',
      paddingBottom: 10,
    },
  followInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 10,
    marginBottom: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 0,
    backgroundColor: '#444',
    zIndex: 10,
  },
  tabContent: {
    padding: 0,
    zIndex: 10,
    backgroundColor: '#333333',
  },
  tabButton: {
    zIndex: 10,
    alignItems: 'center',
    padding: 10,
  },
  activeTabButton: {
    backgroundColor: '#444',
    zIndex: 10,
  },
  tabIcon: {
    color: '#888', // Default color
  },
  activeTabIcon: {
    color: '#1bd40b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    marginTop: 0,
    color: '#888',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noMemesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMemesText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  editProfileButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    padding: 10,
    top: -40,
    left: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  editProfileText: {
    color: '#1bd40b',
    marginLeft: 10,
  },
  
  fullScreenProfileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  fullScreenHeaderImage: {
    width: '100%',
    height: '50%',
  },
  edit: {
    color : 'green',
    marginLeft: 10,
  },
});
