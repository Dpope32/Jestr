// src/screens/ChangePassword/ChangePassword.tsx
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
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/core';
import {RootStackParamList} from '../../../types/types';
type ChangePasswordRouteProp = RouteProp<RootStackParamList, 'ChangePassword'>;
type ChangePasswordNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChangePassword'
>;

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<ChangePasswordNavigationProp>();
  const route = useRoute<ChangePasswordRouteProp>();
  const {username, nextStep} = route.params;

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (nextStep.signInStep !== 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      Alert.alert('Error', 'Unexpected authentication step');
      return;
    }

    handleChangePassword(username, '', newPassword, navigation);
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
