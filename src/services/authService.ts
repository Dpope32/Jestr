import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {resetPassword} from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types/types';
import {logStorageContents} from '../utils/debugUtils';
import {
  signUp,
  signOut,
  confirmSignIn,
  getCurrentUser,
  fetchAuthSession,
  signIn,
} from '@aws-amplify/auth';
import {RootStackParamList} from '../types/types';
import {useUserStore} from '../stores/userStore';
import {removeToken, storeUserIdentifier} from '../stores/secureStore';
import * as SecureStore from 'expo-secure-store';
import {fetchUserDetails} from './userService';
//import * as Google from 'expo-auth-session/providers/google';
import {
  AuthNavProp,
  ChangePasswordNavRouteProp,
} from '../navigation/NavTypes/AuthStackTypes';

export const checkAuthStatus = async () => {
  try {
    const {tokens} = await fetchAuthSession();
    return tokens !== undefined;
  } catch (error) {
    return false;
  }
};

// export const handleLogin = async (
//   username: string,
//   password: string,
//   setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
//   navigation: StackNavigationProp<RootStackParamList>,
// ) => {
//   setIsLoading(true);
//   try {
//     // Clear existing auth data
//     await signOut({global: true});
//     await SecureStore.deleteItemAsync('accessToken');
//     await AsyncStorage.removeItem('userIdentifier');
//     await AsyncStorage.removeItem('isAdmin');
//     useUserStore.getState().resetUserState(); // Use the resetUserState function

//     const lowercaseUsername = username.toLowerCase();
//     const {isSignedIn, nextStep} = await signIn({
//       username: lowercaseUsername,
//       password,
//       options: {
//         authFlowType: 'USER_PASSWORD_AUTH',
//       },
//     });

//     if (isSignedIn) {
//       const {tokens} = await fetchAuthSession();
//       const accessToken = tokens?.accessToken?.toString();
//       if (accessToken) {
//         await SecureStore.setItemAsync('accessToken', accessToken);
//       }
//       const userDetails = await fetchUserDetails(username, accessToken || '');

//       const isAdmin = [
//         'pope.dawson@gmail.com',
//         'bogdan.georgian370@gmail.com',
//         'kamariewallace1999@gmail.com',
//         'jestrdev@gmail.com',
//         'bogdan.georgian001@gmail.com',
//         'popebardy@gmail.com',
//         'tpope918@aol.com',
//       ].includes(userDetails.email);

//       // Store isAdmin in AsyncStorage
//       await AsyncStorage.setItem('isAdmin', JSON.stringify(isAdmin));

//       // Update Zustand store
//       useUserStore.getState().setUserDetails({
//         email: userDetails.email,
//         username: userDetails.username,
//         displayName: userDetails.displayName,
//         profilePic: userDetails.profilePic,
//         headerPic: userDetails.headerPic,
//         bio: userDetails.bio,
//         creationDate: userDetails.CreationDate,
//         followersCount: userDetails.FollowersCount,
//         followingCount: userDetails.FollowingCount,
//         isAdmin: isAdmin,
//       });

//       // Store user identifier
//       await storeUserIdentifier(userDetails.email);
//       await logStorageContents();
//       navigation.navigate('Feed', {
//         userEmail: userDetails.email, // Pass only the necessary identifier
//       });
//     } else if (
//       nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
//     ) {
//       navigation.navigate('ChangePassword', {
//         username,
//         nextStep: nextStep,
//       });
//     } else {
//       Alert.alert('Login Failed', 'Unexpected authentication step');
//     }
//   } catch (error: any) {
//     console.error('Login error:', error);
//     Alert.alert('Login Failed', error.message || 'An unknown error occurred');
//   } finally {
//     setIsLoading(false);
//   }
// };

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

export const handleSignOut = async () => {
  try {
    await signOut({global: true});
    await removeToken('accessToken');
    // await AsyncStorage.removeItem('user');
    // await AsyncStorage.removeItem('accessToken');
    await SecureStore.deleteItemAsync('accessToken');
    await AsyncStorage.clear();
    useUserStore.getState().resetUserState();
    console.log('Sign out successful');
  } catch (error) {
    console.error('Error signing out:', error);
    // throw error;
  }
};

