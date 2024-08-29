import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, Switch } from 'react-native';
import  Slider  from '@react-native-community/slider'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faUser,faBell,faLock,faShieldAlt,faHandsHelping,faCommentDots,faSignOutAlt,faUniversalAccess,faArrowRight,
   faArrowLeft,faUserCircle,faKey,faUserSlash,faDownload, faUserLock,faEnvelope,faAddressBook,faFileAlt,} from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import InputField from '../shared/Input/InutField';
import styles from './Settings.styles';

interface SettingOption {
  icon: any;
  label: string;
  description: string;
  content: React.ReactNode;
  subOptions?: SettingOption[];
}

const settingsOptions: SettingOption[] = [
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
        content: (
          <View>
            <Text style={styles.settingTitle}>Username</Text>
            <Text style={styles.settingValue}>JohnDoe123</Text>
            <Text style={styles.settingTitle}>Email</Text>
            <Text style={styles.settingValue}>johndoe@example.com</Text>
          </View>
        ),
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
    content: (
      <View>
        <View style={styles.notificationSetting}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch />
        </View>
        <View style={styles.notificationSetting}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Switch />
        </View>
        <View style={styles.notificationSetting}>
          <Text style={styles.settingTitle}>SMS Notifications</Text>
          <Switch />
        </View>
      </View>
    ),
  },
  {
    icon: faShieldAlt,
    label: 'Privacy & Safety',
    description: 'Adjust privacy and safety settings',
    content: null,
    subOptions: [
      {
        icon: faUserLock,
        label: 'Blocked Accounts',
        description: 'View and manage blocked accounts',
        content: (
          <View>
            <Text style={styles.settingTitle}>Blocked Users</Text>
            <Text style={styles.settingValue}>No blocked users</Text>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Manage Blocked Accounts</Text>
            </TouchableOpacity>
          </View>
        ),
      },
      {
        icon: faEnvelope,
        label: 'Direct Messages',
        description: 'Manage who can send you direct messages',
        content: (
          <View>
            <View style={styles.notificationSetting}>
              <Text style={styles.settingTitle}>Allow DMs from Everyone</Text>
              <Switch />
            </View>
            <View style={styles.notificationSetting}>
              <Text style={styles.settingTitle}>Allow DMs from Followers Only</Text>
              <Switch />
            </View>
          </View>
        ),
      },
      {
        icon: faAddressBook,
        label: 'Discoverability and Contacts',
        description: 'Control how people can find you',
        content: (
          <View>
            <View style={styles.notificationSetting}>
              <Text style={styles.settingTitle}>Allow Search by Email</Text>
              <Switch />
            </View>
            <View style={styles.notificationSetting}>
              <Text style={styles.settingTitle}>Allow Search by Phone Number</Text>
              <Switch />
            </View>
          </View>
        ),
      },
      {
        icon: faFileAlt,
        label: 'Privacy Policy',
        description: 'Read our privacy policy',
        content: (
          <ScrollView>
            <Text style={styles.legalText}>
            **Privacy Policy**

**Effective Date:** 08/20/2024

**1. Introduction**

This Privacy Policy outlines how Jestr ("we," "our," or "us") collects, uses, discloses, and safeguards your information when you use our mobile application ("App"). Please read this policy carefully to understand our views and practices regarding your personal data and how we will treat it.

**2. Information We Collect**

We may collect and process the following data about you:

- **Personal Information:** Your name, email address, and other contact information provided by you during registration or contact forms.
- **Usage Data:** Details of your use of our App, including traffic data, location data, logs, and other communication data.
- **Device Information:** Information about your mobile device, including your IP address, operating system, and mobile network information.

**3. How We Use Your Information**

We use the information we collect to:

- Provide, operate, and maintain our App.
- Improve, personalize, and expand our App.
- Understand and analyze how you use our App.
- Communicate with you, either directly or through one of our partners, for customer service, updates, marketing, and promotional purposes.

**4. Sharing Your Information**

We may share your personal information with:

- **Service Providers:** We may share your information with third-party service providers to perform services on our behalf.
- **Legal Requirements:** We may disclose your information if required by law or in response to valid requests by public authorities.

**5. Security of Your Information**

We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.

**6. Your Data Protection Rights**

Depending on your location, you may have the following rights regarding your personal data:

- The right to access – You have the right to request copies of your personal data.
- The right to rectification – You have the right to request that we correct any information you believe is inaccurate.
- The right to erasure – You have the right to request that we erase your personal data under certain conditions.

**7. Changes to This Privacy Policy**

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.

**8. Contact Us**

If you have any questions or concerns about this Privacy Policy, please contact us at:

jestrdev@gmail.com

**9. Acceptance of This Policy**

By using our App, you signify your acceptance of this policy. If you do not agree to this policy, please do not use our App. Your continued use of the App following the posting of changes to this policy will be deemed your acceptance of those changes.

---
            </Text>
          </ScrollView>
        ),
      },
      {
        icon: faFileAlt,
        label: 'Terms and Conditions',
        description: 'Read our terms and conditions',
        content: (
          <ScrollView>
            <Text style={styles.legalText}>
            **Terms of Service**

**Effective Date:** 08/20/2024

**1. Acceptance of Terms**

By accessing or using Jestr ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the App.

**2. Changes to Terms**

We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the updated Terms on the App. Your continued use of the App after the changes have been made constitutes your acceptance of the new Terms.

**3. Use of the App**

- You must be at least 13 years old to use the App.
- You are responsible for your use of the App and for any content you post on the App.
- You agree not to use the App for any illegal or unauthorized purposes.

**4. User Accounts**

- To access certain features of the App, you may be required to create an account.
- You are responsible for maintaining the confidentiality of your account information and password.
- You agree to notify us immediately of any unauthorized use of your account.

**5. Content**

- You retain ownership of the content you post on the App.
- By posting content, you grant us a non-exclusive, royalty-free, worldwide, and transferable license to use, display, and distribute your content on the App.

**6. Prohibited Conduct**

You agree not to:

- Use the App for any unlawful purposes.
- Post or share any content that is illegal, offensive, or infringes on the rights of others.
- Attempt to interfere with the security or functionality of the App.

**7. Termination**

We reserve the right to terminate or suspend your account at our discretion if you violate these Terms.

**8. Disclaimer of Warranties**

The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted or error-free.

**9. Limitation of Liability**

To the fullest extent permitted by law, we shall not be liable for any damages arising out of or in connection with your use of the App.

**10. Governing Law**

These Terms shall be governed by and construed in accordance with the laws of the United States of America.

**11. Contact Information**

If you have any questions about these Terms, please contact us at jestrdev@gmail.com.

**12. Entire Agreement**

These Terms constitute the entire agreement between you and us regarding the use of the App.

            </Text>
          </ScrollView>
        ),
      },
    ],
  },
  {
    icon: faHandsHelping,
    label: 'Support (Help)',
    description: 'Get help and support',
    content: (
      <View>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>User Guide</Text>
        </TouchableOpacity>
      </View>
    ),
  },
  {
    icon: faCommentDots,
    label: 'Feedback',
    description: 'Provide feedback to the developer',
    content: (
      <View>
        <Text style={styles.modalHeader}>Contact Us</Text>
        <Text style={styles.modalText}>Please fill out the form below:</Text>
        <InputField
          label="Your Email"
          placeholder="Enter your email"
          value=""
          onChangeText={() => {}}
        />
        <InputField
          label="Your Message"
          placeholder="Enter your message"
          value=""
          onChangeText={() => {}}
          multiline
          numberOfLines={6}
        />
        <TouchableOpacity style={styles.submitButton} onPress={() => {}}>
          <Text style={styles.submitButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    ),
  },
  {
    icon: faUniversalAccess,
    label: 'Accessibility',
    description: 'Customize accessibility options',
    content: (
      <View>
        <Text style={styles.settingTitle}>Font Size</Text>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={1}
          onValueChange={() => {}}
        />
        <View style={styles.notificationSetting}>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Switch />
        </View>
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Change Language</Text>
        </TouchableOpacity>
        <View style={styles.notificationSetting}>
          <Text style={styles.settingTitle}>Likes Private</Text>
          <Switch />
        </View>
        <Text style={styles.settingTitle}>Local Storage Usage</Text>
        <Text style={styles.settingValue}>23 MB used</Text>
      </View>
    ),
  },
];

