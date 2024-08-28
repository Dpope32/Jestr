import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image, TouchableOpacity, TextInput} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTabBarStore} from '../../store/tabBarStore';

import {useTheme} from '../../theme/ThemeContext';
import {FONTS} from '../../theme/theme';
import {User} from '../../types/types';
import {useUserStore} from '../../store/userStore';

const HeaderFeed = () => {
  const insets = useSafeAreaInsets();
  const {isDarkMode} = useTheme();
  const setSidePanelVisibility = useTabBarStore(
    state => state.setSidePanelVisibility,
  );
  const setTabBarVisibility = useTabBarStore(
    state => state.setTabBarVisibility,
  );

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');

  const user = useUserStore(state => state as User);
  const bgdColDark = isDarkMode ? '#000' : '#1C1C1C';

  const imgSrc = user.profilePic
    ? {uri: user.profilePic}
    : require('../../assets/images/Jestr.jpg');

  return (
    <View
      style={[
        styles.container,
        {
          // paddingTop: insets.top,
          top: insets.top,
          //   backgroundColor: bgdColDark,
        },
      ]}>
      {/*  PROFILE PICTURE */}
      <TouchableOpacity
        onPress={() => {
          setSidePanelVisibility(true);
          setTabBarVisibility(false);
        }}
        style={styles.profileContainer}>
        <Image source={imgSrc} style={styles.profilePic} />
      </TouchableOpacity>

      {/* LOGO  */}
      {!isSearchActive && (
        <Image
          source={require('../../assets/images/Jestr.jpg')}
          style={styles.logo}
        />
      )}

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
            onBlur={() => setIsSearchActive(false)}
          />
        )}
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={() => {
            setIsSearchActive(prev => !prev);
          }}>
          <FontAwesomeIcon
            icon={faSearch}
            size={wp('5%')}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    // top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: 5,
    width: '100%',
    // zIndex: 0,

    // borderWidth: 1,
    // borderColor: 'red',
  },
  txt: {
    color: 'white',
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    // zIndex: 555,

    // borderWidth: 1,
    // borderColor: 'blue',
  },
  profilePic: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginTop: 4,
  },
  logo: {
    width: wp('20%'),
    height: hp('6%'),
    resizeMode: 'contain',
    // zIndex: 999999,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // paddingRight: wp('5%'),
    alignItems: 'center',

    // flex: 1,
    // alignItems: 'center',
    // width: wp('10%'),

    // borderWidth: 1,
    // borderColor: 'green',
  },
  searchContainerActive: {
    // width: wp('60%'),
    flexGrow: 1,
  },
  searchInput: {
    height: hp('4%'),
    flex: 1,
    // width: '80%',
    backgroundColor: '#1C1C1C',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: wp('2%'),
    fontFamily: FONTS.regular,
    fontSize: wp('4%'),

    borderWidth: 1,
    borderColor: 'yellow',
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
});

export default HeaderFeed;
