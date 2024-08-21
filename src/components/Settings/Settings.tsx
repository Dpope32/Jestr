import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faBell, faLock, faShieldAlt, faHandsHelping, faCommentDots, faSignOutAlt, faUniversalAccess, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './Settings.styles';
import { useNavigation } from '@react-navigation/native';

const settingsOptions = [
  { icon: faUser, label: 'Account Settings', description: 'Manage your account settings' },
  { icon: faBell, label: 'Notifications', description: 'Manage the kinds of notifications you\'ll receive' },
  { icon: faLock, label: 'Blocked Accounts', description: 'View and manage blocked accounts' },
  { icon: faHandsHelping, label: 'Support (Help)', description: 'Get help and support' },
  { icon: faCommentDots, label: 'Feedback', description: 'Provide feedback to the developer' },
  { icon: faShieldAlt, label: 'Privacy & Safety', description: 'Adjust privacy and safety settings' },
  { icon: faUniversalAccess, label: 'Accessibility', description: 'Customize accessibility options' },
];

const Settings = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={14} color="#1bd40b" />
        </TouchableOpacity>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity key={index} style={styles.buttonContainer}>
          <LinearGradient
            colors={['#111111','#111111','#111111','#111111', '#111111','#111111','#111111','#111111']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <FontAwesomeIcon icon={option.icon} style={styles.icon} size={24} />
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>{option.label}</Text>
              <Text style={styles.buttonDescription}>{option.description}</Text>
            </View>
            <FontAwesomeIcon icon={faArrowRight} style={styles.arrowIcon} size={24} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.button, styles.logoutButton]}>
        <FontAwesomeIcon icon={faSignOutAlt} style={styles.icon} size={24} />
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Settings;
