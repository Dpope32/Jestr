import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import InputField from '../../../components/Input/InputField';

// import {useUserStore} from '../../../stores/userStore';

const ContactUs = () => {
  // const setIsFirstLaunch = useUserStore(state => state.setIsFirstLaunch);

  const submitHandler = () => {
    console.log('Submitting contact form');
    // setIsFirstLaunch(true);
  };

  return (
    <View style={styles.modalContent}>
      <Text style={[styles.modalHeader]}>Contact Us</Text>
      <Text style={[styles.modalText]}>Please fill out the form below:</Text>

      <InputField
        label="Your Email"
        placeholder="Enter your email"
        placeholderTextColor="#FFF"
        value=""
        onChangeText={() => {}}
        labelStyle={styles.label}
        inputStyle={{color: '#FFF'}}
      />

      <InputField
        label="Your Message"
        placeholder="Enter your message"
        placeholderTextColor="#FFF"
        value=""
        onChangeText={() => {}}
        multiline
        numberOfLines={6}
        labelStyle={styles.label}
        inputStyle={{color: '#FFF'}}
      />

      {/* TODO: implement feature */}
      <TouchableOpacity style={styles.submitButton} onPress={submitHandler}>
        <Text style={styles.submitButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#ecdede',
    padding: 20,
    justifyContent: 'center',
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#846f6f',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#5b3e3e',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#5b3e3e',
    fontWeight: '600',
  },
  input: {
    color: '#FFF',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 25,
    backgroundColor: '#00cc44',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ContactUs;
