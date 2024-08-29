import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image, TouchableOpacity, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {DrawerActions} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {FeedNavProp} from '../../navigation/NavTypes/FeedTypes';
import {useTheme} from '../../theme/ThemeContext';
import {FONTS} from '../../theme/theme';
import {User} from '../../types/types';
import {useUserStore} from '../../store/userStore';

const HeaderFeed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FeedNavProp>();

  const {isDarkMode} = useTheme();

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
          navigation.dispatch(DrawerActions.toggleDrawer());
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: 5,
    width: '100%',

    // borderWidth: 1,
    // borderColor: 'red',
  },
  txt: {
    color: 'white',
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
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
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  searchContainerActive: {
    flexGrow: 1,
  },
  searchInput: {
    height: hp('4%'),
    flex: 1,
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
  },
  searchIcon: {
    color: '#fff',
  },
});

export default HeaderFeed;
