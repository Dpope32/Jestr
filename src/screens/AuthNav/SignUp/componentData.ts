// src/screens/AuthNav/SignUp/SignUpScreen.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, FONT_SIZES } from '../../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'column',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md, 
    backgroundColor: 'transparent', 
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  contentContainer: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    marginTop: SPACING.sm * 5, 
    flexGrow: 1,
  },
  signupHeader: {
    fontSize: 35, 
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    paddingVertical: SPACING.md,
  },
  input: {
    width: '100%',
    marginVertical: SPACING.xs, 
  },
  inputText: {
    paddingVertical: 8, 
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.md,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    borderRadius: 8,
  },
  errorMessage: {
    color: '#ff4d4d',
    fontSize: 14,
    paddingVertical: SPACING.xs,
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs, 
    flexWrap: 'nowrap',
  },
  termsText: {
    color: '#BDBDBD',
    fontSize: FONT_SIZES.sm, // Reduced font size from FONT_SIZES.md to FONT_SIZES.sm
    textAlign: 'center',
    marginVertical: SPACING.xs, // Reduced margin from SPACING.sm to SPACING.xs
  },
  termsHighlight: {
    color: '#1bd40b',
  },
  button2: {
    width: '100%', // Ensures the button takes the full width of contentContainer
    height: 45, // Reduced height from 50 to 45
    borderRadius: 22.5, // Half of the new height for perfect rounding
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginVertical: SPACING.md, // Reduced vertical margin from SPACING.lg to SPACING.md
    justifyContent: 'center',
  },
  buttonText: {
    color: '#00ff00',
    fontSize: FONT_SIZES.md, // Adjusted font size to match the new button height
    fontWeight: 'bold',
  },
  toggleFormText: {
    color: '#007AFF',
    fontSize: FONT_SIZES.sm, // Reduced font size from FONT_SIZES.md to FONT_SIZES.sm
    textAlign: 'center',
    marginVertical: SPACING.xs, // Reduced margin from SPACING.sm to SPACING.xs
    textDecorationLine: 'underline',
  },
  continueButtonsContainer: {
    width: '100%', // Ensures consistency with contentContainer width
    alignSelf: 'center',
    marginBottom: SPACING.md, // Reduced bottom margin from 30 to SPACING.md
    marginTop: SPACING.sm, // Reduced top margin from 50 to SPACING.sm
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 8, // Reduced padding from 10 to 8
    paddingHorizontal: 10, // Reduced padding from 12 to 10
    marginBottom: 15, // Reduced margin from 20 to 15
    borderWidth: 1,
    borderColor: '#DADCE0',
    // Removed elevationShadowStyle to eliminate elevation
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 13, // Reduced font size from 14 to 13
    fontWeight: '500',
    marginLeft: 8, // Reduced margin from 10 to 8
  },
  buttonIcon: {
    marginRight: 8, // Reduced margin from 10 to 8
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingVertical: 8, 
    paddingHorizontal: 10,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 13, 
    fontWeight: '500',
    marginLeft: 8,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 20,
    bottom: 0,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: 8, 
    fontSize: FONT_SIZES.md, 
    fontWeight: 'bold',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '40%', 
    marginVertical: SPACING.sm, 
  },
  socialButton: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialButtonIcon: {
    width: 20, 
    height: 20, 
    resizeMode: 'contain',
  },
  footerLinksContainer: {
    width: '85%', 
    alignItems: 'center',
    marginBottom: 20, 
  },
});
