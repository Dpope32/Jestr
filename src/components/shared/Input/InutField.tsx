import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';

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
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  onBlur,
  containerStyle,
  labelStyle,
  inputStyle,
  placeholderTextColor = '#999',
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

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={StyleSheet.flatten([styles.input, inputStyle])}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onBlur={onBlur}
          placeholderTextColor={placeholderTextColor}
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
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 16,
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