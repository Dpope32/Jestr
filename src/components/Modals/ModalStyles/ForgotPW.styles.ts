// src/Modals/ModalStyles/FormStyles.ts
import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/theme';

export const styles = StyleSheet.create({
    modalContainer: {
        flex: 1, // Ensure the modal covers the entire screen
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent dark background
      },
      innerContainer: {
        width: '90%',
        backgroundColor: '#1E1E1E', // Solid background for the modal content
        padding: 25,
        borderRadius: 20,
        justifyContent: 'center',
      },
      modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
        textAlign: 'center',
      },
      input: {
        width: '100%', // Use full width within innerContainer
        padding: 12,
        backgroundColor: '#222',
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 20,
        color: '#FFF',
      },
      codeFieldRoot: {
        width: '80%',
        marginBottom: 20,
        alignSelf: 'center',
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
        marginHorizontal: 5,
      },
      focusCell: {
        borderColor: '#8AFF8A',
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
        alignSelf: 'center',
      },
      closeButtonText: {
        color: '#fff',
        fontSize: 16,
      },
});

export default styles;