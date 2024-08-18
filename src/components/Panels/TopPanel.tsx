import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FONTS } from '../../theme/theme';
import { ProfileImage } from 'types/types';
import { useTheme } from '../../theme/ThemeContext';

interface TopPanelProps {
  onProfileClick: () => void;
  profilePicUrl: string | ProfileImage | null;
  username: string;
  enableDropdown: boolean;
  showLogo: boolean;
  isAdmin: boolean;
  onAdminClick: () => void;
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
  isUploading // Use this prop
}) => {
  const [selectedTab, setSelectedTab] = useState("Flow");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { isDarkMode } = useTheme();

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleSearchClick = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleProfileClick = () => {
    onProfileClick();
  };

  // Close search when keyboard is closed
  const handleKeyboardDismiss = () => {
    setIsSearchActive(false);
  };

  React.useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDismiss);
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[
      styles.safeArea,
      { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' }
    ]}>
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#1C1C1C' } // Inline styling for the container
      ]}>
        <TouchableOpacity onPress={handleProfileClick} style={styles.profileContainer}>
          <Image 
            source={profilePicUrl ? { uri: profilePicUrl } : require('../../assets/images/Jestr.jpg')} 
            style={styles.profilePic} 
          />
        </TouchableOpacity>

        {showLogo && (
          <Image source={require('../../assets/images/Jestr.jpg')} style={styles.logo} />
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Flow' && styles.activeTab]}
            onPress={() => handleTabClick('Flow')}
          >
            <Text style={[styles.tabText, selectedTab === 'Flow' && styles.activeTabText]}>Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'Following' && styles.activeTab]}
            onPress={() => handleTabClick('Following')}
          >
            <Text style={[styles.tabText, selectedTab === 'Following' && styles.activeTabText]}>Following</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          {isSearchActive && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
            />
          )}
          <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearchClick}>
            <FontAwesomeIcon icon={faSearch} size={wp('5%')} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    marginTop: -20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: 5,
    width: '100%',
    zIndex: 555,
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 555,
  },
  profilePic: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp('7%'), // Moved tabs further down
    marginLeft: 15
  },
  tab: {
    marginHorizontal: wp('10%'),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1bd40b', // Green underline for active tab
  },
  tabText: {
    color: '#888', // Inactive tab color
    fontSize: wp('5%'), // Increased font size
    fontFamily: FONTS.regular,
  },
  activeTabText: {
    color: '#fff', // Active tab color
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: hp('4%'), // Maintained height for better usability
    width: wp('30%'), // Reduced width by half
    backgroundColor: '#1C1C1C',
    color: '#fff',
    marginLeft: -150,
    borderRadius: 8,
    paddingHorizontal: wp('2%'),
    marginRight: wp('0%'),
    fontFamily: FONTS.regular,
    fontSize: wp('4%'),
  },
  searchIconContainer: {
    padding: wp('2%'),
  },
  searchIcon: {
    color: '#fff', // White search icon
  },
  logo: {
    position: 'absolute',
    width: wp('20%'), // Adjust size as needed
    height: hp('6%'),
    resizeMode: 'contain',
    left: '54.5%',
    transform: [{ translateX: -wp('10%') }],
    zIndex: 999999, // Ensure it's above other elements
  },
});

export default TopPanel;
