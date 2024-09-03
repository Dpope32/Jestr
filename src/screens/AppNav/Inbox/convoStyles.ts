import {StyleSheet, Dimensions} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  wp,
  elevationShadowStyle,
  FONTS,
} from '../../../theme/theme';

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    backgroundColor: '#1C1C1C',
    marginTop: 40,
    borderBottomColor: '#444',
  },
  backButton: {
    marginRight: 10,
  },
  sharedMemeImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    color: 'white',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4299e1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d3748',
  },
  messageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#aaa',
    marginRight: 5,
  },
  status: {
    fontSize: 10,
    color: '#aaa',
  },
  readReceipt: {
    fontSize: 10,
    color: '#aaa',
    marginLeft: 5,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  reaction: {
    fontSize: 16,
    marginRight: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    bottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1bd40b',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
