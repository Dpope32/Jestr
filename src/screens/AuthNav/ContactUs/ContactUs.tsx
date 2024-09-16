import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../../components/Input/InputField';
import { submitFeedback } from '../../../services/userService';
import { showToast } from '../../../utils/helpers';

const ContactUs = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 500;

  const submitHandler = async () => {
    if (!email || !message) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(email, message, 'New');
      navigation.goBack();
      setTimeout(() => {
        showToast('success', 'Success', 'Thank you for your feedback!');
      }, 300);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('error', 'Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalHeader}>Contact Us</Text>
        </View>
        <Text style={styles.modalText}>Please fill out the form below:</Text>

        <InputField
          label=""
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputField}
        />
        <View style={styles.messageContainer}>
          <InputField
            label=""
            placeholder="Enter your message"
            value={message}
            onChangeText={(text) => setMessage(text)}
            multiline
            numberOfLines={4}
            style={styles.messageInput}
            maxLength={MAX_CHARS}
          />
          <Text style={styles.charCount}>
            {`${message.length}/${MAX_CHARS}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitHandler}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 15,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 30,
    textAlign: 'center',
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    fontSize: 12,
    color: '#AAAAAA',
  },
  messageContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputField: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#FFFFFF',
  },
  messageInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    height: 100,
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4CAF50AA',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ContactUs;
