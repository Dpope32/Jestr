import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    
      modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'space-between',
      },
      tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
      },
      tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        color: '#00ff00',
        fontWeight: 'bold',
        fontSize: 16,
      },
      activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#00ff00',
      },
      tabText: {
        color: '#fff',
        fontSize: 16,
      },
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
      },
      profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
      userInfo: {
        flex: 1,
      },
      username: {
        color: '#00ff00',
        fontWeight: 'bold',
        fontSize: 16,
      },
      displayName: {
        color: '#fff',
        fontSize: 14,
      },
      followBackButton: {
        backgroundColor: '#fff',
      },
      followingButton: {
        backgroundColor: '#000',
      },
      followButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#000000',
      },
      unfollowButton: {
        backgroundColor: '#ff0000',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ff0000',
      },
      followButtonText: {
        fontSize: 14,
      },
      unfollowButtonText: {
        color: '#ffffff',
        fontSize: 14,
      },
      followBackText: {
        color: '#000',
      },
      followingText: {
        color: '#fff',
      },
      closeButton: {
        marginTop: 20,
        alignSelf: 'center',
        padding: 10,
      },
      closeButtonText: {
        color: '#fff',
        fontSize: 16,
      },
      emptyListText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
      },
      
    });


