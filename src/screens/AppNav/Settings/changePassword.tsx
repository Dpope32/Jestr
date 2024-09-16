import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import InputField from '../../../components/Input/InputField';
import { updatePassword } from '../../../services/authService';
import { useUserStore } from '../../../stores/userStore';

const ChangePassword: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const email = useUserStore(state => state.email);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields.',
        visibilityTime: 2000,
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password and confirm password do not match.',
        visibilityTime: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      await updatePassword(email, newPassword);
      
      // Close the modal immediately
      closeModal();

      // Show success toast after a short delay
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated successfully.',
          visibilityTime: 2000,
        });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={updatedStyles.container}>
      <InputField
        label=""
        placeholder="Enter current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <InputField
        label=""
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <InputField
        label=""
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" style={updatedStyles.loadingIndicator} />
      ) : (
        <TouchableOpacity style={updatedStyles.changeButton} onPress={handleUpdatePassword}>
          <Text style={updatedStyles.changeButtonText}>Update Password</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChangePassword;


const updatedStyles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
  },
  changeButton: {
    backgroundColor: '#1bd40b',
    marginTop: 20, // Add padding above the button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20, // Keep consistent spacing with button
  },
});
