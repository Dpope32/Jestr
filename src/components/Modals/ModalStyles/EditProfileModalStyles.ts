import { StyleSheet } from 'react-native';

export default StyleSheet.create({

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    color: '#FFF',
  },
  input: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#FFF',
  },
  centeredText: {
    textAlign: 'center',
  },
  saveButton: {
    width: '25%',
    alignSelf: 'flex-end',
    backgroundColor: '#1bd40b',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  label: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderImage: {
    width: '100%',
    height: 100,
    marginBottom: -50,
  },
  profileImageContainer: {
    alignItems: 'center',
    position: 'relative',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 3,
  },
});

