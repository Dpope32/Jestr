import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';
import {TextInput, Keyboard} from 'react-native';
import {Image, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch, faCog} from '@fortawesome/free-solid-svg-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {FONTS} from '../../theme/theme';
import {ProfileImage} from 'types/types';
import {useTheme} from '../../theme/ThemeContext';
import { useUserStore } from '../../store/userStore';

interface TopPanelProps {
  onProfileClick: () => void;
  profilePicUrl: string | ProfileImage | null;
  showLogo: boolean;
  onAdminClick: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  onProfileClick,
  profilePicUrl,
  onAdminClick,
  showLogo,
}) => {
  const {isDarkMode} = useTheme();

  const [selectedTab, setSelectedTab] = useState('Flow');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const isAdmin = useUserStore(state => state.isAdmin);
  const bgdColDark = isDarkMode ? '#000' : '#1C1C1C';

  const imgSrc = profilePicUrl
    ? {uri: profilePicUrl}
    : require('../../assets/images/Jestr.jpg');

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleSearchClick = () => {
    setIsSearchActive(prevState => !prevState);
  };

  const handleProfileClick = () => {
    onProfileClick();
  };

  const handleOutsideClick = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setSearchText('');
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (isSearchActive) {
      // Automatically focus the search input when activated
      // The keyboard will automatically show because of the autoFocus prop
    } else {
      Keyboard.dismiss(); // Dismiss the keyboard when search is deactivated
    }
  }, [isSearchActive]);

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <SafeAreaView style={[styles.safeArea, {backgroundColor: bgdColDark}]}>
        <View style={[styles.container, {backgroundColor: bgdColDark}]}>
          {/*  PROFILE PICTURE */}
          <TouchableOpacity
            onPress={handleProfileClick}
            style={styles.profileContainer}>
            <Image source={imgSrc} style={styles.profilePic} />
          </TouchableOpacity>

          {/* LOGO  */}
          {showLogo && (
            <Image
              source={require('../../assets/images/Jestr.jpg')}
              style={styles.logo}
            />
          )}

          {/* TABS: Flow & Following */}
          {/* TODO: these should be moved to Feed screen */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'Flow' && styles.activeTab]}
              onPress={() => handleTabClick('Flow')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'Flow' && styles.activeTabText,
                ]}>
                Flow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'Following' && styles.activeTab,
              ]}
              onPress={() => handleTabClick('Following')}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'Following' && styles.activeTabText,
                ]}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          {/* == TODO: NEEDS REFACTORING to mitigate when search input appears */}
          {/* SEARCH  */}
          <View
            style={[
              styles.searchContainer,
              isSearchActive && styles.searchContainerActive,
            ]}>
            {isSearchActive && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
                onBlur={() => setIsSearchActive(false)} // Closes the search on blur
              />
            )}
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminIconContainer}
                onPress={onAdminClick}>
                <FontAwesomeIcon
                  icon={faCog}
                  size={wp('5%')}
                  style={styles.adminIcon}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchIconContainer}
              onPress={handleSearchClick}>
              <FontAwesomeIcon
                icon={faSearch}
                size={wp('5%')}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    marginTop: -20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0)',

    // borderWidth: 1,
    // borderColor: 'red',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: wp('5%'),
    paddingVertical: 5,
    width: '100%',
    zIndex: 555,

    // borderWidth: 1,
    // borderColor: 'blue',
  },
  adminIconContainer: {
    marginLeft: wp('-5%'),
    padding: wp('2%'),
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 555,
  },
  adminIcon: {
    color: '#fff',
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
    paddingTop: hp('7%'),
    marginLeft: 15,
  },
  tab: {
    marginHorizontal: wp('10%'),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1bd40b',
  },
  tabText: {
    color: '#888',
    fontSize: wp('5%'),
    fontFamily: FONTS.regular,
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('10%'),

    // borderWidth: 1,
    // borderColor: 'green',
  },
  searchContainerActive: {
    width: wp('60%'),
  },
  searchInput: {
    height: hp('4%'),
    width: '80%',
    backgroundColor: '#1C1C1C',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: wp('2%'),
    fontFamily: FONTS.regular,
    fontSize: wp('4%'),

    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  searchIconContainer: {
    padding: wp('2%'),

    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  searchIcon: {
    color: '#fff',

    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  logo: {
    position: 'absolute',
    width: wp('20%'),
    height: hp('6%'),
    resizeMode: 'contain',
    left: '54.5%',
    transform: [{translateX: -wp('10%')}],
    zIndex: 999999,
  },
});

export default TopPanel;
