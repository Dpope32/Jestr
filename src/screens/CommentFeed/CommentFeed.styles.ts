// CommentFeed.styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        height: '80%',
        backgroundColor: 'rgba(50, 50, 50, 0.95)',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
      },
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      },
      inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#444',
        paddingTop: 10,
      },
      replyingToContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#444',
        borderRadius: 16,
      },
      replyingToText: {
        color: '#FFF',
        marginLeft: 8,
        flex: 1,
      },
      cancelReplyButton: {
        marginLeft: 8,
      },
      cancelReplyText: {
        color: '#007AFF',
        fontWeight: '600',
      },
      closeButton: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 6,
      },
      modalContent: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: 'rgba(50, 50, 50, 0.90)',
        padding: 20,
        paddingTop: 10,
      },
      commentCount: {
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
      },
      commentsContainer: {
        flex: 1,
      },
      newCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: '#444',
        borderTopWidth: 1,
        paddingTop: 12,
      },
      newCommentInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        color: '#FFF',
        marginBottom: 14,
      },
      sendButton: {
        marginLeft: 10,
      },
      profilePic: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
      },
    });
    
export default styles;