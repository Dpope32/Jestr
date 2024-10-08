import {StyleSheet, Platform} from 'react-native';
import {Dimensions} from 'react-native';
import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  memeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? -100 : -100,
  },
  blurContainer: {
    position: 'absolute',
    left: 0,
    right: -12,
    bottom: -100,
    padding: 10,
    zIndex: 10,
    elevation: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: Platform.OS === 'ios' ? 150 : 150,
  },
  memeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followedButton: {
    backgroundColor: '#1bd40b',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  longPressModal: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  prevPreviewImage: {
    top: '100%',
  },
  nextPreviewImage: {
    top: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    color: 'white', // Ensure the text color is white (or your desired color)
    textShadowColor: 'rgba(0, 0, 0, 0.7)', // Set shadow color
    textShadowOffset: { width: 1, height: 1 }, // Set offset for the shadow
    textShadowRadius: 3, // Set blur radius for the shadow
  },
  errorText: {
    fontSize: 20,
    color: '#ff0000',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastMessage: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 10,
  },
  toastManage: {
    color: '#1E90FF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default styles;
