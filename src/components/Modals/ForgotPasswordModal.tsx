// src/components/ForgotPasswordModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { handleForgotPassword as forgotPassword, confirmForgotPassword } from '../../services/authService';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import styles from './ModalStyles/ForgotPW.styles';

interface ForgotPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const CELL_COUNT = 6;

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ref = useBlurOnFulfill({ value: confirmationCode, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: confirmationCode,
    setValue: setConfirmationCode,
  });

  // Start fade-in animation when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

  const handleForgotPasswordClick = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please enter a valid email.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Confirmation code sent to your email.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send code. Try again.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmForgotPasswordClick = async () => {
    if (!confirmationCode || !newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Information',
        text2: 'Please fill in all fields.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    setLoading(true);
    try {
      await confirmForgotPassword(email, confirmationCode, newPassword);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset successfully.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to reset password. Try again.',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.innerContainer}>
            {step === 1 ? (
              <>
                <Text style={styles.modalTitle}>Forgot Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email here"
                  placeholderTextColor="#FFF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={handleForgotPasswordClick} style={styles.button} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Reset Password'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Enter Confirmation Code</Text>
                <CodeField
                  ref={ref}
                  {...props}
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
                {confirmationCode.length === CELL_COUNT && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#8AFF8A"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                )}
                <TouchableOpacity onPress={handleConfirmForgotPasswordClick} style={styles.button} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Confirm Password Reset'}</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ForgotPasswordModal;
