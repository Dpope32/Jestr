import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: 'rgba(70, 70, 70, 0.95)', // Semi-transparent dark background
    borderRadius: 20,
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
    alignItems: 'center',
  },
  memePreview: {
    width: '100%',
    height: height * 0.35,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: height * 0.025,
  },
  memeImage: {
    width: '100%',
    height: '100%',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  option: {
    width: '33%',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: width * 0.032,
    textAlign: 'center',
    marginTop: height * 0.005,
  },
});

export default styles;