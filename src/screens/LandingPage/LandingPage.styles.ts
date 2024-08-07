import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 0,
    borderRadius: 20,
  },
  formContainer1: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    marginTop: 60,
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
    height: 100, // Ensure enough space for the animation
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    paddingVertical: 20,
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
  termsText: {
    fontSize: 12,
    color: '#111',
    marginVertical: 6,
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
  socialContainer: {
    width: '110%',
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  socialButton: {
    width: 60,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonsContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 36,
    marginBottom: 10,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText2: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputFieldsContainer: {
    marginTop: 30,
  },
  inputField: {
    height: 30,
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
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
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
