import {StyleSheet, Dimensions, Platform} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  wp,
  elevationShadowStyle,
  FONTS,
} from '../../../theme/theme';

const {width, height} = Dimensions.get('window');
const itemSize = width / 3 - 4;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    minHeight: height,
  },
  scrollView: {
    flexGrow: 1,
  },
  headerContainer: {
    position: 'relative',
    height: 220,
    zIndex: 10,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    left: '50%',
    bottom: -60,
    transform: [{translateX: -60}],
    borderWidth: 4,
    borderColor: '#1bd40b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1bd40b',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  username: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 10,
  },
  bioWrapper: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'flex-start', // Align items to the start (left)
    justifyContent: 'flex-start', // Justify content to start
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  followInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  followCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1bd40b',
  },
  followLabel: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  jestrForContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  jestrFor: {
    fontSize: 14,
    color: '#aaa',
  },
  jestrForDays: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1bd40b',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#222',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 10,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#1bd40b',
  },
  tabIcon: {
    color: '#888',
  },
  activeTabIcon: {
    color: '#000',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#888',
  },
  activeTabLabel: {
    color: '#000',
    fontWeight: 'bold',
  },
  memeGrid: {
    padding: 2,
  },
  memeContainer: {
    width: itemSize,
    height: itemSize,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  memeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  skeletonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  skeletonItem: {
    width: itemSize,
    height: itemSize,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  noMemesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noMemesText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -50,
    left: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(27, 212, 11, 0.2)',
    borderRadius: 20,
    zIndex: 20,
  },
  edit: {
    color: '#1bd40b',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  settingsIcon: {
    position: 'absolute',
    top: -50,
    right: 10,
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  fullScreenImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 25,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 25,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  editButtonOverlay: {
    zIndex: 2,
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 25,
    padding: 10,
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
  memeGridContainer: {
    flex: 1,
    minHeight: 500,
  },
});
