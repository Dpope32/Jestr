import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, wp, elevationShadowStyle, FONTS } from '../../theme/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
        backgroundColor: '#000',
    zIndex: 5
  },
  allMemesViewedText: {
    color: 'white',
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  flash: {
    flex: 1,
  },
  centerEverything: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  topPanelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mediaPlayerContainer: {
    flex: 1,
    marginTop: 0, // Adjust based on your top panel height
    marginBottom: 0, // Adjust based on your bottom panel height
  },
  bottomPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensure this is lower than profilePanelContainer
    elevation: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  profilePanelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20, // Ensure this is higher than bottomPanelContainer
    elevation: 20,
  },
  noMemesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C', // Dark background
    padding: SPACING.lg,
    fontFamily: FONTS.regular,
    marginBottom: 160
  },
  noMemesText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#1bd40b', // Bright green color
    textAlign: 'center',
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  noMemesSubText: {
    fontSize: FONT_SIZES.md,
    color: '#FFFFFF', // White color
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: FONTS.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    fontFamily: FONTS.regular,
  },
  lottieAnimation: {
    width: wp(50),
    height: wp(50),
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    fontFamily: FONTS.regular,
    marginTop: SPACING.md,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullScreenBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicatorContainer: {
    ...elevationShadowStyle(5),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: wp(10),
    width: wp(30),
    height: wp(30),
    backgroundColor: 'transparent',
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    fontFamily: FONTS.regular,
  },
  darkScrollViewContainer: {
    backgroundColor: '#000',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  cardMedia: {
    width: '100%',
    aspectRatio: 16 / 9,
    resizeMode: 'cover',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: SPACING.sm,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: wp(2),
    marginBottom: SPACING.md,
    ...elevationShadowStyle(3),
  },
  navigationButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: wp(10),
    padding: SPACING.sm,
  },
  prev: {
    left: SPACING.sm,
  },
  next: {
    right: SPACING.sm,
  },
  bottomIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: wp(5),
    position: 'absolute',
    top: SPACING.md,
    fontFamily: FONTS.regular,
    right: SPACING.md,
  },
  profilePic: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: SPACING.xs,
  },
  username: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  errorDetails: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontFamily: FONTS.regular,
    paddingHorizontal: SPACING.md,
  },
});


export default styles;
