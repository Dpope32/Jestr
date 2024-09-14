import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker background for better visibility
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#2C2C2E', // Darker background for better contrast
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: '#FFF',
  },
  centeredText: {
    textAlign: 'center',
  },
  saveButton: {
    width: '30%',
    alignSelf: 'flex-end',
    backgroundColor: '#1bd40b',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalHeaderImage: {
    width: '100%',  // Ensure it takes the full width
    height: 150,    // Set a proper height to avoid overlap
    resizeMode: 'contain',  // Maintain aspect ratio while covering the area
    position: 'relative',  // Relative positioning to avoid layout issues
    zIndex: 1,  // Ensure it stays below other elements
    backgroundColor: '#333', // Fallback background color for testing
  },
  profileImageContainer: {
    alignItems: 'center',
    position: 'absolute',  // Set absolute positioning to avoid moving other elements
    top: 100,  // Adjust this value as needed to avoid cutting into the header image
    zIndex: 2,  // Ensure the profile image stays above the header image
  },
  
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
});
