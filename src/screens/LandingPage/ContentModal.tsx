import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InputField from '../../components/shared/Input/InutField';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '../../constants/uiConstants';
import { submitFeedback } from '../../services/userService';
import Toast from 'react-native-toast-message';

interface ContentModalProps {
  visible: boolean;
  onClose: () => void;
  content: 'privacy' | 'terms' | 'contact';
}

const ContentModal: React.FC<ContentModalProps> = ({ visible, onClose, content }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactUs = async () => {
    if (!email || !message) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(email, message, 'Contact');
      showToast('success', 'Success', 'Thank you for contacting us!');
      setEmail('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('error', 'Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (type: string, text1: string, text2: string) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      topOffset: 50,
      position: 'top'
    });
  };

  const renderContent = () => {
    switch (content) {
      case 'privacy':
        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalHeader}>Privacy Policy</Text>
            <Text style={styles.modalText}>
            {PRIVACY_POLICY}
            </Text>
          </ScrollView>
        );
      case 'terms':
        return (
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalHeader}>Terms of Service</Text>
            <Text style={styles.modalText}>
            {TERMS_OF_SERVICE}

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
                value={email}
                onChangeText={setEmail}
                labelStyle={styles.label} 
                inputStyle={{ color: '#FFF' }} 
              />
              <InputField
                label="Your Message"
                placeholder="Enter your message"
                placeholderTextColor="#FFF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                labelStyle={styles.label} 
                inputStyle={{ color: '#FFF' }} 
              />
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleContactUs}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
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
    color: '#FFFFFF', 
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
