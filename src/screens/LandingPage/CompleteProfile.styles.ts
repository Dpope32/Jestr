import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1C',
        padding: 20,
      },
      preferencesContainer: {
        marginTop: 10,
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 15,
      },
      preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      },
      preferenceText: {
        color: '#FFFFFF',
        fontSize: 16,
        flex: 1,
        marginLeft: 15,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      lottieAnimation: {
        width: 200,
        height: 200,
      },
      loadingText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 20,
      },
      whiteText: {
        color: '#FFF',
        marginBottom: 0,
      },
      inputsContainer: {
        width: '100%',
        marginTop: 4,
      },
      label: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 5,
      },
      errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
      },
      bioInput: {
        height: 80,
        textAlignVertical: 'top',
      },
      button: {
        width: '100%',
      },
      gradient: {
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginHorizontal: 80,
      },
      buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
      },
});
