import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      },
      imageContainer: {
        width: '100%',
        height: 350,
        borderColor: '#00a100',
        borderWidth: 2,
      },
      image: {
        width: '100%',
        height: '100%',
      },
      
      tagInput: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        color: '#fff',
      },
      
      captionInput: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        color: '#fff',
      },
      actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
      },
      iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30, // Ensuring enough space for touchable area
        height: 30, // Same as above
        backgroundColor: 'transparent', // Set background color to transparent
        borderRadius: 20, // Circular buttons
      },
      icon: {
        color: '#FFFFFF',
        fontSize: 64, // Larger icons for better visibility
      },
      rotateLeftButton: {
        position: 'absolute',
        top: 5,
        left: 5,
      },
    
      rotateRightButton: {
        position: 'absolute',
        top: 5,
        right: 5,
      },
      placeholderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 350, // Match the height of your image container
        borderWidth: 2,
        borderColor: '#00a100',
        backgroundColor: '#e9e9e9', // A subtle background color
        borderRadius: 10, // Rounded corners if preferred
        margin: 10,
      },
    
      placeholderText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 10, // Space between the icon and text
      },
    
      placeholderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Ensures the image fits without stretching
      },
      buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 5,
      },
      editedImageContainer: {
        marginTop: 20,
        alignItems: 'center',
      },
      editedImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
      },
      uploadButton: {
        backgroundColor: '#007700',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
      },
      uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      brightnessContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      slider: {
        flex: 1,
        marginHorizontal: 10,
      },
      contrastContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
      },
      contrastText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
      },
      textOverlayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
      },
      textOverlayInput: {
        flex: 1,
        fontSize: 16,
        marginHorizontal: 10,
      },
      editingActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
      },
      uploadContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textOverlay: {
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
      },
      introContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      introText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        backgroundColor: '#00a100',
        borderRadius: 8,
        padding: 10,
      },
      removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 5,
      },
      removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      },
      editingContainer: {
        width: '100%',
        padding: 10,
      },
      
      editingToolsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginBottom: 10,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background
      },
      modalContent: {
        backgroundColor: '#333', // Dark grey background
        borderColor: '#00FF00', // Bright green border
        borderWidth: 2, // Set the thickness of the border
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
        color: '#FFFFFFF',
      },
      
      closeButton: {
        position: 'absolute',  // Positioning it to float over content
        top: 10,
        right: 10,
        backgroundColor: 'transparent',  // Transparent background
        padding: 2,
        borderRadius: 50,  // Circular button
      },
      closeButtonText: {
        color: '#ff0000',  // Red color for the text/icon
        fontSize: 16,
      },
      
      successText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#FFFFFF', // Set the text color to white
        paddingVertical: 10,
      },
      
      uploadedImage: {
        width: '100%',
        maxHeight: 300,  // Limiting image height
        marginVertical: 10,
      },
      shareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
      },
      shareButton: {
        backgroundColor: '#1e88e5',
        padding: 10,
        borderRadius: 5,
      },
    });

    export default styles;