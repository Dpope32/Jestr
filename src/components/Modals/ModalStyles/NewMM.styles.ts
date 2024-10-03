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
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    modalContent: {
      backgroundColor: COLORS.background,
      borderRadius: 10,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.headerBorder,
      paddingTop: Platform.OS === 'android' ? 20 : 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.textPrimary, // Always white
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
      color: COLORS.inputText, // Always white
      fontSize: 14,
    },
    userList: {
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#444' : '#ccc',
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
      color: COLORS.textPrimary, // Always white
    },
    lastMessage: {
      fontSize: 14,
      color: '#CCC',
      marginTop: 2,
    },
    memeThumbnail: {
      width: 40,
      height: 40,
      borderRadius: 5,
      marginTop: -20,
      marginLeft: 20
    },
    messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    suggestionsContainer: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: COLORS.suggestionsBackground, // Better background contrast
    },
    suggestionsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
      color: COLORS.textPrimary, // Always white
    },
    suggestionItem: {
      alignItems: 'center',
      marginRight: 10,
    },
    suggestionAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: '#1BD40B',
    },
    suggestionUsername: {
      marginTop: 5,
      fontSize: 12,
      textAlign: 'center',
      color: COLORS.textPrimary, // Always white
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 10,
      backgroundColor: COLORS.listBackground, // Adjusted background gray
      marginBottom: 20,
    },
    horizontalListContainer: {
      height: 80,
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
