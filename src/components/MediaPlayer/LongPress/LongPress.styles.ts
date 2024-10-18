import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    marginTop: height * 0.1,
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
    backgroundColor: 'rgba(45, 45, 45, 0.99)',
    borderRadius: 20,
    paddingVertical: height * 0.001,
    paddingHorizontal: width * 0.1,
    alignItems: 'center',
  },
  memePreview: {
    width: '100%',
    height: height * 0.5 - 40,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: height * 0.001,
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
    width: '20%',
    alignItems: 'center',
    marginBottom: height * 0.05,
    marginTop: height * -0.02,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: width * 0.028,
    textAlign: 'center',
  },
});

export default styles;