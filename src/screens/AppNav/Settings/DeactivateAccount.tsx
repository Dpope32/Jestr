import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useUserStore } from '../../../stores/userStore';
import { handleSignOut } from '../../../services/authService';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { AuthNavProp } from '../../../navigation/NavTypes/AuthStackTypes'; // Import the correct navigation type

const DeactivateAccount: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const [loading, setLoading] = useState(false);
  const { email } = useUserStore();
  const navigation = useNavigation<AuthNavProp>(); // Use the correct navigation type

  const handleDeactivateAccount = async () => {
    Alert.alert(
      'Are you sure?',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Deactivate',
          onPress: async () => {
            setLoading(true);

            try {
              const token = await SecureStore.getItemAsync('accessToken');
              if (!token) {
                console.error('No access token found');
                throw new Error('No access token found');
              }

              console.log('Sending delete account request with email:', email);

              const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/deleteAccount', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ operation: 'deleteAccount', email }),
              });

              console.log('Response status:', response.status);
              console.log('Response headers:', response.headers);

              const responseText = await response.text();
              console.log('Response text:', responseText);

              let responseData;
              try {
                responseData = JSON.parse(responseText);
              } catch (e) {
                console.error('Error parsing response JSON:', e);
                responseData = { message: 'Invalid response from server' };
              }

              if (response.ok) {
                console.log('Account deletion successful, signing out...');
                await handleSignOut(navigation);
                Toast.show({
                  type: 'success',
                  text1: 'Account Deleted',
                  text2: 'Your account has been deleted successfully.',
                });
                setTimeout(() => {
                  closeModal();
                  // Navigate to the LandingPage instead of using reset
                  navigation.navigate('LandingPage');
                }, 2000);
              } else {
                console.error('Server responded with error:', responseData.message);
                throw new Error(responseData.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error in account deletion process:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`,
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <>
          <Text style={styles.warningText}>
            Are you sure you want to deactivate your account? This action cannot be undone.
          </Text>
          <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivateAccount}>
            <Text style={styles.deactivateButtonText}>Deactivate Account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#3C3C3C', // Dark background
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    alignItems: 'center',
  },
  warningText: {
    color: '#FF6B6B', // Softer red for warning
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  deactivateButton: {
    backgroundColor: '#FF4757', // Bright red for danger
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  deactivateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeactivateAccount;