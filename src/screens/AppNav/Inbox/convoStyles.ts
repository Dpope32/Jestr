// src/screens/AppNav/Inbox/convoStyles.ts

import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: '#1C1C1C',
    paddingTop: Platform.OS === 'android' ? 50 : 30,
    borderBottomColor: '#444',
  },
  // Add these styles to your existing styles in 'convoStyles.ts'

fullscreenMemeContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},

fullscreenMemeImage: {
  width: width * 0.9,
  height: height * 0.7,
},

fullscreenMemeVideo: {
  width: width * 0.9,
  height: height * 0.7,
},
fullscreenMemeCloseButton: {
  position: 'absolute',
  top: 40,
  right: 20,
  zIndex: 10,
},
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  errorText: {
    color:  '#FF3B30',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    padding: 2,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#1bd40b',
  },
  username: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 15 : 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#043458',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C1C',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#1E1E1E',
    paddingBottom: Platform.OS === 'android' ? 10 : 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 8 : 8,
    marginRight: 10,
    fontSize: 16,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#0f9df5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedMemeImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  memeContainer: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10, // Adds shadow for Android
  },
  memeImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  closeMemeButton: {
    marginLeft: 10,
    padding: 5,
  },
  loadingText: {
    color: '#1bd40b',
    fontSize: 18,
    marginTop: 10,
  },
});

export default styles;
