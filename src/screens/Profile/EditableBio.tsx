import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Toast from 'react-native-toast-message';

interface EditableBioProps {
  initialBio: string;
  userEmail: string;
  onBioUpdate: (newBio: string) => void;
  editable: boolean; // Add the editable prop
}

const EditableBio: React.FC<EditableBioProps> = ({ initialBio, userEmail, onBioUpdate, editable }) => {
  const [bio, setBio] = useState(initialBio);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setBio(initialBio);
  }, [initialBio]);

  const updateBio = async () => {
    const requestBody = {
      operation: 'updateBio',
      email: userEmail,
      bio: bio,
    };

    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateBio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.data && responseData.data.data && responseData.data.data.updatedBio) {
          onBioUpdate(responseData.data.data.updatedBio);
          setIsEditing(false);

          // Show toast notification
          Toast.show({
            type: 'success',
            text1: 'Bio updated successfully!',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            props: { backgroundColor: '#333', textColor: '#00ff00' },
          });
        } else {
          console.error('Unexpected response structure:', responseData);
        }
      } else {
        console.error('Failed to update bio. Server response:', responseData);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isEditing ? (
        <Modal visible={isEditing} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                value={bio}
                onChangeText={setBio}
                style={styles.input}
                multiline
                maxLength={150}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.button}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={updateBio} style={[styles.button, styles.saveButton]}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>
            {bio || initialBio || 'No bio available'}
          </Text>
          {editable && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editIcon}>
              <FontAwesomeIcon icon={faEdit} size={20} color="#1bd40b" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  bioText: {
    flex: 1,
    color: '#FFFFFF',  // Change to white for visibility
    fontSize: 16,
  },
  editIcon: {
    marginLeft: 10,
    padding: 5,  // Add some padding for easier tapping
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
        alignItems: 'center',
    width: '80%',
  },
  input: {
    backgroundColor: '#444',
    color: '#FFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#555',
  },
  saveButton: {
    backgroundColor: '#1bd40b',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default EditableBio;
