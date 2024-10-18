// src/components/Input/InputField.tsx

import React, { useState, forwardRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Dimensions,
  TextInputProps,
  StyleProp,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { COLORS, SPACING } from '../../theme/theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle> | StyleProp<ViewStyle>[];
  labelStyle?: StyleProp<TextStyle> | StyleProp<TextStyle>[];
  inputStyle?: StyleProp<TextStyle> | StyleProp<TextStyle>[];
  isEmail?: boolean; // New prop to specify if the input is an email
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const InputField = forwardRef<TextInput, InputFieldProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline,
  numberOfLines,
  textAlignVertical,
  onBlur,
  containerStyle,
  labelStyle,
  inputStyle,
  placeholderTextColor = '#999',
  maxLength,
  onSubmitEditing,
  isEmail = false, // Default to false
  ...rest
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAllCaps, setIsAllCaps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

const handleTextChange = (text: string) => {
  // let sanitizedText = text.trim(); 
  let sanitizedText = text; // Use raw text
  // sanitizedText = sanitizedText.replace(/<script.*?>.*?<\/script>/gi, '');

  if (isEmail) {
    if (validateEmail(sanitizedText)) {
      setError(null);
    } else {
      setError('Please enter a valid email address');
    }
  }

  onChangeText!(sanitizedText);
  setIsAllCaps(sanitizedText === sanitizedText.toUpperCase() && sanitizedText !== '');
};


  // Email validation function using regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          textAlignVertical={textAlignVertical}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onBlur={onBlur}
          placeholderTextColor={placeholderTextColor}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={isEmail ? 'none' : 'sentences'}
          autoCorrect={false}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            accessibilityHint="Toggles password visibility"
          >
            <FontAwesomeIcon
              icon={isPasswordVisible ? faEye : faEyeSlash}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
        {isAllCaps && (
          <View style={styles.capsIcon}>
            <FontAwesomeIcon icon={faLock} size={16} color="#999" />
          </View>
        )}
      </View>
      {/* Display error message if any */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

InputField.displayName = 'InputField'; // For better debugging with forwardRef

const styles = StyleSheet.create({
  container: {
    marginVertical: SCREEN_HEIGHT * 0.01,
  },
  label: {
    fontSize: 16,
    marginBottom: 8, 
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    color: '#fff', 
  },
  eyeIcon: {
    padding: 10,
  },
  capsIcon: {
    position: 'absolute',
    right: 10,
    top: 12, 
  },
  errorText: {
    color: COLORS.error || '#FF3B30', 
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;
