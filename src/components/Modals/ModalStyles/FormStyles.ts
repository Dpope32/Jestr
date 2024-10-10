// src/Modals/ModalStyles/FormStyles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/theme';

export const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'transparent',
    padding: 25,
    borderRadius: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 10, // Adjust for space between header and title
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 5,
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 5,
    textAlign: 'center',
  },
  inputField: {
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 25,
    position: 'relative',
  },
  messageInput: {
    borderRadius: 8,
    color: COLORS.text,
    padding: 8,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 12,
    color: '#AAAAAA',
  },
  submitButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    borderColor: COLORS.primary + 'AA',
  },
  submitButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    width: '90%',
    padding: 12,
    backgroundColor: '#222',
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    color: '#FFF',
  },
  button: {
    backgroundColor: COLORS.primary,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  codeFieldRoot: {
    width: '80%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  cell: {
    width: 45,
    height: 45,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    color: COLORS.primary,
    borderRadius: 5,
  },
  focusCell: {
    borderColor: '#8AFF8A',
  },
});
