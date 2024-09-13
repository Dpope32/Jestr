import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import InputField from '../shared/Input/InutField';
import styles from './Settings.styles';
import { submitFeedback, getFeedback } from '../../services/userService';
import { useUserStore } from '../../stores/userStore';
import Toast from 'react-native-toast-message';


interface FeedbackItem {
  Message: string;
  Timestamp: string;
  Status: string;
}

const MAX_CHARS = 500;

const StatusDot = ({ status }: { status: string }) => {
  let color = '#FFFFFF'; // Default color
  if (status === 'New') color = '#00FF00'; // Green
  if (status === 'In Progress') color = '#0000FF'; // Blue

  return (
    <View style={[styles.statusDot, { backgroundColor: color }]} />
  );
};

const FeedbackForm = () => {
  const userEmail = useUserStore(state => state.email);
  const [email, setEmail] = useState(userEmail || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [formVisible, setFormVisible] = useState(true); // New state to control form visibility
  const [isLoading, setIsLoading] = useState(false); 


  useEffect(() => {
    fetchFeedbackItems();
  }, []);

  const fetchFeedbackItems = async () => {
    setIsLoading(true);  // Set loading to true before fetching
    try {
      const response = await getFeedback(userEmail);
      setFeedbackItems(response.data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showToast('error', 'Error', 'Failed to fetch feedback items');
    } finally {
      setIsLoading(false);  // Set loading to false after fetching
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

  const handleSubmit = async () => {
    if (!email || !message) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }
  
    setIsSubmitting(true);
    try {
      await submitFeedback(email, message, 'New'); // Add 'New' status
      setFormVisible(false);
      showToast('success', 'Success', 'Thank you for your feedback!');
      setMessage('');
      fetchFeedbackItems();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('error', 'Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {formVisible && (
          <View style={styles.formContainer}>
            <Text style={styles.modalText}>Please fill out the form below:</Text>
            <InputField
              label=""
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.messageContainer}>
              <InputField
                label=""
                placeholder="Enter your message"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
                style={styles.messageInput}
                maxLength={MAX_CHARS}
              />
              <Text style={styles.charCount}>
                {`${message.length}/${MAX_CHARS}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator for Open Feedback Section */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#00ff00" style={styles.loadingIndicator} />
        ) : feedbackItems.length > 0 && (
          <View style={styles.feedbackListContainer}>
            <Text style={styles.feedbackListTitle}>Your Open Feedback</Text>
            {feedbackItems.map((item, index) => (
              <View key={index} style={styles.feedbackItem}>
                <Text style={styles.feedbackIndex}>{`${index + 1}.`}</Text>
                <View style={styles.feedbackContent}>
                  <Text style={styles.feedbackPreview} numberOfLines={1}>
                    {item.Message}
                  </Text>
                  <Text style={styles.feedbackTimestamp}>
                    {formatDate(item.Timestamp)}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <StatusDot status={item.Status} />
                  <Text style={styles.feedbackStatus}>
                    {item.Status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FeedbackForm;