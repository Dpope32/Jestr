import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, Image } from 'react-native';
import { User } from '../../types/types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCamera } from '@fortawesome/free-solid-svg-icons';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isVisible, onClose, user, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.Bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, displayName, Bio: bio, bio, location, website, birthDate };
      onUpdateUser(updatedUser);
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesomeIcon icon={faTimes} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.imageContainer}>
              <Image source={{ uri: user?.headerPic }} style={styles.modalHeaderImage} />
              <View style={styles.profileImageContainer}>
                <Image source={{ uri: user?.profilePic }} style={styles.modalProfileImage} />
                <TouchableOpacity style={styles.cameraIconContainer}>
                  <FontAwesomeIcon icon={faCamera} size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.centeredText]}
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your location"
              value={location}
              onChangeText={setLocation}
            />
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your website"
              value={website}
              onChangeText={setWebsite}
            />
            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              style={styles.input}
              placeholder="Add your birth date"
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    color: '#FFF',
  },
  input: {
    backgroundColor: '#444',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#FFF',
  },
  centeredText: {
    textAlign: 'center',
  },
  saveButton: {
    width: '25%',
    alignSelf: 'flex-end',
    backgroundColor: '#1bd40b',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  label: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderImage: {
    width: '100%',
    height: 100,
    marginBottom: -50,
  },
  profileImageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 3,
  },
});

export default EditProfileModal;
