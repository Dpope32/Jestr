import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../theme/theme';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mediaContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1bd40b',
    position: 'relative',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
    padding: 20,
    fontSize: 18,
    color: '#fff',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: COLORS.primary
  },
  uploadButton: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },
  uploadButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.0)',
    borderWidth: 0,
    color: 'rgba(0,0,0,0.0)',
  },
  buttonIcon: {
    marginRight: 10,
    color: COLORS.primary,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDisabled : {
    backgroundColor: 'rgba(0,0,0,0.0)',
    color: 'rgba(0,0,0,0.0)',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1bd40b',
    borderRadius: 20,
    padding: 5,
    zIndex: 10,
  },
  overlayText: {
    position: 'absolute',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;
