// supportHelp.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import InputField from '../../../components/Input/InputField';
import { submitFeedback } from '../../../services/userService';
import Toast from 'react-native-toast-message';
import { useUserStore } from '../../../stores/userStore';
import { faqs } from '../../../constants/uiConstants';
import { COLORS } from '../../../theme/theme';

const SupportHelp = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [email, setEmail] = useState(useUserStore.getState().email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async () => {
    if (!email || !message) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(email, message, 'Support');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Thank you for contacting support. We\'ll get back to you soon!',
      });
      setMessage('');
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting support request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit support request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.contactButton]} 
          onPress={() => {
            setShowFeedbackForm(true);
            setShowFAQs(false);
          }}
        >
          <FontAwesome5 name="headset" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.faqButton]} 
          onPress={() => {
            setShowFAQs(true);
            setShowFeedbackForm(false);
          }}
        >
          <FontAwesome5 name="question-circle" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>View FAQs</Text>
        </TouchableOpacity>
      </View>

      {showFeedbackForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Contact Support</Text>
          <InputField
            label=""
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label=""
            placeholder="Describe your issue"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            style={styles.messageInput}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowFeedbackForm(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showFAQs && (
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <InputField
            placeholder="Search FAQs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            label=''
          />
          {filteredFAQs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={() => setShowFAQs(false)}
          >
            <Text style={styles.buttonText}>Close FAQs</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  contactButton: {
    backgroundColor: '#00ff00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  faqButton: {
    backgroundColor: COLORS.buttonStart, // This is the dark green color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#2c2c2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#00ff00',
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    flex: 1,
    marginLeft: 5,
  },
  faqContainer: {
    backgroundColor: '#2c2c2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#3a3a3c',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    color: '#ffffff',
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: '#3a3a3c',
    borderRadius: 10,
    padding: 15,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  answer: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    marginTop: 20,
  },
});

export default SupportHelp;