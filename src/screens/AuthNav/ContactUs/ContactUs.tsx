// src/components/ContactUs.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import InputField from '../../../components/Input/InputField';
import { submitFeedback } from '../../../services/userService';
import { showToast } from '../../../utils/helpers';
import { COLORS } from '../../../theme/theme';
import { FormStyles } from '../../../components/Modals/ModalStyles/FormStyles'; 

const ContactUs = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 500;

  const modalY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    Platform.OS === 'ios'
      ? PanResponder.create({
          onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
          onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
              modalY.setValue(gestureState.dy);
            }
          },
          onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 100) {
              navigation.goBack();
            } else {
              Animated.spring(modalY, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          },
        })
      : null
  ).current;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const submitHandler = async () => {
    if (!email || !message) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
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
      <View style={FormStyles.container}>
        <BlurView intensity={90} tint="dark" style={FormStyles.blurContainer}>
          <Animated.View
            style={[
              FormStyles.modalContent,
              { transform: [{ translateY: modalY }] },
            ]}
            {...(Platform.OS === 'ios' ? panResponder?.panHandlers : {})}
          >
            <View style={FormStyles.header}>
              <TouchableOpacity
                style={FormStyles.backButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Go Back"
                accessibilityHint="Navigates to the previous screen"
              >
                <Text style={FormStyles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <View style={FormStyles.titleContainer}>
              <Text style={FormStyles.modalHeader}>Contact Us</Text>
            </View>

            <View style={FormStyles.modalTextContainer}>
              <Text style={FormStyles.modalText}>
                We'd love to hear from you!
              </Text>
              <Text style={FormStyles.modalText}>
                Please fill out the form below:
              </Text>
            </View>

            <InputField
              label=""
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={FormStyles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={FormStyles.messageContainer}>
              <InputField
                label=""
                placeholder="Enter your message"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                style={FormStyles.messageInput}
                maxLength={MAX_CHARS}
              />
              <Text style={FormStyles.charCount}>{`${message.length}/${MAX_CHARS}`}</Text>
            </View>

            <TouchableOpacity
              style={[
                FormStyles.submitButton,
                isSubmitting && FormStyles.submitButtonDisabled,
              ]}
              onPress={submitHandler}
              disabled={isSubmitting}
              accessibilityLabel="Send Feedback"
              accessibilityHint="Submits your feedback"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={FormStyles.submitButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ContactUs;
