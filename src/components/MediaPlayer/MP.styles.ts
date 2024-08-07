import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, wp } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = height * 0.25;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
    backgroundColor: '#000',
  },
  memeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 160
  },
  blurContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    padding: 10,
  },
  textContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 120,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 10,
  },
  iconColumn: {
    position: 'absolute',
    right: 10,
    bottom: 120,
    alignItems: 'center',
  },
  memeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  followButton: {
    position: 'absolute',
    left: 35,
    top: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  followedButton: {
    backgroundColor: '#1bd40b',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
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
  // Define static parts of iconText style here
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  errorText: {
    fontSize: 20,
    color: '#ff0000',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastMessage: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 10,
  },
  toastManage: {
    color: '#1E90FF',
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default styles;
