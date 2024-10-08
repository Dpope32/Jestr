import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 6,
    backgroundColor: 'rgba(60, 60, 60, 0.0)',
    borderRadius: 12,
    marginVertical: 5,
    marginHorizontal: 8,

    // borderWidth: 2,
    // borderColor: '#FFF',
  },
  replyContainer: {
    marginLeft: 30,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
    paddingLeft: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
    fontSize: 15,
  },
  commentText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 4,
  },
  likesText: {
    color: '#4CAF50',
    marginHorizontal: 4,
    fontSize: 13,
  },
  replyText: {
    color: '#007AFF',
    marginLeft: 4,
    fontSize: 13,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
    marginLeft: 'auto',
  },
  viewRepliesButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  viewRepliesText: {
    color: '#007AFF',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFF',
  },
});

export default styles;
