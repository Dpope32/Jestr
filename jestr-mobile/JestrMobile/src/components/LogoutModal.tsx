import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

type LogoutModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onCancel, onConfirm }) => {
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <Text style={styles.modalTitle}>Log Out</Text>
          <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={onConfirm}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: '#333333', // Dark gray background
    borderRadius: 10,
    borderColor: '#1bd40b', // Bright green border
    borderWidth: 2,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#777777',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default LogoutModal;
