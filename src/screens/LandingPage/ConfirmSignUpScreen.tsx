import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { RouteProp } from '@react-navigation/core';
import { confirmSignUp } from 'aws-amplify/auth';
import { COLORS, SPACING, FONT_SIZES, FONTS, wp, elevationShadowStyle } from '../../theme/theme';

type ConfirmSignUpScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ConfirmSignUp'>;
  route: RouteProp<RootStackParamList, 'ConfirmSignUp'>;
};

const ConfirmSignUpScreen: React.FC<ConfirmSignUpScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({ username: email, confirmationCode });
      Alert.alert('Success', 'Your email has been confirmed.');
      navigation.navigate('CompleteProfileScreen', { email });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unknown error occurred');
    }
  };

  return (
<View style={styles.container}>
  <View style={styles.formContainer}>
    <Text style={styles.label}>Enter the confirmation code in your email:</Text>
    <TextInput
        style={styles.input}
        value={confirmationCode}
        onChangeText={setConfirmationCode}
        placeholder="Confirmation Code"
        keyboardType="number-pad"
        placeholderTextColor={COLORS.textSecondary}
        />
      <TouchableOpacity style={styles.button} onPress={handleConfirmSignUp}>
      <Text style={styles.buttonText}>Confirm</Text>
    </TouchableOpacity>
  </View>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: wp(4),
    ...elevationShadowStyle(5),
  },
  label: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  input: {
    height: wp(12),
    borderColor: COLORS.textSecondary,
    borderWidth: 1,
    borderRadius: wp(2),
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    backgroundColor: COLORS.surface,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: wp(2),
    alignItems: 'center',
    ...elevationShadowStyle(3),
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
});

export default ConfirmSignUpScreen;
