import React from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';

import {FooterNavRouteProp} from '../../../navigation/NavTypes/AuthStackTypes';
import {privacyPolicyTxt, termsServiceTxt} from './componentData';

const InfoFooterAuth = () => {
  const route = useRoute<FooterNavRouteProp>();
  //   console.log(route);

  const content = route.params?.content;

  const renderContent = () => {
    switch (content) {
      case 'privacyPolicy':
        return privacyPolicyTxt;
      case 'termsService':
        return termsServiceTxt;
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
    <ScrollView style={styles.modalContent}>
      <Text style={styles.modalHeader}>{renderHeader()}</Text>
      <Text style={styles.modalText}>{renderContent()}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: '#ecdede',
    padding: 20,
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
  },
});

export default InfoFooterAuth;
