import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { handleForgotPassword as forgotPassword, confirmForgotPassword, resendConfirmationCode } from '../../services/authService';
import { COLORS } from '../../theme/theme';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

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
  
    const ref = useBlurOnFulfill({ value: confirmationCode, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value: confirmationCode,
      setValue: setConfirmationCode,
    });
  
    const handleForgotPassword = async () => {
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
        console.log('Sending forgot password request for email:', email); // Debug log
        await forgotPassword(email); // Await the function call; assume success if no error is thrown
        
        // Success feedback
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
      } catch (error) {
        console.error('Error in forgot password:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send code. Try again.',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      } finally {
        setLoading(false);
      }
    };
  
    const handleResendConfirmationCode = async () => {
        if (!email) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Input',
            text2: 'Please enter a valid email to resend the code.',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
          });
          return;
        }
      
        setLoading(true);
        try {
          const success = await resendConfirmationCode(email);
          if (success) {
            Toast.show({
              type: 'success',
              text1: 'Confirmation Code Resent',
              text2: 'Check your email for the new confirmation code.',
              visibilityTime: 2000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40,
            });
          } else {
            throw new Error('Failed to resend confirmation code');
          }
        } catch (error) {
          console.error('Error resending confirmation code:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to resend confirmation code. Try again.',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
          });
        } finally {
          setLoading(false);
        }
      };
      
  

    const handleConfirmForgotPassword = async () => {
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
          console.log('Confirming forgot password for email:', email); // Debug log
          await confirmForgotPassword(email, confirmationCode, newPassword); // Await the function call; assume success if no error is thrown
    
          // Success feedback
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Password reset successfully.',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
          });
          onClose(); // Close modal after success
        } catch (error) {
          console.error('Error confirming password reset:', error);
    
          // Type guard to check if 'error' is an instance of 'Error' and has a 'message' property
          if (
            error instanceof Error &&
            (error.name === 'InvalidPasswordException' ||
              error.message.includes('Password does not conform to policy'))
          ) {
            // Specific toast for invalid password policy
            Toast.show({
              type: 'error',
              text1: 'Invalid Password',
              text2: 'Password must have symbol characters.',
              visibilityTime: 2000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40,
            });
          } else {
            // Generic error toast
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to reset password. Try again.',
              visibilityTime: 2000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 40,
            });
          }
        } finally {
          setLoading(false);
        }
      };
  
      return (
        <Modal visible={isVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
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
                <TouchableOpacity onPress={handleForgotPassword} style={styles.button} disabled={loading}>
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
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}>
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
                <TouchableOpacity onPress={handleConfirmForgotPassword} style={styles.button} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Confirm Password Reset'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResendConfirmationCode} style={styles.resendButton} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Resending...' : 'Resend Confirmation Code'}</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      );
    };

    const styles = StyleSheet.create({
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
        modalTitle: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 20,
          color: '#fff',
        },
        input: {
          width: '80%',
          padding: 10,
          backgroundColor: 'transparent',
          borderColor: COLORS.primary,
          borderWidth: 2,
          borderRadius: 5,
          marginBottom: 10,
          color: '#FFF',
        },
        codeFieldRoot: {
          width: '80%',
          marginBottom: 20,
        },
        cell: {
          width: 40,
          height: 40,
          lineHeight: 38,
          fontSize: 24,
          borderWidth: 2,
          borderColor: COLORS.primary,
          textAlign: 'center',
          color: COLORS.primary,
        },
        focusCell: {
          borderColor: '#8AFF8A',
        },
        button: {
          backgroundColor: COLORS.primary,
          marginVertical: 10,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
        },
        resendButton: {
          backgroundColor: COLORS.accent,
          marginVertical: 10,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
        },
        buttonText: {
          color: '#fff',
          fontSize: 16,
        },
        closeButton: {
          marginTop: 20,
        },
        closeButtonText: {
          color: '#fff',
          fontSize: 16,
        },
      });
      
      export default ForgotPasswordModal;
