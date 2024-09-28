// src/components/Input/InputField.tsx
import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Keyboard,
  TextInputProps,
  StyleProp,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../../theme/theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle> | StyleProp<ViewStyle>[];
  labelStyle?: StyleProp<TextStyle> | StyleProp<TextStyle>[];
  inputStyle?: StyleProp<TextStyle> | StyleProp<TextStyle>[];
}

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
  ...rest
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAllCaps, setIsAllCaps] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  const handleTextChange = (text: string) => {
    onChangeText!(text);
    setIsAllCaps(text === text.toUpperCase() && text !== '');
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
          autoCapitalize="none"
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}>
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
    </View>
  );
});

InputField.displayName = 'InputField'; // For better debugging with forwardRef

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8, // Reduced from 14 for tighter vertical spacing
    color: '#fff', // Changed to white for better visibility against dark backgrounds
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff', // Changed to white for better readability
    paddingVertical: 10, // Increased padding for better touch area
  },
  eyeIcon: {
    padding: 10,
  },
  capsIcon: {
    position: 'absolute',
    right: 10,
    top: 12, // Adjusted to align better vertically
  },
});

export default InputField;
