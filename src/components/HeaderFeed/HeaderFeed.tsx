import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSearch, faBell, faCog} from '@fortawesome/free-solid-svg-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {AppNavProp} from '../../navigation/NavTypes/RootNavTypes';
import {FONTS} from '../../theme/theme';
import {User} from '../../types/types';
import {useUserStore} from '../../stores/userStore';
import {useNotificationStore} from '../../stores/notificationStore';

const HeaderFeed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AppNavProp>();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  // const [selectedTab, setSelectedTab] = useState('Flow');
  const user = useUserStore(state => state as User);
  const isAdmin = useUserStore(state => state.isAdmin);
  const notificationCount = useNotificationStore(
    state => state.notifications.filter(n => !n.read).length,
  );

  // const handleTabClick = (tab: string) => {
  //   setSelectedTab(tab);
  // };

  const imgSrc = user.profilePic
    ? {uri: user.profilePic}
    : require('../../assets/images/Jestr.jpg');

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}>
      <View style={styles.firstRow}>
        {/* Left Container */}
        <View style={styles.leftContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(DrawerActions.toggleDrawer());
            }}
            style={styles.profileContainer}>
            <Image source={imgSrc} style={styles.profilePic} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminIconContainerLeft}
              onPress={() => navigation.navigate('AdminPage')}>
              <FontAwesomeIcon
                icon={faCog}
                size={wp('5%')}
                style={styles.adminIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Container */}
        <View style={styles.centerContainer}>
          {!isSearchActive && (
            <Image
              source={require('../../assets/images/Jestr.jpg')}
              style={styles.logo}
            />
          )}
        </View>

        {/* Right Container */}
        <View style={styles.rightContainer}>
          {/* Search Bar */}
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

          {/* Notifications */}
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationContainer}>
            <FontAwesomeIcon
              icon={faBell}
              size={wp('5%')}
              style={styles.notificationIcon}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs 
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
          style={[styles.tab, selectedTab === 'Following' && styles.activeTab]}
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
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: wp('5%'),
    width: '100%',
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp('7%'),
    justifyContent: 'space-between',
    position: 'relative',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    position: 'absolute',
    left: '50%',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // Shift left by half the logo's width to center it
    transform: [{translateX: -wp('10%')}], // Half of logo width (wp('20%') / 2)
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: 'yellow',
  },
  logo: {
    width: wp('20%'),
    height: hp('6%'),
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  searchContainerActive: {
    flexGrow: 1,
    height: '80%',
    width: '80%',
  },
  searchInput: {
    height: '80%',
    flex: 1,
    backgroundColor: '#1C1C1C',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: wp('2%'),
    fontFamily: FONTS.regular,
    fontSize: wp('4%'),
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: 'white',
  },
  searchIconContainer: {
    padding: wp('0.5%'),
  },
  searchIcon: {
    color: '#fff',
  },
  notificationContainer: {
    padding: wp('2%'),
  },
  notificationIcon: {
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminIconContainerLeft: {
    padding: wp('1%'),
    marginLeft: wp('2%'),
  },
  adminIcon: {
    color: 'yellow',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 10,
  },
  tab: {},
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
});

export default HeaderFeed;
