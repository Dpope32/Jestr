import {StyleSheet, Dimensions, Platform} from 'react-native';
import {COLORS,FONT_SIZES,} from '../../../theme/theme';

const {width,} = Dimensions.get('window');
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
    marginLeft: 12,
    marginBottom: 3,
  },
  statCount: {
    color: '#1bd40b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 2,
  },
  headerContainer: {
    height: 200,
    marginTop: 0
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
    transform: [{translateX: -75}],
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
    alignItems: 'flex-start',
    marginTop: 70,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 10,
    paddingBottom: 20,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1bd40b',
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 15,
  },
  bioWrapper: {
    width: '100%',
    marginTop: -20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxWidth: '60%',
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
    marginLeft: 12,
    backgroundColor: 'rgba(27, 212, 11, 0.0)',
    borderRadius: 10,
  },
  jestrFor: {
    fontSize: 11,
    color: '#b0b0b0',
  },
  jestrForDays: {
    fontSize: 14,
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
    color: '#a0a0a0',
  },
  activeTabIcon: {
    color: '#1bd40b',
  },
  tabLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#a0a0a0',
  },
  activeTabLabel: {
    color: '#1bd40b',
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
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    
  },
  closeButton: {
    position: 'absolute',
    top: 140,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    zIndex: 2,
  },
  editButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    zIndex: 2,
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
    borderColor: '#FF0000',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: 'transparent',
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
    resizeMode: 'cover',
  },
  fullScreenHeaderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Keep this consistent to avoid conflicts
  },
  editButtonOverlay: {
    zIndex: 2,
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
    right: 10,
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
