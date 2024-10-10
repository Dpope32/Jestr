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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    height: '80%',
    maxHeight: screenHeight * 0.9,
    width: '100%',
    backgroundColor: `rgba(0, 0, 0, ${Platform.OS === 'ios' ? 0.0 : 0.8})`,
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

  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sortOptionText: {
    color: '#FFF',
    fontSize: 16,
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
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
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  newCommentInput: {
    flex: 1,
    height: 40,
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
    padding: 8,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyCommentText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },



  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  commentCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  sortButton: {
    padding: 10,
    backgroundColor: 'rgba(80, 80, 80, 0.5)',
    borderRadius: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(80, 80, 80, 0.5)',
    borderRadius: 20,
  },
  sortOptionsContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
  },
});

export default styles;