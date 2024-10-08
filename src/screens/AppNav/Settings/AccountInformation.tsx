import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPencilAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../../../stores/userStore';
import InputField from '../../../components/Input/InputField';
import Toast from 'react-native-toast-message';
import { updateUserProfile } from '../../../services/userService';

interface AccountInfoItemProps {
  label: string;
  value: string;
  onUpdate: (newValue: string) => void;
  isEmail?: boolean;
  closeModal: () => void;
}

const AccountInfoItem: React.FC<AccountInfoItemProps> = ({
  label,
  value,
  onUpdate,
  isEmail = false,
  closeModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSend = () => {
    onUpdate(editedValue);
    setIsEditing(false);
    closeModal();
  };

  return (
    <View style={styles.infoItemContainer}>
      <View style={styles.labelValueContainer}>
        <Text style={styles.labelText}>{label}</Text>
        {isEditing ? (
          <InputField
          label=""
          placeholder={`Enter new ${label.toLowerCase()}`}
          value={editedValue}
          onChangeText={setEditedValue}
          style={styles.inputField}
          onSubmitEditing={handleSend}
          isEmail={isEmail} 
        />
        ) : (
          <Text style={styles.valueText}>{value}</Text>
        )}
      </View>
      {isEmail ? (
        <TouchableOpacity onPress={isEditing ? handleSend : handleEdit} style={styles.updateButton}>
          <Text style={styles.updateButtonText}>
            {isEditing ? 'Save' : 'Update Email'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={isEditing ? handleSend : handleEdit} style={styles.iconButton}>
          <FontAwesomeIcon
            icon={isEditing ? faPaperPlane : faPencilAlt}
            size={18}
            color="#1bd40b"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface AccountInformationProps {
  closeModal: () => void;
}

const AccountInformation: React.FC<AccountInformationProps> = ({
  closeModal,
}) => {
  const { username, email, displayName, setUserDetails } = useUserStore();

  const handleUpdate = async (field: string, value: string) => {
    try {
      const email = useUserStore.getState().email;  // Get the current user's email
      if (!email) {
        throw new Error('User email not found');
      }
      
      await updateUserProfile({ email, [field]: value });
      setUserDetails({ [field]: value });
      Toast.show({
        type: 'success',
        text1: `Successfully updated ${field}`,
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: `Failed to update ${field}`,
        text2: 'Please try again later',
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <AccountInfoItem
        label="Username"
        value={username}
        onUpdate={(value) => handleUpdate('username', value)}
        closeModal={closeModal}
      />
      <View style={styles.separator} />
      <AccountInfoItem
        label="Email"
        value={email}
        onUpdate={(value) => handleUpdate('email', value)}
        isEmail={true}
        closeModal={closeModal}
      />
      <View style={styles.separator} />
      <AccountInfoItem
        label="Display Name"
        value={displayName}
        onUpdate={(value) => handleUpdate('displayName', value)}
        closeModal={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  infoItemContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  labelValueContainer: {
    marginBottom: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  valueText: {
    fontSize: 16,
    color: '#BBBBBB',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
  },
  updateButton: {
    borderWidth: 1,
    borderColor: '#1bd40b',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#1bd40b',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
});

export default AccountInformation;