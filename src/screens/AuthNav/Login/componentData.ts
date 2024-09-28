// src/screens/AuthNav/Login/LoginScreen.styles.ts
import { StyleSheet } from 'react-native';
import { SPACING, FONT_SIZES } from '../../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -SPACING.md * 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '85%', 
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md, 
    marginTop: SPACING.md,
    flexGrow: 1, 
  },
  input: {
    width: '100%',
    marginVertical: SPACING.sm, 
  },
  inputText: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: FONT_SIZES.md,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    borderRadius: 8,
  },
  signupHeader: {
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'white',
    alignSelf: 'center',
    paddingVertical: SPACING.lg,
  },
  button2: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#00ff00',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  toggleFormText: {
    color: '#007AFF',
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginVertical: SPACING.sm, 
    textDecorationLine: 'underline',
  },
  forgotPasswordText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: SPACING.sm, 
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  continueButtonsContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: SPACING.lg, // Adjusted to ensure spacing below
    marginTop: SPACING.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DADCE0',
    // Removed elevationShadowStyle
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    // Removed elevationShadowStyle
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: 10,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: SPACING.md, 
    // Optional: Adjust margin if needed to position correctly
  },
  socialButton: {
    width: 50, 
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // Removed elevationShadowStyle
  },
  socialButtonIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  footerLinksContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
});
