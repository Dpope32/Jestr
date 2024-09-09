import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InputField from '../../components/shared/Input/InutField';

interface ContentModalProps {
  visible: boolean;
  onClose: () => void;
  content: 'privacy' | 'terms' | 'contact';
}

const ContentModal: React.FC<ContentModalProps> = ({ visible, onClose, content }) => {
  const renderContent = () => {
    switch (content) {
      case 'privacy':
        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalHeader}>Privacy Policy</Text>
            <Text style={styles.modalText}>
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
        );
      case 'terms':
        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalHeader}>Terms of Service</Text>
            <Text style={styles.modalText}>
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
        );
      case 'contact':
        return (
          <View style={styles.modalContent}>
            <Text style={[styles.modalHeader, styles.centerText]}>Contact Us</Text>
            <Text style={[styles.modalText, styles.centerText]}>Please fill out the form below:</Text>
            <InputField
  label="Your Email"
  placeholder="Enter your email"
  placeholderTextColor="#FFF"
  value=""
  onChangeText={() => {}}
  labelStyle={styles.label} 
  inputStyle={{ color: '#FFF' }}  // Ensure text color is white
/>
<InputField
  label="Your Message"
  placeholder="Enter your message"
  placeholderTextColor="#FFF"
  value=""
  onChangeText={() => {}}
  multiline
  numberOfLines={6}
  labelStyle={styles.label} 
  inputStyle={{ color: '#FFF' }}  // Ensure text color is white
/>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleContactUs()}>
              <Text style={styles.submitButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const handleContactUs = async () => {
    try {
      // Implement your Lambda invocation logic here
      onClose();
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <BlurView intensity={100} style={styles.blurView}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color="#FFF" />
          </TouchableOpacity>
          {renderContent()}
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF', // White text for labels
    fontWeight: '600',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 25,
    justifyContent: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 24,
  },
  input: {
    color: '#FFF',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  messageInput: {
    height: 100,  // Taller height for the message input field
  },
  submitButton: {
    marginTop: 25,
    backgroundColor: '#00cc44',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ContentModal;
