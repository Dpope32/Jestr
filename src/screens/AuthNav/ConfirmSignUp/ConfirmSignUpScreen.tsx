import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { confirmSignUp, signIn, fetchAuthSession, SignInInput } from 'aws-amplify/auth';
import * as SecureStore from 'expo-secure-store';

import { COLORS, SPACING, FONT_SIZES, FONTS, wp, elevationShadowStyle } from '../../../theme/theme';
import { storeUserIdentifier } from '../../../stores/secureStore';
import { AuthNavProp, ConfirmNavRouteProp } from '../../../navigation/NavTypes/AuthStackTypes';
import { useUserStore } from '../../../stores/userStore';

const CELL_COUNT = 6;

const ConfirmSignUpScreen = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<ConfirmNavRouteProp>();

  const email = route.params?.email;

  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Automatically submit when the code is fully entered
  useEffect(() => {
    if (value.length === CELL_COUNT && !isSubmitting) {
      handleConfirmSignUp();
    }
  }, [value]);

  const handleConfirmSignUp = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    Keyboard.dismiss(); // Dismiss the keyboard
    try {
      // Correct usage of confirmSignUp
      await confirmSignUp({username: email, confirmationCode: value});
      console.log('Confirmation code verified successfully.');
      
      const password = useUserStore.getState().tempPassword;

      if (!password) {
        Alert.alert(
          'Confirmation Successful',
          'Your email has been confirmed. Please log in with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('LandingPage'),
            },
          ]
        );
        return;
      }

      const signInInput: SignInInput = {
        username: email,
        password: password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      };

      const { isSignedIn, nextStep } = await signIn(signInInput);

      if (isSignedIn) {
        const { tokens } = await fetchAuthSession();
        console.log('Tokens:', tokens);
        const accessToken = tokens?.accessToken?.toString();
        console.log('Access token: confirm sign up screen', accessToken);
        if (accessToken) {
          await SecureStore.setItemAsync('accessToken', accessToken);
          console.log('Access token stored successfully');
        }

        await storeUserIdentifier(email);

        // Clear the temporary password by setting it to an empty string
        useUserStore.getState().setTempPassword('');

        Alert.alert(
          'Success',
          'Your email has been confirmed and you are now signed in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('CompleteProfile', { email }),
            },
          ]
        );
      } else {
        console.log('Additional sign-in step required:', nextStep);
        Alert.alert(
          'Error',
          'Unable to sign in automatically. Please try logging in manually.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('LandingPage'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error in handleConfirmSignUp:', error);
      Alert.alert('Error', error.message || 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Confirmation Code</Text>
      <Text style={styles.subtitle}>
        Please enter the code sent to your email
      </Text>

      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={[styles.cellRoot, isFocused && styles.focusCell]}
          >
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      {isSubmitting ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleConfirmSignUp}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  button: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: wp(2),
    color: COLORS.white,
    alignItems: 'center',
    ...elevationShadowStyle(3),
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
  },
  codeFieldRoot: {
    marginTop: 20,
    marginBottom: 60,
    width: '100%',
    paddingHorizontal: 20,
  },
  cellRoot: {
    width: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 2,
    marginHorizontal: 5,
  },
  cellText: {
    color: COLORS.text, // Changed from '#FFF' to use theme color
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#1bd40b',
    borderBottomWidth: 3,
  },
});

export default ConfirmSignUpScreen;
