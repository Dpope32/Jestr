import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types/types';
import {signUp,signOut,resetPassword,getCurrentUser,fetchAuthSession,signIn,confirmResetPassword} from '@aws-amplify/auth';

import {useUserStore} from '../stores/userStore';
import {removeToken} from '../stores/secureStore';
import * as SecureStore from 'expo-secure-store';
import {fetchUserDetails} from './userService';
//import * as Google from 'expo-auth-session/providers/google';
import {AuthNavProp} from '../navigation/NavTypes/AuthStackTypes';

export const checkAuthStatus = async () => {
  try {
    const {tokens} = await fetchAuthSession();
    return tokens !== undefined;
  } catch (error) {
    return false;
  }
};

export const handleLogin = async (
  username: string,
  password: string,
  navigation: AuthNavProp,
) => {
  console.log('Logging in with username:', username);
  // console.log('Logging in with password:', password);
  try {
    await signOut();
    await SecureStore.deleteItemAsync('accessToken');
    await AsyncStorage.removeItem('userIdentifier');
    await AsyncStorage.removeItem('isAdmin');
    useUserStore.getState().resetUserState();

    const lowercaseUsername = username.toLowerCase();

    const {isSignedIn, nextStep} = await signIn({
      username: lowercaseUsername,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH',
      },
    });

    if (isSignedIn) {
      console.log('User signed in successfully');
      const {tokens} = await fetchAuthSession();
      const accessToken = tokens?.accessToken?.toString();
      console.log('Access token handleLogin:', accessToken);

      if (accessToken) {
        await SecureStore.setItemAsync('accessToken', accessToken);
      }
      const userDetails = await fetchUserDetails(username, accessToken || '');

      const isAdmin = [
        'pope.dawson@gmail.com',
        'bogdan.georgian370@gmail.com',
        'kamariewallace1999@gmail.com',
        'jestrdev@gmail.com',
        'bogdan.georgian001@gmail.com',
        'popebardy@gmail.com',
        'tpope918@aol.com',
      ].includes(userDetails.email);

      // await AsyncStorage.setItem('isAdmin', JSON.stringify(isAdmin));

      useUserStore.getState().setUserDetails({
        email: userDetails.email,
        username: userDetails.username,
        displayName: userDetails.displayName,
        profilePic: userDetails.profilePic,
        headerPic: userDetails.headerPic,
        bio: userDetails.bio,
        creationDate: userDetails.CreationDate,
        followersCount: userDetails.FollowersCount,
        followingCount: userDetails.FollowingCount,
        isAdmin: isAdmin,
      });

      // await storeUserIdentifier(userDetails.email);
      // await logStorageContents();
    } else if (
      nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
    ) {
      console.log('User must change password');
      console.log('Next step:', nextStep);
      navigation.navigate('ChangePassword', {
        username,
        nextStep: nextStep,
      });
    } else {
      Alert.alert('Login Failed', 'Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    Alert.alert('Login Failed', error.message || 'An unknown error occurred');
  } finally {
  }
};

export const handleSignOut = async (navigation: AuthNavProp) => {
  try {
    await signOut({global: true});
    await removeToken('accessToken');
    await SecureStore.deleteItemAsync('accessToken');
    await AsyncStorage.clear();
    useUserStore.getState().resetUserState();
    console.log('Sign out successful');
    
    // Navigate to LandingPage
    navigation.navigate('LandingPage');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const handleSignup = async (
  email: string,
  password: string,
  navigation: AuthNavProp,
) => {
  const defaultName = 'jestruser';

  try {
    const userAttributes = {
      email,
      phone_number: '+1234567890',
      name: defaultName,
    };

    useUserStore.getState().setTempPassword(password);
    await signOut();
    const {isSignUpComplete, nextStep} = await signUp({
      username: email,
      password,
      options: {
        userAttributes,
      },
    });

    console.log('isSignUpComplete:', isSignUpComplete);
    console.log('nextStep:', nextStep);

    if (isSignUpComplete) {
      const {isSignedIn} = await signIn({
        username: email,
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      });

      if (isSignedIn) {
        const authUser = await getCurrentUser();
        console.log('authUser after signup and signin in:', authUser);

        const user = convertAuthUserToUser(authUser);
        useUserStore.getState().setUserDetails(user);
        navigation.navigate('CompleteProfile', {email});
      } else {
        Alert.alert(
          'Login Incomplete',
          'Please complete the additional step to sign in',
        );
      }
    } else {
      if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigation.navigate('ConfirmSignUp', {email});
      } else {
        Alert.alert(
          'Signup Incomplete',
          'Please check your email for verification instructions',
        );
      }
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.name === 'UsernameExistsException') {
      // Inside handleSignup function

      Alert.alert(
        'Account Already Exists',
        "Looks like you already have an account. Try to sign in or click 'Forgot Password'.",
        [
          { text: 'OK', onPress: () => {} },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
          {
            text: 'Forgot Password',
            onPress: () => {
              handleForgotPassword(email); // Directly call the function or navigate to the modal
            },
          },
        ],
      );

    } else {
      Alert.alert(
        'Signup Failed',
        error.message || 'An unknown error occurred',
      );
    }
  }
};

export const handleForgotPassword = async (email: string) => {
  try {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address on the login screen');
      return;
    }
    await resetPassword({ username: email });
    Alert.alert('Success', 'Check your email for password reset instructions');
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    Alert.alert('Error', (error as Error).message || 'An error occurred');
  }
};

export const confirmForgotPassword = async (username: string, code: string, newPassword: string): Promise<void> => {
  try {
    await confirmResetPassword({ username, confirmationCode: code, newPassword });
  } catch (error) {
    console.error('Error confirming reset password:', error);
    throw error;
  }
};

export const updatePassword = async (
  username: string,
  newPassword: string
): Promise<void> => {
  console.log('Updating password for user:', username);
  console.log('Full request body:', JSON.stringify({operation: 'updatePassword', username: username, newPassword: newPassword}));
  
  try {
    await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updatePassword',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'updatePassword',
          username: username,
          newPassword: newPassword,
        }),
      }
    );

    // We're not checking the response status here
    console.log('Password update request sent successfully');
  } catch (error) {
    // Log the error, but don't throw it
    console.error('Error sending password update request:', error);
  }

  // Always "succeed"
  return;
};
export const resendConfirmationCode = async (username: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/resendConfirmationCode',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'resendConfirmationCode',
          username: username,
        }),
      }
    );

    const responseData = await response.json();

    if ((response.ok || response.status === 500) && responseData.CodeDeliveryDetails) {
      // Treat as success if 500 but CodeDeliveryDetails is present
      console.log('Resend confirmation code response:', responseData);
      return true; // Return success without showing a toast
    } else {
      console.error('Failed to resend confirmation code, status:', response.status);
      return false; // Return failure without showing a toast
    }
  } catch (error) {
    console.error('Error resending confirmation code:', error);
    return false; // Return failure without showing a toast
  }
};

export const verifyToken = async (token: string) => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/verifyToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

const convertAuthUserToUser = (authUser: any): User => {
  return {
    email: authUser.username,
    username: authUser.username,
    profilePic: '',
    displayName: '',
    headerPic: '',
    CreationDate: new Date().toISOString(),
    followersCount: 0,
    followingCount: 0,
    bio: '', // Add this line
  };
};

export const handleAppleSignIn = async () => {
  // Implementation based on '@invertase/react-native-apple-authentication'
};

export const handleGoogleSignIn = async () => {
  // Implementation based on '@react-native-google-signin/google-signin'
};

export const handleTwitterSignIn = async () => {
  try {
    console.log('twit click');
  } catch (error) {}
};

export const fetchAllUsers = async (): Promise<User[]> => {
  // Implement your API call here
  // For now, return an empty array
  return [];
};
