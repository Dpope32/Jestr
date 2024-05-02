import { StyleSheet } from 'react-native';

export  const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00B040',
      },
      scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 70, // Adjust this to control the top and bottom spacing
        width: '100%',
      },
        titleContainer: {
            marginTop: 10, // Adjust the margin to control the title position
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          },
  titleLetter: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 30,
      },
        formContainer: {
          backgroundColor: 'rgba(255, 255, 255, 1.0)',
          borderRadius: 10,
          paddingHorizontal: 24,
          paddingVertical: 0,
          width: '90%', 
          maxWidth: 340, 
          alignSelf: 'center',
          borderWidth: 1,
          borderColor: '#ddd', 
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 7,
          },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 0,
          marginTop: 10, 
        },
        
        signupHeader: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#333',
          alignSelf: 'center',
          marginTop: 10,
        },
        profileContainer: {
          alignItems: 'center',
        },
        headerUploadContainer: {
          width: '100%',
          marginBottom: 30, 
        },
        profilePicUpload: {
          position: 'absolute',
          top: -45, 
          alignSelf: 'center',
          zIndex: 1,
        },
        errorMessage: {
          color: '#e63946', 
          fontSize: 14, 
          paddingVertical: 5,
        },
        buttonContainer: {
          width: '100%',
          marginTop: 10,
        },
        
        button: {
            borderRadius: 25,
            marginVertical: 10,
          },

        gradient: {
          height: 50, 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          color: '#fff',
          borderRadius: 25,
        },
        
        buttonText: {
            fontSize: 16,
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
            paddingHorizontal: 80,
          },
    
        toggleForm: {
          marginTop: 20,
        },
        toggleFormText: {
          color: '#007AFF',
          fontSize: 16,
          textAlign: 'center',
        },
        footer: {
          flexDirection: 'row',
          fontSize: 16,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.0)', 
        },
        footerLink: {
          fontSize: 16, 
          color: '#4A90E2',
        },
        footerDivider: {
          fontSize: 14,
          color: '#999',
          marginHorizontal: 5,
        },
        initialScreen: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20, // Adjusted for spacing
          },
          welcomeText: {
            fontSize: 42,
            fontWeight: 'bold',
            fontFamily: 'Lato-Bold',
            color: '#fff',
            marginBottom: 20,
            marginTop: -100,
            letterSpacing: 2,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 5,
          },
        available: {
          color: '#2ecc71', 
        },
        unavailable: {
          color: '#e74c3c', 
        },
        enhancedInputContainer: {
          marginBottom: 0,
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
          paddingHorizontal: 15,
          height: 50,
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
          marginVertical: 10,
        },
        checkbox: {
          marginRight: 10,
          borderRadius: 4, 
          borderWidth: 2, 
          borderColor: '#333',
        },
        termsText: {
          fontSize: 10,
          color: '#333',
        },
        socialHeaderText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 10, // Adjusted to move the text up
          },
          socialButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 15,
          },
          socialButton: {
            marginHorizontal: 40,
          },
          socialButtonIcon: {
            width: 60, // Adjusted size for better display
            height: 60, // Adjusted size for better display
          },
          separator: {
            height: 1,
            backgroundColor: '#fff',
            width: '100%',
            marginVertical: 60, // Adjusted to move everything up
          },
        

        profilePicUploadContainer: {
          position: 'absolute',
          top: -60, 
          alignSelf: 'center',
          zIndex: 1,
        },
      });