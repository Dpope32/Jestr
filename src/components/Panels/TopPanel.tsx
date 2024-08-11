import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalDropdown from 'react-native-modal-dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faCog } from '@fortawesome/free-solid-svg-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS, COLORS } from '../../theme/theme';

interface TopPanelProps {
  onProfileClick: () => void;
  profilePicUrl: string | null;
  username: string;
  enableDropdown: boolean;
  showLogo: boolean;
  isAdmin: boolean;
  onAdminClick: () => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean; // Add this prop
}

const TopPanel: React.FC<TopPanelProps> = ({ 
  onProfileClick, 
  profilePicUrl, 
  username, 
  enableDropdown, 
  showLogo,
  isAdmin,
  onAdminClick,
  isDarkMode,
  setIsDarkMode,
  isUploading // Use this prop
}) => {
  const [selectedTab, setSelectedTab] = useState("Flow");
 // console.log('TopPanel rendered, isAdmin:', isAdmin);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (option: string) => {
    setSelectedTab(option);
    setIsDropdownOpen(false);
  };

  const handleSelect = (index: string | number, value: string) => {
    setSelectedTab(value);
  };

  const handleProfileClick = () => {
    onProfileClick();
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <TouchableOpacity onPress={handleProfileClick} style={styles.profileContainer}>
        <Image 
  source={profilePicUrl ? { uri: profilePicUrl } : require('../../assets/images/Jestr.jpg')} 
  style={styles.profilePic} 
/>
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
          
          {showLogo && (
            <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />
          )}
          
          {enableDropdown && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
              <Text style={styles.dropdownText}>{selectedTab}</Text>
              <FontAwesomeIcon icon={faChevronDown} size={wp('4%')} color="#1bd40b" />
            </TouchableOpacity>
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity onPress={() => selectOption('Flow')} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>Flow</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selectOption('Following')} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>Following</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
          
          {isAdmin && (
            <TouchableOpacity onPress={onAdminClick} style={styles.adminIcon}>
              <FontAwesomeIcon icon={faCog} size={wp('6%')} color="#1bd40b" />
            </TouchableOpacity>
          )}
      </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    marginTop: 0,
    zIndex:10,
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  dimmedBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: wp('5%'),
    width: '100%',
    marginTop: 0,
    fontFamily: FONTS.regular,
    zIndex: 999999,
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 999999,
    elevation: 10
  },
  profilePic: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginTop: 4
  },
  username: {
    fontSize: wp('4%'), // Adjusted font size for better readability
    color: '#1bd40b',
    fontFamily: FONTS.regular,
    fontWeight: 'bold',
  },
  logo: {
    width: wp('20%'), // Adjusted size for better fit
    height: hp('6%'),
    resizeMode: 'contain',
    marginRight: -35,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    borderRadius: wp('5%'),
    borderWidth: 2,
    borderColor: '#1bd40b',
    minWidth: wp('25%'),
  },
  dropdownText: {
    color: '#1bd40b',
    marginRight: wp('2%'),
    fontFamily: FONTS.regular,
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: wp('3%'),
    borderWidth: 2,
    borderColor: '#1bd40b',
    marginTop: -20,
    minWidth: wp('25%'),
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: wp('3%'),
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 212, 11, 0.3)',
  },
  dropdownItemText: {
    color: '#fff',
    fontFamily: FONTS.regular,
    fontSize: wp('4%'),
  },
  dropdownTextStyle: {
    color: 'white',
    fontSize: wp('3.5%'),
    padding: wp('2.5%'),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  adminIcon: {
    padding: wp('2.5%'),
  },
});

export default TopPanel;
