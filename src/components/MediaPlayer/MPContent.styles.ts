import {StyleSheet, Platform} from 'react-native';
import {Dimensions} from 'react-native';
import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  blurInner: {
    borderRadius: 12,
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dimmed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Ensure it's on top
    pointerEvents: 'none', // Add this line
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  memeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    position: 'absolute',
    left: 0,
    right: -12,
    bottom: -100,
    padding: 10,
    zIndex: 10,
    elevation: 10,
  },
  textContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 150 : 150,
    left: 0,
    right: 20,
    flexDirection: 'row',
    padding: 5,
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: Platform.OS === 'ios' ? 150 : 150,
  },
  iconColumn: {
    position: 'absolute',
    flexDirection: 'column',
    right: 0,
    zIndex: 10,
    paddingHorizontal: 0,
    gap: 0,
    bottom: Platform.OS === 'ios' ? 230 : 150,
    alignItems: 'center',
  },
  followButton: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: '#1bd40b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followedButton: {
    backgroundColor: '#1bd40b',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  longPressModal: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicContainer: {
    position: 'relative',
  },
  textContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  caption: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  prevPreviewImage: {
    top: '100%',
  },
  nextPreviewImage: {
    top: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    color: 'white', // Ensure the text color is white (or your desired color)
    textShadowColor: 'rgba(0, 0, 0, 0.7)', // Set shadow color
    textShadowOffset: { width: 1, height: 1 }, // Set offset for the shadow
    textShadowRadius: 3, // Set blur radius for the shadow
  },
});

export default styles;
