import {StyleSheet, Platform} from 'react-native';
import {Dimensions} from 'react-native';
import {COLORS, SPACING, FONT_SIZES} from '../../theme/theme';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',

    // borderWidth: 2,
    // borderColor: 'yellow',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  blurInner: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 130,
    left: 0,
    right: 0,
    // bottom: 0,
    justifyContent: 'space-between',
    // borderRadius: 12,
    // borderWidth: 1,
    // borderColor: 'blue',
    zIndex: 100,
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    // justifyContent: 'center',
    // alignItems: 'center',
    // paddingBottom: Platform.OS === 'ios' ? 260 : 100,

    // borderWidth: 1,
    // borderColor: 'red',
    // zIndex: 1,
  },

  textContainer: {
    // position: 'absolute',
    // bottom: Platform.OS === 'ios' ? 240 : 150,
    // left: 0,
    // right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 5,
    borderRadius: 10,
    width: '40%',

    // borderWidth: 1,
    // borderColor: 'blue',
  },
  contentContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    zIndex: 10,
    // paddingBottom: Platform.OS === 'ios' ? 260 : 150,
  },
  iconColumn: {
    // position: 'absolute',
    flexDirection: 'column',
    // right: 0,
    // zIndex: 10,
    // paddingHorizontal: 0,
    // gap: 0,
    // bottom: Platform.OS === 'ios' ? 230 : 150,
    // alignItems: 'center',
    zIndex: 10,

    // borderWidth: 1,
    // borderColor: 'blue',
  },
  memeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  followButton: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: '#1bd40b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 1,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followedButton: {
    backgroundColor: '#1bd40b',
  },
  videoContainer: {
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    // zIndex: 1000,

    // borderWidth: 2,
    // borderColor: 'red',
  },
  absoluteFill: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
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
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicContainer: {
    position: 'relative',
  },
  textContent: {
    // flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
  },
  video: {
    width: '100%',
    height: '100%',
    // position: 'absolute',
    // top: 0,
    // left: 0,

    // borderWidth: 3,
    // borderColor: 'blue',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  caption: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
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
  // Define static parts of iconText style here
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
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
