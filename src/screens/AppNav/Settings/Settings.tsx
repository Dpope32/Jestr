import React, {useState, useEffect} from 'react';
import {View,Text,TouchableOpacity,ScrollView,Modal,SafeAreaView} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSignOutAlt,faArrowRight,faArrowLeft,} from '@fortawesome/free-solid-svg-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {BlurView} from 'expo-blur';
import {SettingOption, settingsOptions} from './settingsOptions';
import styles from './Settings.styles';
import {handleSignOut} from '../../../services/authService';
import {useFollowStore} from '../../../stores/followStore';
import {useUserStore} from '../../../stores/userStore';
import * as SecureStore from 'expo-secure-store';
import {CommonActions} from '@react-navigation/native';
import LogoutModal from '../../../components/Modals/LogoutModal';
import {RootStackParamList} from '../../../types/types';
import {useIsFocused} from '@react-navigation/native';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList,'Settings'>;

const Settings: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingOption | null>(
    null,
  );
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const resetFollowStore = useFollowStore(state => state.reset);
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('Settings screen is focused:', isFocused);
  }, [isFocused]);

  const handleBackPress = () => {
    console.log('Back button pressed');
    navigation.goBack();
  };

  const openModal = (setting: SettingOption) => {
    setSelectedSetting(setting);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSetting(null);
  };

  const handleSignOutClick = () => {
    setLogoutModalVisible(true);
  };

  const confirmSignOut = async () => {
    try {
      await handleSignOut();
      const resetFollowStore = useFollowStore.getState().reset;
      resetFollowStore();
      await SecureStore.deleteItemAsync('accessToken');
      useUserStore.getState().setUserDetails({});
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'LandingPage'}],
        }),
      );
    } catch (error) {
      console.error('Error during sign-out:', error);
    } finally {
      setLogoutModalVisible(false);
    }
  };

  const cancelSignOut = () => {
    setLogoutModalVisible(false);
  };

  const renderSubOptions = (subOptions: SettingOption[]) => (
    <View style={styles.subOptionsContainer}>
      {subOptions.map((subOption, index) => (
        <TouchableOpacity
          key={index}
          style={styles.subOptionButton}
          onPress={() => openModal(subOption)}>
          <FontAwesomeIcon
            icon={subOption.icon}
            style={styles.subOptionIcon}
            size={20}
          />
          <Text style={styles.subOptionText}>{subOption.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSettingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <BlurView intensity={100} style={styles.blurView}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.modalBackButton}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1bd40b" />
            </TouchableOpacity>
            <Text style={styles.modalHeader}>{selectedSetting?.label}</Text>
            <Text style={styles.modalDescription}>
              {selectedSetting?.description}
            </Text>
            <ScrollView style={styles.modalScrollView}>
              {typeof selectedSetting?.content === 'function'
                ? selectedSetting.content({closeModal})
                : selectedSetting?.content}
              {selectedSetting?.subOptions &&
                renderSubOptions(selectedSetting.subOptions)}
            </ScrollView>
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e1e1e', '#111111']} style={styles.gradient}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={[styles.backButtonTouchable, {zIndex: 999}]}
          activeOpacity={0.5}>
          <View style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1bd40b" />
          </View>
        </TouchableOpacity>

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Settings</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {settingsOptions.map((option: SettingOption, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.buttonContainer}
                onPress={() => openModal(option)}>
                <LinearGradient
                  colors={['#2a2a2a', '#1a1a1a']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.button}>
                  <FontAwesomeIcon
                    icon={option.icon}
                    style={styles.icon}
                    size={24}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>{option.label}</Text>
                    <Text style={styles.buttonDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={styles.arrowIcon}
                    size={24}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleSignOutClick}>
              <FontAwesomeIcon
                icon={faSignOutAlt}
                style={styles.logoutIcon}
                size={16}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <LogoutModal
            visible={logoutModalVisible}
            onCancel={cancelSignOut}
            onConfirm={confirmSignOut}
          />
        </SafeAreaView>
      </LinearGradient>
      {renderSettingModal()}
    </View>
  );
};

export default Settings;
