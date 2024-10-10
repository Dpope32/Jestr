import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = (isDarkMode: boolean) => {
  const COLORS = {
    background: isDarkMode ? '#1E1E1E' : '#494949',
    headerBorder: isDarkMode ? '#2C2C2C' : '#D3D3D3',
    textPrimary: '#FFFFFF',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
    inputBackground: isDarkMode ? '#2C2C2C' : '#E0E0E0',
    inputText: '#FFFFFF',
    listBackground: isDarkMode ? '#1E1E1E' : '#494949',
    suggestionsBackground: isDarkMode ? '#1E1E1E' : '#494949',
    sendButtonBackground: '#87CEFA',
  };

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
      padding: 10,
    },
    modalContent: {
      flex: 1,
      backgroundColor: COLORS.background,
      borderRadius: 10,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.headerBorder,
      paddingTop: Platform.OS === 'android' ? 20 : 10,
      paddingHorizontal: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      marginRight: 5,
    },
    searchContainer: {
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    searchInput: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: 10,
      padding: 8,
      color: COLORS.inputText,
      fontSize: 14,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#ccc',
      paddingHorizontal: 10,
    },
    userAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: '#1BD40B',
      marginRight: 10,
    },
    username: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    lastMessage: {
      fontSize: 14,
      color: '#CCC',
      marginTop: 2,
      flexShrink: 1,
    },
    memeThumbnail: {
      width: 40,
      height: 40,
      borderRadius: 5,
      marginLeft: 10,
      marginTop: 5,
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    listContainer: {
      flex: 1,
      backgroundColor: COLORS.listBackground,
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    suggestionsContainer: {
      backgroundColor: COLORS.suggestionsBackground,
      paddingHorizontal: 10,
      paddingBottom: 10,
      height: 120, // Set a fixed height for the suggestions container
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: COLORS.textPrimary,
    },
    horizontalListContainer: {
      height: 120, // Increased height
    },
    suggestionItem: {
      alignItems: 'center',
      marginRight: 15,
      width: 70,
    },
    suggestionAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: '#1BD40B',
      marginBottom: 5,
    },
    suggestionUsername: {
      fontSize: 12,
      textAlign: 'center',
      color: COLORS.textPrimary,
      width: 70, // Match the width of suggestionItem
    },
    sendButton: {
      backgroundColor: COLORS.sendButtonBackground,
      borderRadius: 20,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
  });
};

export default createStyles;