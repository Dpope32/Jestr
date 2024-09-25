import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faTrophy,
  faArrowLeft,
  faStar,
  faBolt,
  faCrown,
  faHandshake,
  faGem,
  faChartLine,
  faLightbulb,
  faUserShield,
  faBullhorn,
  faMedal,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './Badges.styles';
import { COLORS } from '../../../theme/theme';
import { Badge, useBadgeStore } from '../../../stores/badgeStore';
import { AppNavProp } from '../../../navigation/NavTypes/RootNavTypes';
import * as Progress from 'react-native-progress';

type BadgeType =
| 'memeExplorer' 
| 'socialButterfly' 
| 'memeCommenter' 
| 'memeMaster' 
| 'trendSetter' 
| 'viralSensation' 
| 'memeConnoisseur' 
| 'engagementGuru' 
| 'iconicCreator' 
| 'contentChampion' 
| 'legendaryMemer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3; // Increased number of columns to reduce badge size
const CARD_MARGIN = 10;
const CARD_WIDTH =
  (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;



const badgeIcons: { [key in BadgeType]: (color: string) => React.ReactElement } = {
    memeExplorer: (color: string) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Your SVG paths */}
        <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12 16V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12 8H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    socialButterfly: (color: string) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Your SVG paths */}
        <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    memeCommenter: (color: string) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Your SVG paths */}
        <Path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    memeMaster: (color: string) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Your SVG paths */}
        <Path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    trendSetter: (color: string) => (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Your SVG paths */}
        <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M17 6H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    viralSensation: (color: string) => (
      <FontAwesomeIcon icon={faBolt} size={24} color={color} />
    ),
    memeConnoisseur: (color: string) => (
      <FontAwesomeIcon icon={faStar} size={24} color={color} />
    ),
    engagementGuru: (color: string) => (
      <FontAwesomeIcon icon={faChartLine} size={24} color={color} />
    ),

    legendaryMemer: (color: string) => (
      <FontAwesomeIcon icon={faCrown} size={24} color={color} />
    ),

    iconicCreator: (color: string) => (
      <FontAwesomeIcon icon={faStar} size={24} color={color} />
    ),
    contentChampion: (color: string) => (
      <FontAwesomeIcon icon={faUserShield} size={24} color={color} />
    ),

  };

  const Badges: React.FC = () => {
    const navigation = useNavigation<AppNavProp>();
    const { isDarkMode } = useTheme();
    const badges = useBadgeStore((state) => state.badges);
  
    const flipAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
    const flipValues = useRef<{ [key: string]: number }>({}).current;
  
    const initializeFlipAnim = (badgeId: string) => {
      if (!flipAnims[badgeId]) {
        flipAnims[badgeId] = new Animated.Value(0);
        flipValues[badgeId] = 0;
  
        flipAnims[badgeId].addListener(({ value }) => {
          flipValues[badgeId] = value;
        });
      }
    };
  
    useEffect(() => {
      return () => {
        Object.keys(flipAnims).forEach((badgeId) => {
          flipAnims[badgeId].removeAllListeners();
        });
      };
    }, [flipAnims]);
  
    const handleFlip = (badgeId: string, earned: boolean) => {
      if (!earned) return;
  
      initializeFlipAnim(badgeId);
      const currentValue = flipValues[badgeId];
  
      Animated.spring(flipAnims[badgeId], {
        toValue: currentValue === 0 ? 180 : 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    };
  
    const renderBadge = ({ item }: { item: Badge; index: number }) => {
      const isEarned = item.earned;
  
      initializeFlipAnim(item.id);
  
      const frontInterpolate = flipAnims[item.id].interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
      });
  
      const backInterpolate = flipAnims[item.id].interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
      });
  
      const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
      };
  
      const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
      };
  
      return (
        <View style={styles.badgeContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleFlip(item.id, isEarned)}
            disabled={!isEarned}
            accessible
            accessibilityLabel={`Badge: ${item.title}`}
          >
            {/* Front Side */}
            <Animated.View
              style={[
                styles.badgeCard,
                frontAnimatedStyle,
                isEarned ? {} : styles.unearnedBadge,
                { backfaceVisibility: 'hidden' },
              ]}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.badgeIconContainer}
              >
                {badgeIcons[item.type](
                  isEarned ? COLORS.gold : isDarkMode ? COLORS.white : COLORS.black
                )}
              </LinearGradient>
              {!isEarned && (
                <View style={styles.lockOverlay}>
                  <FontAwesomeIcon icon={faLock} size={16} color={COLORS.error} />
                </View>
              )}
              <Text
                style={[
                  styles.badgeTitle,
                  { color: isDarkMode ? COLORS.white : COLORS.black },
                ]}
              >
                {item.title}
              </Text>
              {!isEarned && (
                <Text
                  style={[
                    styles.badgeDescription,
                    { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                  ]}
                >
                  {item.description}
                </Text>
              )}
              <View style={styles.progressContainer}>
                <Progress.Bar
                  progress={item.progress / 100}
                  width={CARD_WIDTH - 20}
                  color={COLORS.primary}
                  unfilledColor={
                    isDarkMode ? COLORS.darkGray : COLORS.lightGray
                  }
                  borderWidth={0}
                  height={6}
                  borderRadius={3}
                  animated={true}
                />
                <Text
                  style={[
                    styles.progressText,
                    { color: isDarkMode ? COLORS.white : COLORS.black },
                  ]}
                >
                  {item.progress}%
                </Text>
              </View>
            </Animated.View>
  
            {/* Back Side */}
            {isEarned && (
              <Animated.View
                style={[
                  styles.badgeCard,
                  backAnimatedStyle,
                  { backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0 },
                ]}
              >
                <Text
                  style={[
                    styles.badgeBackTitle,
                    { color: isDarkMode ? COLORS.white : COLORS.black },
                  ]}
                >
                  {item.title}
                </Text>
                <View style={styles.progressContainer}>
                  <Progress.Bar
                    progress={item.progress / 100}
                    width={CARD_WIDTH - 20}
                    color={COLORS.primary}
                    unfilledColor={
                      isDarkMode ? COLORS.darkGray : COLORS.lightGray
                    }
                    borderWidth={0}
                    height={6}
                    borderRadius={3}
                    animated={true}
                  />
                  <Text
                    style={[
                      styles.progressText,
                      { color: isDarkMode ? COLORS.white : COLORS.black },
                    ]}
                  >
                    {item.progress}%
                  </Text>
                </View>
                <Text
                  style={[
                    styles.badgeDetails,
                    { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                  ]}
                >
                  Acquired:{' '}
                  {item.acquiredDate
                    ? new Date(item.acquiredDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
                <Text
                  style={[
                    styles.badgeDetails,
                    { color: isDarkMode ? COLORS.lightGray : COLORS.darkGray },
                  ]}
                >
                  Holders:{' '}
                  {item.holdersCount !== undefined ? item.holdersCount : 'N/A'}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      );
    };
  
    return (
      <ImageBackground
        source={require('../../../assets/images/badges-bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView
          intensity={100}
          style={styles.overlay}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessible
              accessibilityLabel="Go Back"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                size={24}
                color={isDarkMode ? COLORS.white : COLORS.black}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.headerTitle,
                { color: isDarkMode ? COLORS.white : COLORS.black },
              ]}
            >
              My Badges
            </Text>
            <FontAwesomeIcon icon={faTrophy} size={24} color={COLORS.gold} />
          </View>
  
          <FlatList
            data={badges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.badgeList}
          />
        </BlurView>
      </ImageBackground>
    );
  };
  
  export default Badges;