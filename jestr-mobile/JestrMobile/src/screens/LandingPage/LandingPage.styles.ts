import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',  // Changed from 'center' to 'flex-start'
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    paddingBottom: 40,  // Adjust this value as needed to move the content up
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoStyle: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 5,
    marginRight: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Added margin bottom to create space between title and form
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  titleLetter: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Helvetica Neue',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 20, // Reduced margin to move the letters up
    marginBottom: 60, // Increased margin top to create space between title and form
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  authContainer: {
    borderWidth: 2,
    borderColor: '#00e100',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(85, 85, 85, 0.95)', // Slightly darker gray with high transparency
    borderColor: '#00FF00',
    borderRadius: 20,
    width: '90%',
    paddingHorizontal: 20, // Added padding for internal spacing
    maxWidth: 360,
    alignSelf: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, // Increased opacity for more pronounced shadow
    shadowRadius: 10,
    elevation: 10, // Increased elevation for more depth
  },
  divider: {
    height: 2, // Ensure this is sufficient to be visible
    backgroundColor: '#red', // Change color to white for maximum contrast
    width: '85%', // Ensure it's less than the container width to see the edges
    alignSelf: 'center', // Center align in the container
  },
  signupHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    paddingTop: 20,
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
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 48,
    justifyContent: 'center',
    width: '80%',
    alignSelf: 'center',
    opacity: 0.9,
  },
  buttonPress: {
    opacity: 1, // Brighter on press
  },
  gradient1: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    color: '#fff',
    marginBottom: 0,
    borderRadius: 25,
    paddingHorizontal: 60,
  },
  gradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    color: '#fff',
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleForm: {
    marginTop: 20,
  },
  
  toggleFormText: {
    color: '#007AFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    textDecorationLine: 'underline',  // This will underline the text
  },
  footer: {
    flexDirection: 'row',
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerLink: {
    fontSize: 14,
    color: '#a0a0a0',
    paddingHorizontal: 10,
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
    backgroundColor: '#1C1C1C',
    paddingBottom: 40,  // Adjust this value as needed to move the content up
  },
  welcomeText: {
    fontSize: 44,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 30,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  available: {
    color: '#2ecc71',
  },
  unavailable: {
    color: '#e74c3c',
  },
  enhancedInputContainer: {
    marginBottom: 5,
    marginHorizontal: 15,
  },
  enhancedInputLabel: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  enhancedInput: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)', // subtle border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
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
    marginTop: 15,
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333',
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#111',
    marginVertical: 10,
  },
  socialHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  socialButton: {
    width: 40,
    height: 40,
    marginHorizontal: 20,
    opacity: 0.9,
  },
  socialButtonIcon: {
    width: 60,
    height: 60,
  },
  separator: {
    height: 1,
    backgroundColor: '#fff',
    width: '80%',
    marginVertical: 15,
  },
  twitterButton: {
    tintColor: '#1DA1F2',
  },
  appleButton: {
    marginTop: 0,
    width: 40,
    height: 40,
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  inputFieldsContainer: {
    marginTop: 50,
  },
  inputField: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 55,
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
    height: 50,
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
