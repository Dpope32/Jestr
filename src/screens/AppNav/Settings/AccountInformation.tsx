import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPencilAlt, faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {useUserStore} from '../../../stores/userStore';
import InputField from '../../../components/Input/InputField';
import Toast from 'react-native-toast-message';

interface AccountInfoItemProps {
  label: string;
  value: string;
  onUpdate: (newValue: string) => void;
}

const AccountInfoItem: React.FC<AccountInfoItemProps> = ({
  label,
  value,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSend = () => {
    onUpdate(editedValue);
    setIsEditing(false);
  };

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
      <View style={{flex: 1}}>
        <Text style={styles.labelText}>{label}</Text>
        {isEditing ? (
          <InputField
            label={''}
            placeholder={`Enter new ${label.toLowerCase()}`}
            value={editedValue}
            onChangeText={setEditedValue}
            style={{borderWidth: 1, borderColor: '#ccc', paddingTop: 15}}
          />
        ) : (
          <Text style={styles.valueText}>{value}</Text>
        )}
      </View>
      <TouchableOpacity onPress={isEditing ? handleSend : handleEdit}>
        <FontAwesomeIcon
          icon={isEditing ? faPaperPlane : faPencilAlt}
          size={18}
          color="#1bd40b"
        />
      </TouchableOpacity>
    </View>
  );
};

interface AccountInformationProps {
  closeModal: () => void;
}

const AccountInformation: React.FC<AccountInformationProps> = ({
  closeModal,
}) => {
  const {username, email, displayName} = useUserStore();

  const handleUsernameUpdate = (newUsername: string) => {
    Toast.show({
      type: 'success',
      text1: 'Successfully updated username',
      position: 'top',
      topOffset: 50,
      visibilityTime: 2000,
    });
    closeModal();
  };

  const handleEmailUpdate = (newEmail: string) => {
    Toast.show({
      type: 'success',
      text1: 'Check new email for confirmation code!',
      position: 'top',
      topOffset: 50,
      visibilityTime: 2000,
    });
    closeModal();
  };

  const handleDisplayNameUpdate = (newDisplayName: string) => {
    Toast.show({
      type: 'success',
      text1: 'Successfully updated display name!',
      position: 'top',
      topOffset: 50,
      visibilityTime: 2000,
    });
    closeModal();
  };

  return (
    <View style={styles.container}>
      <AccountInfoItem
        label="Username"
        value={username}
        onUpdate={handleUsernameUpdate}
      />
      <AccountInfoItem
        label="Email"
        value={email}
        onUpdate={handleEmailUpdate}
      />
      <AccountInfoItem
        label="Display Name"
        value={displayName}
        onUpdate={handleDisplayNameUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  labelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 25,
    lineHeight: 22,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 0,
    marginBottom: 4,
    width: 36,
    height: 36,
  },
  icon: {
    color: '#1bd40b',
    position: 'relative',
    top: 1,
  },
});

export default AccountInformation;
