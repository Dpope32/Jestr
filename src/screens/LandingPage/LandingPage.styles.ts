import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    borderRadius: 20,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40, // Add this line
    overflow: 'hidden',  // Add this line to ensure content doesn't overflow the rounded corners
    zIndex: 1000,
  },
  termsText: {
    color: '#BDBDBD',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  termsHighlight: {
    color: '#1bd40b',
  },
  forgotPasswordText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  formContainer1: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '97%', 
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 40,
    paddingHorizontal: 20,
    marginBottom: 4,
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  loadingText: {
    color: '#00ff00',
    marginTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
  },
  logoStyle: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  logo: {
    width: 120,
    height: 120,
    marginRight: 16,
    alignSelf: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    height: 50, // Ensure enough space for the animation
  },
  titleLetter: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  formContainer: {
    marginTop: -30,
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 2, // Added padding for internal spacing
    alignSelf: 'center',
  },
  divider: {
    height: 1, // Ensure this is sufficient to be visible
    backgroundColor: '#fff', // Change color to white for maximum contrast
    width: '100%', // Ensure it's less than the container width to see the edges
    alignSelf: 'center', // Center align in the container
  },
  signupHeader: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 20,
  },
  signupScrollViewContainer: {
    marginTop: 100,
  },
  headerUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  profilePicUpload: {
    position: 'absolute',
    top: -45,
    alignSelf: 'center',
    zIndex: 1,
  },
  errorMessage: {
    color: '#ff4d4d',
    fontSize: 14,
    paddingVertical: 10,
  },
  button: {
    width: '100%',
    height: 80,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ff00', // Bright green border
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 60,
  },
  button2: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ff00', // Bright green border
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
    paddingHorizontal: 60,
    justifyContent: 'center',
  },
  buttonPress: {
    opacity: 1, // Brighter on press
  },
  gradient1: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    borderRadius: 25,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleForm: {
    marginTop: 10,
  },
  toggleFormText: {
    color: '#007AFF',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',  // This will underline the text
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    paddingBottom: 20,
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  footerDivider: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 5,
  },
  initialScreen: {
    flex: 1,
    justifyContent: 'flex-start',  // Changed from 'center' to 'flex-start'
    alignItems: 'center',
    paddingHorizontal: 76,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff', // Bright white for maximum contrast
    textShadowColor: 'rgba(0, 255, 0, 0.5)', 
    marginBottom: 40,
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  available: {
    color: '#2ecc71',
  },
  unavailable: {
    color: '#e74c3c',
  },
  enhancedInputContainer: {
    marginBottom: 10,
    marginHorizontal: 15,
  },
  enhancedInputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  enhancedInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  uniformButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  socialHeaderText: {
     color: '#cccccc',
    fontSize: 16,
    marginBottom: 15,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignSelf: 'center',
  },
  socialButtonIcon: {
    width: 60,
    height: 60,
    marginBottom: -10
    },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginVertical: 20,
  },
  twitterButton: {
    tintColor: '#1DA1F2',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: -150,
    
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonsContainer: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 50
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText1: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonText2: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputFieldsContainer: {
    marginTop: 20,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 35,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
    color: '#ccc',
    fontSize: 20,
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profilePicUploadContainer: {
    position: 'absolute',
    top: -70,
    alignSelf: 'center',
    zIndex: 1,
  },
});
