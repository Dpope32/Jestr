import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, TouchableOpacity, Keyboard } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { COLORS } from '../../../theme/theme'

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  onBlur?: () => void;
  containerStyle?: ViewStyle | ViewStyle[];
  labelStyle?: TextStyle | TextStyle[];
  inputStyle?: TextStyle | TextStyle[];
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  onSubmitEditing?: () => void;
  style?: TextStyle | TextStyle[]; // Added this line
}


const InputField: React.FC<InputFieldProps> = ({
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
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAllCaps, setIsAllCaps] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setIsAllCaps(text === text.toUpperCase() && text !== '');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputContainer}>
      <TextInput
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
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
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
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#1c1c1c',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: 'white'
  },
  eyeIcon: {
    padding: 10,
  },
  capsIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
});

export default InputField;