import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {BlurView} from 'expo-blur';
import {LinearGradient} from 'expo-linear-gradient';

import {styles} from './componentData';
import {colorsGradient} from '../LandingPage/componentData';
import {AuthNavProp} from '../../../navigation/NavTypes/AuthStackTypes';
import InputField from '../../../components/Input/InputField';
import AuthFooterLinks from '../../../components/AuthFooterLinks/AuthFooterLinks';
import RainEffect from '../../../components/RainEffect/RainEffect';
import SocialLoginBtns from '../../../components/SocialLoginBtns/SocialLoginBtns';
import { handleLogin } from '../../../services/authService';
import ForgotPasswordModal from '../../../components/Modals/ForgotPasswordModal';

const LoginScreen = () => {
  const navigation = useNavigation<AuthNavProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);

  // Refs for input fields
  const passwordInputRef = useRef<TextInput>(null);

  const handleLoginAction = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await handleLogin(email, password, navigation);
    } catch (error: any) {
      console.log('Error logging in:', error.message);
      Alert.alert(
        'Login Error',
        error.message || 'An unexpected error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={colorsGradient} style={styles.container}>
        <RainEffect />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled">
            <View style={styles.contentContainer}>
              <Text style={styles.signupHeader}>Login</Text>

              <InputField
                placeholder="Enter Email"
                value={email}
                onChangeText={text => setEmail(text)}
                containerStyle={styles.input}
                inputStyle={styles.inputText}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                accessibilityLabel="Email Input"
                isEmail={true}
              />

              <InputField
                ref={passwordInputRef}
                placeholder="Enter Password"
                secureTextEntry
                value={password}
                onChangeText={text => setPassword(text)}
                containerStyle={styles.input}
                inputStyle={styles.inputText}
                returnKeyType="done"
                onSubmitEditing={handleLoginAction}
                accessibilityLabel="Password Input"
              />

              <TouchableOpacity
                onPress={handleLoginAction}
                style={styles.button2}
                disabled={isLoading}
                accessibilityLabel="Login Button"
                accessibilityRole="button">
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                accessibilityLabel="Navigate to Sign Up"
                accessibilityRole="button"
              >
                <Text style={styles.toggleFormText}>Don't have an account?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setForgotPasswordModalVisible(true)}
                accessibilityLabel="Forgot Password"
                accessibilityRole="button">
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <SocialLoginBtns />
            </View>
          </ScrollView>

          {/* Footer fixed at the bottom */}
          <AuthFooterLinks />
        </KeyboardAvoidingView>

        {/* Move RainEffect here to ensure it's rendered above other components */}

        <ForgotPasswordModal
          isVisible={isForgotPasswordModalVisible}
          onClose={() => setForgotPasswordModalVisible(false)}
        />

        {isLoading && (
          <BlurView
            intensity={100}
            style={styles.blurView}
            accessibilityLabel="Loading Indicator"
            accessible={true}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff00" />
              <Text style={styles.loadingText}>Logging in...</Text>
            </View>
          </BlurView>
        )}
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
