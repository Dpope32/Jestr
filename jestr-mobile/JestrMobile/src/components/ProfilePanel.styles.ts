import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#424242',
      padding: 20,
    },
    darkMode: {
      backgroundColor: '#979797',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1,
    },
    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    profileInfo: {
      alignItems: 'center',
      marginTop: 40,
    },
    profilePic: {
      width: 80,
      height: 80,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 242, 0.42)',
    },
    userInfoContainer: {
      marginTop: 10,
    },
    profilePanel: {
      position: 'absolute',
      width: '50%',
      height: '106%',
      backgroundColor: '#333333',
      left: 0,
      top: 0,
      zIndex: 10,
      elevation: 10,
    },
    dimBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    userInfo: {
      marginRight: 20,
    },
    infoContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    infoLabel: {
      fontSize: 12,
      color: '#FFFFFF',
      opacity: 0.8,
    },
    followContainer: {
      flexDirection: 'row',
      marginTop: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 6,
    },
    followCount: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 15,
      padding: 5,
      marginHorizontal: 4,
    },
    followValue: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    iconSection: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginTop: 100,
    },
    iconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    icon: {
      color: '#FFFFFF',
      fontSize: 24,
      marginRight: 10,
    },
    iconLabel: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    signoutButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
    },
    darkModeButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    settingsModal: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 20,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -190 }, { translateY: -200 }],
      width: 300,
      height: 400,
      zIndex: 1,
    },
    closeModalButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    closeModalIcon: {
      color: '#000000',
      fontSize: 20,
    },
    modalHeader: {
      backgroundColor: '#93d3b1',
      padding: 10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    modalHeaderText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalOptions: {
      marginTop: 20,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    optionIcon: {
      color: '#000000',
      fontSize: 20,
      marginRight: 10,
    },
    optionLabel: {
      fontSize: 16,
    },
    activeDarkIcon: {
      backgroundColor: '#ffcc00',
    },
  });

  export default styles;