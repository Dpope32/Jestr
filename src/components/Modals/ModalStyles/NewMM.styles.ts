import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const createStyles = (isDarkMode: boolean) => {
  const COLORS = {
    background: isDarkMode ? '#1C1C1C' : '#FFFFFF',
    headerBorder: isDarkMode ? '#333' : '#E0E0E0',
    textPrimary: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#CCCCCC' : '#666666',
    inputBackground: isDarkMode ? '#333' : '#F0F0F0',
    inputText: isDarkMode ? '#FFFFFF' : '#000000',
    listBackground: isDarkMode ? '#333333' : '#FFFFFF',
    suggestionsBackground: isDarkMode ? '#2A2A2A' : '#F9F9F9',
  };

  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.headerBorder,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    memeThumbnail: {
      width: 40,
      height: 40,
      borderRadius: 5,
      marginTop: 5,
    },
    closeButton: {
      padding: 5,
    },
    searchContainer: {
      padding: 10,
    },
    searchInput: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: 10,
      padding: 10,
      color: COLORS.inputText,
    },
    userList: {
      paddingHorizontal: 20,
      paddingBottom: 15,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.headerBorder,
    },
    userAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: '#1bd40b',
      marginRight: 10,
    },
    username: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.textPrimary,
    },
    lastMessage: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    suggestionsContainer: {
      padding: 10,
      backgroundColor: COLORS.suggestionsBackground,
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: COLORS.textPrimary,
    },
    suggestionItem: {
      alignItems: 'center',
      marginRight: 15,
    },
    suggestionAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: '#1bd40b',
    },
    suggestionUsername: {
      marginTop: 5,
      fontSize: 12,
      textAlign: 'center',
      color: COLORS.textPrimary,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 10,
      backgroundColor: COLORS.listBackground,
    },
    horizontalListContainer: {
      height: 100,
    },
    sendButton: {
      backgroundColor: '#1bd40b',
      borderRadius: 25,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
  });
};

export default createStyles;
