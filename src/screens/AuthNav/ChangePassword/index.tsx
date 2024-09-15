import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {handleChangePassword} from '../../../services/authService';
import {useRoute} from '@react-navigation/core';

import {ChangePasswordNavRouteProp} from '../../../navigation/NavTypes/AuthStackTypes';

const ChangePassword = () => {
  const route = useRoute<ChangePasswordNavRouteProp>();
  const {username, nextStep} = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (nextStep.signInStep !== 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      Alert.alert('Error', 'Unexpected authentication step');
      return;
    }
    try {
      await handleChangePassword(username as string, '', newPassword);
      // !!! AFTER changing password, in theory, with setting a new user in AuthStack
      // !!! this action happens in handleChangePassword in authService.ts
      // !!! the app should navigate to the Feed screen automatically
      //  navigation.navigate('Feed', {userEmail: user.email});
      //  navigation.navigate('Feed');
    } catch (error: any) {
      console.log('Error changing password:', error);
      Alert.alert('Error', error?.message || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChangePassword;