const Settings: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingOption | null>(null);
  const [fontSize, setFontSize] = useState<number>(1);

  const openModal = (setting: SettingOption) => {
    setSelectedSetting(setting);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSetting(null);
  };

  const renderSubOptions = (subOptions: SettingOption[]) => (
    <View style={styles.subOptionsContainer}>
      {subOptions.map((subOption, index) => (
        <TouchableOpacity
          key={index}
          style={styles.subOptionButton}
          onPress={() => openModal(subOption)}
        >
          <FontAwesomeIcon icon={subOption.icon} style={styles.subOptionIcon} size={20} />
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
      onRequestClose={closeModal}
    >
      <BlurView intensity={100} style={styles.blurView}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.modalBackButton}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1bd40b" />
            </TouchableOpacity>
            <Text style={styles.modalHeader}>{selectedSetting?.label}</Text>
            <Text style={styles.modalDescription}>{selectedSetting?.description}</Text>
            <ScrollView style={styles.modalScrollView}>
              {selectedSetting?.content}
              {selectedSetting?.subOptions && renderSubOptions(selectedSetting.subOptions)}
            </ScrollView>
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1e1e', '#111111']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1bd40b" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Settings</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {settingsOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.buttonContainer}
                onPress={() => openModal(option)}
              >
                <LinearGradient
                  colors={['#2a2a2a', '#1a1a1a']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.button}
                >
                  <FontAwesomeIcon icon={option.icon} style={styles.icon} size={24} />
                  <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>{option.label}</Text>
                    <Text style={styles.buttonDescription}>{option.description}</Text>
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
            <TouchableOpacity style={styles.logoutButton}>
              <FontAwesomeIcon icon={faSignOutAlt} style={styles.logoutIcon} size={16} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
      {renderSettingModal()}
    </View>
  );
};

export default Settings;