// export const handleSignup = async (
//   email: string,
//   password: string,
//   setIsSignedUp: React.Dispatch<React.SetStateAction<boolean>>,
//   setSignupSuccessModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
//   navigation: StackNavigationProp<RootStackParamList>,
//   navigateToConfirmSignUp: (email: string) => void,
//   setCurrentScreen: React.Dispatch<React.SetStateAction<string>>,
// ) => {
//   const defaultName = 'jestruser';

//   try {
//     const userAttributes = {
//       email,
//       phone_number: '+1234567890', // Default phone number
//       name: defaultName, // Default name
//     };

//     // console.log('User attributes being sent:', userAttributes);
//     useUserStore.getState().setTempPassword(password);

//     const {isSignUpComplete, userId, nextStep} = await signUp({
//       username: email,
//       password,
//       options: {
//         userAttributes,
//       },
//     });

//     if (isSignUpComplete) {
//       setIsSignedUp(true);
//       setSignupSuccessModalVisible(true);

//       // Automatically sign in the user after successful signup
//       const {isSignedIn} = await signIn({
//         username: email, // Use email here instead of username
//         password,
//         options: {
//           authFlowType: 'USER_PASSWORD_AUTH',
//         },
//       });
//       if (isSignedIn) {
//         const authUser = await getCurrentUser();
//         const user = convertAuthUserToUser(authUser);
//         useUserStore.getState().setUserDetails(user);
//         navigation.navigate('CompleteProfileScreen', {email});
//       } else {
//         Alert.alert(
//           'Login Incomplete',
//           'Please complete the additional step to sign in',
//         );
//       }
//     } else {
//       //   console.log('Additional signup step required:', nextStep);

//       if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
//         navigateToConfirmSignUp(email);
//       } else {
//         Alert.alert(
//           'Signup Incomplete',
//           'Please check your email for verification instructions',
//         );
//       }
//     }
//   } catch (error: any) {
//     console.error('Signup error:', error);
//     if (error.name === 'UsernameExistsException') {
//       Alert.alert(
//         'Account Already Exists',
//         "Looks like you already have an account. Try to sign in or click 'Forgot Password'.",
//         [
//           {text: 'OK', onPress: () => {}},
//           {text: 'Sign In', onPress: () => setCurrentScreen('login')}, // Assuming you have a function to switch forms
//           {text: 'Forgot Password', onPress: () => handleForgotPassword(email)},
//         ],
//       );
//     } else {
//       Alert.alert(
//         'Signup Failed',
//         error.message || 'An unknown error occurred',
//       );
//     }
//   }
// };

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
      Alert.alert(
        'Account Already Exists',
        "Looks like you already have an account. Try to sign in or click 'Forgot Password'.",
        [
          {text: 'OK', onPress: () => {}},
          {text: 'Sign In', onPress: () => navigation.navigate('Login')},
          {
            text: 'Forgot Password',
            onPress: () => {
              handleForgotPassword(email);
              // TODO: should navigate to a screen to change password
              // get a link in mail which will open the app
              // on a screen to change password
              // navigation.navigate('ChangePassword');
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

export const handleChangePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string,
) => {
  try {
    const {isSignedIn, nextStep} = await signIn({
      username,
      password: oldPassword,
    });
    if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      const result = await confirmSignIn({challengeResponse: newPassword});
      if (result.isSignedIn) {
        const authUser = await getCurrentUser();
        const user = convertAuthUserToUser(authUser);
        useUserStore.getState().setUserDetails(user);
        // navigation.navigate('Feed', {userEmail: user.email});
      } else {
        throw new Error('Failed to change password');
      }
    } else {
      throw new Error('Unexpected authentication step');
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    Alert.alert(
      'Password Change Failed',
      error.message || 'An unknown error occurred',
    );
  }
};

export const handleForgotPassword = async (email: string) => {
  try {
    if (!email) {
      Alert.alert(
        'Error',
        'Please enter your email address on the login screen',
      );
      return;
    }
    await resetPassword({username: email});
    Alert.alert('Success', 'Check your email for password reset instructions');
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    Alert.alert('Error', (error as Error).message || 'An error occurred');
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
