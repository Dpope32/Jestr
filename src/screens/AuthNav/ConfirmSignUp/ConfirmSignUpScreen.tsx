import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {confirmSignUp} from 'aws-amplify/auth';
import {signIn, fetchAuthSession, SignInInput} from 'aws-amplify/auth';
import * as SecureStore from 'expo-secure-store';

import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONTS,
  wp,
  elevationShadowStyle,
} from '../../../theme/theme';
import {storeUserIdentifier} from '../../../stores/secureStore';
import {
  AuthNavProp,
  ConfirmNavRouteProp,
} from '../../../navigation/NavTypes/AuthStackTypes';
import {useUserStore} from '../../../stores/userStore';

const CELL_COUNT = 6;

const ConfirmSignUpScreen = () => {
  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<ConfirmNavRouteProp>();

  const email = route.params?.email;
  console.log('Email in ConfirmSignUpScreen:', email);

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({username: email, confirmationCode: value});
      const password = useUserStore.getState().tempPassword;

      if (!password) {
        Alert.alert(
          'Confirmation Successful',
          'Your email has been confirmed. Please log in with your credentials.',
        );
        navigation.navigate('LandingPage');
        return;
      }

      const signInInput: SignInInput = {
        username: email,
        password: password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      };

      const {isSignedIn, nextStep} = await signIn(signInInput);

      if (isSignedIn) {
        const {tokens} = await fetchAuthSession();
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
        );
        navigation.navigate('CompleteProfile', {email});
      } else {
        console.log('Additional sign-in step required:', nextStep);
        Alert.alert(
          'Error',
          'Unable to sign in automatically. Please try logging in manually.',
        );
        navigation.navigate('LandingPage');
      }
    } catch (error: any) {
      console.error('Error in handleConfirmSignUp:', error);
      Alert.alert('Error', error.message || 'An unknown error occurred');
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
        renderCell={({index, symbol, isFocused}) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            style={[styles.cellRoot, isFocused && styles.focusCell]}>
            <Text style={styles.cellText}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleConfirmSignUp}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
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
    width: '90%',
    alignSelf: 'center',
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
    color: '#FFF',
    fontSize: 36,
    textAlign: 'center',
  },
  focusCell: {
    borderBottomColor: '#1bd40b',
    borderBottomWidth: 3,
  },
});

export default ConfirmSignUpScreen;
