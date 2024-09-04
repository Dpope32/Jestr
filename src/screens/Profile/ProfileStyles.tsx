import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, wp, elevationShadowStyle, FONTS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
const itemSize = width / 3 - 4;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flexGrow: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 12, // Add left margin for spacing
    marginBottom: 4, // Add bottom margin in case of wrapping
  },
  statCount: {
    color: '#1bd40b',
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 11, // Reduced font size
    marginTop: 2,
  },
  headerContainer: {
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'absolute',
    left: '50%',
    bottom: -60,
    transform: [{ translateX: -70 }],
    borderWidth: 4,
    borderColor: '#1bd40b',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userInfoContainer: {
    alignItems: 'flex-start',
    marginTop: 70, // Increased to account for the profile picture
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 10,
  },
  displayName: {
    fontSize: 22, // Slightly reduced font size
    fontWeight: 'bold',
    color: '#1bd40b',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 14, // Slightly reduced font size
    color: '#AAAAAA',
    marginBottom: 15,
  },
  bioWrapper: {
    width: '100%',
    marginTop: -20, // Reduced from 10
    alignItems: 'flex-start',
    flexWrap: 'wrap', // Allow wrapping
  },
  bio: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 16,
  },
  nameContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    
  },
  numContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxWidth: '60%', // Limit width to ensure it doesn't push name off-screen
    marginTop: -20,
  },
  followInfo: {
    alignItems: 'center',
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
    marginLeft: 12, // Add left margin for spacing
    backgroundColor: 'rgba(27, 212, 11, 0.0)',
    borderRadius: 10,
  },
  jestrFor: {
    fontSize: 11, // Reduced font size
    color: '#b0b0b0', // Even brighter gray
  },
  jestrForDays: {
    fontSize: 14, // Reduced font size
    fontWeight: 'bold',
    color: '#1bd40b',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#222',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#1bd40b',
  },
  tabIcon: {
    color: '#a0a0a0', // Brighter gray color
  },
  activeTabIcon: {
    color: '#1bd40b', // Bright green color
  },
  tabLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#a0a0a0', // Brighter gray color
  },
  activeTabLabel: {
    color: '#1bd40b', // Bright green color
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
    marginTop: -20,
  },
  noMemesText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 0,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    marginTop: 10,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -100,
  },
  shareIcon: {
    position: 'absolute',
    top: -50,
    right: 50, 
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  memeGridContainer: {
    flex: 1,
    minHeight: 400,
  },
});