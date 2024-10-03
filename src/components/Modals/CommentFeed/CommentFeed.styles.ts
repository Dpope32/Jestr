import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../../../theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    height: '70%',
    maxHeight: screenHeight * 0.8,
    width: '100%',
    backgroundColor: `rgba(0, 0, 0, ${Platform.OS === 'ios' ? 0.0 : 0.8})`, // Opacity based on platform
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  blurViewStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 6,
    padding: 10,
    backgroundColor: 'rgba(80, 80, 80, 0.5)',
    borderRadius: 20,
  },
  commentCount: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 16,
  },
  commentsContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 10,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(58, 58, 58, 0.78)',
    borderRadius: 16,
  },
  replyingToText: {
    color: '#FFD700',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  cancelReplyButton: {
    marginLeft: 8,
    padding: 4,
  },
  cancelReplyText: {
    color: '#FF4500',
    fontWeight: '600',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'transparent',
  },
  newCommentInput: {
    flex: 1,
    height: 35,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#FFF',
    backgroundColor: 'rgba(51, 51, 51, 0.7)',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  loadingText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    marginRight: 12,
  },
});

export default styles;