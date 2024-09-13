import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { faUser, faKey, faUserSlash, faUserCircle, faDownload, faBell, faShieldAlt, faFileAlt, faHandsHelping, faCommentDots, faUniversalAccess } from '@fortawesome/free-solid-svg-icons';
import InputField from '../shared/Input/InutField';
import styles from './Settings.styles';
import PrivacySafetySettings from './PrivacySafetySettings';
import AccessibilitySettings from './AccessibilitySettings';
import AccountInformation from './AccountInformation';
import { ReactNode } from 'react';
import NotiSettings from './NotiSettings';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../constants/uiConstants'; 
import FeedbackForm from './feedbackForm';
import SupportHelp from './supportHelp';

export interface SettingOption {
  icon: any;
  label: string;
  description: string;
  content: ReactNode | ((props: { closeModal: () => void }) => ReactNode);
  subOptions?: SettingOption[];
}


export const settingsOptions: SettingOption[] = [
  {
    icon: faUser,
    label: 'Account Settings',
    description: 'Manage your account settings',
    content: null,
    subOptions: [
      {
        icon: faUserCircle,
        label: 'Account Information',
        description: 'View and edit your account details',
        content: ({ closeModal }) => <AccountInformation closeModal={closeModal} />,
      },
      {
        icon: faKey,
        label: 'Change Password',
        description: 'Update your account password',
        content: (
          <View>
            <InputField
              label="Current Password"
              placeholder="Enter current password"
              secureTextEntry
              value=""
              onChangeText={() => {}}
            />
            <InputField
              label="New Password"
              placeholder="Enter new password"
              secureTextEntry
              value=""
              onChangeText={() => {}}
            />
            <InputField
              label="Confirm New Password"
              placeholder="Confirm new password"
              secureTextEntry
              value=""
              onChangeText={() => {}}
            />
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        ),
      },
        {
          icon: faUserSlash,
          label: 'Deactivate Account',
          description: 'Temporarily deactivate your account',
          content: (
            <View>
              <Text style={styles.warningText}>Warning: This action will deactivate your account.</Text>
              <TouchableOpacity style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Deactivate Account</Text>
              </TouchableOpacity>
            </View>
          ),
        },
        {
          icon: faDownload,
          label: 'Download Data Archive',
          description: 'Download an archive of your data',
          content: (
            <View>
              <Text style={styles.settingTitle}>Download Your Data</Text>
              <Text style={styles.settingValue}>Request a copy of your Jestr data</Text>
              <TouchableOpacity style={styles.changeButton}>
                <Text style={styles.changeButtonText}>Request Download</Text>
              </TouchableOpacity>
            </View>
          ),
        },
      ],
    },
    {
      icon: faBell,
      label: 'Notifications',
      description: "Manage the kinds of notifications you'll receive",
      content: <NotiSettings />,
    },
    {
      icon: faShieldAlt,
      label: 'Privacy & Safety',
      description: 'Adjust privacy and safety settings',
      content: <PrivacySafetySettings />,
      subOptions: [
        {
          icon: faFileAlt,
          label: 'Privacy Policy',
          description: 'Read our privacy policy',
          content: (
            <ScrollView>
              <Text style={styles.legalText}>{PRIVACY_POLICY}</Text>
            </ScrollView>
          ),
        },
        {
          icon: faFileAlt,
          label: 'Terms and Conditions',
          description: 'Read our terms and conditions',
          content: (
            <ScrollView>
              <Text style={styles.legalText}>{TERMS_OF_SERVICE}</Text>
            </ScrollView>
          ),
        },
      ],
    },
    {
      icon: faHandsHelping,
      label: 'Support (Help)',
      description: 'Get help and support',
      content: <SupportHelp />,
    },
    {
      icon: faCommentDots,
      label: 'Feedback',
      description: 'Provide feedback to the developer',
      content: <FeedbackForm />,
    },
    {
      icon: faUniversalAccess,
      label: 'Accessibility',
      description: 'Customize accessibility options',
      content: <AccessibilitySettings />,
    },
  ];


