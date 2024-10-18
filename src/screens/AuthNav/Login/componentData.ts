import { StyleSheet, Dimensions } from 'react-native';
import { SPACING, FONT_SIZES } from '../../../theme/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    flex: 1, 
  },

  scrollView: {
    flexGrow: 1,

  },
  input: {
    width: '100%',
  },
  inputText: {
    fontSize: Math.max(16, Math.min(FONT_SIZES.md, SCREEN_WIDTH * 0.045)),
    color: '#fff',

    borderRadius: 8,
  },
  signupHeader: {
    fontSize: Math.max(28, Math.min(35, SCREEN_WIDTH * 0.09)),
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    paddingVertical: SPACING.lg,
  },

  button2: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.06,
    borderRadius: SCREEN_HEIGHT * 0.035,
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#00ff00',
    fontSize: Math.max(16, Math.min(FONT_SIZES.md, SCREEN_WIDTH * 0.045)),
    fontWeight: 'bold',
  },
  toggleFormText: {
    color: '#007AFF',
    fontSize: Math.max(14, Math.min(FONT_SIZES.md, SCREEN_WIDTH * 0.04)),
    textAlign: 'center',
    marginVertical: -SPACING.sm,
    textDecorationLine: 'underline',
  },
  forgotPasswordText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: SPACING.sm,
    fontSize: Math.max(14, Math.min(FONT_SIZES.md, SCREEN_WIDTH * 0.04)),
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    color: '#757575',
    fontSize: Math.max(14, Math.min(16, SCREEN_WIDTH * 0.04)),
    fontWeight: '500',
    marginLeft: SPACING.sm,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    marginBottom: SPACING.sm,
    borderRadius: 4,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: Math.max(14, Math.min(16, SCREEN_WIDTH * 0.04)),
    fontWeight: '500',
    marginLeft: SPACING.sm,
  },
  blurView: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    bottom: -100,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: SPACING.sm,
    fontSize: Math.max(16, Math.min(FONT_SIZES.md, SCREEN_WIDTH * 0.045)),
    fontWeight: 'bold',
  },
  footerLinksContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
});