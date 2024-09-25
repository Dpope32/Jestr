import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mediaContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5, // 50% of screen height
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1bd40b',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: height * 0.5, // Increased height to take up more screen
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    color: '#1bd40b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#1bd40b',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  uploadButtonDisabled: {
    backgroundColor: '#0f7206',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1bd40b',
    borderRadius: 20,
    padding: 5,
  },
  overlayText: {
    position: 'absolute',
    fontWeight: 'bold',
  },
});

export default styles;
