import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 10,
      },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalInput: {
    backgroundColor: '#444',
    color: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#1bd40b',
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#FFF',
    marginLeft: 10,
  },
  modalSaveButton: {
  backgroundColor: '#1bd40b',
  padding: 10,
  borderRadius: 5,
  alignItems: 'center',
},
modalSaveButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
modalProfileImage: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginBottom: 10,
},
modalHeaderImage: {
  width: '100%',
  height: 100,
  marginBottom: 10,
},
});
