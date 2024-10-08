import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { FooterNavRouteProp } from '../../../navigation/NavTypes/AuthStackTypes';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '../../../constants/uiConstants';

const InfoFooterAuth = () => {
  const navigation = useNavigation();
  const route = useRoute<FooterNavRouteProp>();
  const content = route.params?.content;

  const renderContent = () => {
    switch (content) {
      case 'privacyPolicy':
        return PRIVACY_POLICY;
      case 'termsService':
        return TERMS_OF_SERVICE;
      default:
        return null;
    }
  };

  const renderHeader = () => {
    switch (content) {
      case 'privacyPolicy':
        return 'Privacy Policy';
      case 'termsService':
        return 'Terms of Service';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Content */}
      <ScrollView style={styles.modalContent}>
        <Text style={styles.modalHeader}>{renderHeader()}</Text>
        <Text style={styles.modalText}>{renderContent()}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', 
    paddingTop: 10, 
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 5,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#2C2C2C', 
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF', // Updated for better contrast
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#CCCCCC', // Lighter color for readability
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default InfoFooterAuth;
