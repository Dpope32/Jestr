import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 100,
        zIndex: 1000,
        elevation: 999, // For Android
      },
      modalContainer: {
        width: width * 0.9,
        maxHeight: height,
        backgroundColor: '#2E2E2E',
        borderRadius: 20,
        alignItems: 'center',
        zIndex: 10000,
        elevation: 1000,
      },
      memePreview: {
        width: '100%',
        height: height * 0.4,
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 20,
      },
      memeImage: {
        width: '100%',
        height: '100%',
      },
      caption: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: '#fff',
        padding: 10,
        fontSize: 14,
      },
      optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      option: {
        width: '33%',
        alignItems: 'center',
        marginBottom: 15,
      },
      iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
      },
      optionText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
      },
});

export default styles;