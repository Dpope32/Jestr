import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, wp, elevationShadowStyle, FONTS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#1C1C1C',
          padding: 4,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 48,
          color: '#00ff00', 
          paddingHorizontal: 10,
          fontSize: 48,
        },
        separator: {
            height: 1,
            backgroundColor: '#444',
            width: '100%',
            marginVertical: 10,
          },
          
          notificationItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 8,
            marginBottom: 10,
          },
          
          notificationIcon: {
            marginRight: 10,
          },
          
          notificationText: {
            fontWeight: '600',
            fontSize: 16,
            color: '#FFF', // Change this to your preferred color
          },
        profilePicTop: {
          width: 40,
          height: 40,
          borderRadius: 20,
        },
        notificationsSection: {
          marginBottom: 20,
          paddingHorizontal: 10,
          backgroundColor: '#2C2C2C',
          borderRadius: 10,
          padding: 15,
        },
        notificationsHeader: {
          fontSize: 18,
          fontWeight: '600',
          color: '#FFF',
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#444',
          paddingBottom: 5,
        },
        notification: {
          color: '#CCC',
          fontSize: 16,
          marginBottom: 5,
        },
        searchBar: {
          backgroundColor: '#2C2C2C',
          borderRadius: 10,
          color: '#FFF',
          paddingHorizontal: 15,
          paddingVertical: 10,
          marginHorizontal: 10,
          marginBottom: 12,
          fontSize: 16,
        },
        section: {
          marginBottom: 20,
          paddingHorizontal: 10,
        },
        sectionHeader: {
          fontSize: 20,
        
          fontWeight: '600',
          color: '#00ff00', 
          paddingBottom: 5,
          borderBottomWidth: 1,
          marginLeft: 10,
          borderBottomColor: '#444',
        },
        sectionHeaderIn: {
            fontSize: 40,
            fontWeight: '600',
            color: '#00ff00', 
            paddingVertical: 5,
            borderBottomWidth: 1,
            borderBottomColor: '#444',
            marginLeft: 10
          },
        conversationItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 6,
          paddingHorizontal:0,
          borderRadius: 8,
          marginBottom: 10,
        },
        conversationItem1: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 8,
            marginBottom: 10,

          },
        profilePic: {
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 15,
        },
        conversationInfo: {
          flex: 1,
          justifyContent: 'center',
        },
        username: {
          fontWeight: '600',
          fontSize: 18,
          color: '#FFFF',
        },
        timestamp: {
          fontSize: 14,
          color: '#999',
          marginTop: 2,
        },
        newMessageButton: {
          position: 'absolute',
          right: 20,
          bottom: 80,
          backgroundColor: '#1bd40b',
          borderRadius: 25,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        },
      });

export default styles;