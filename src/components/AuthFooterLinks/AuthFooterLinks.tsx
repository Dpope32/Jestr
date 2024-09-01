import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/core';

import {AuthNavProp} from '../../navigation/NavTypes/AuthStackTypes';

const AuthFooterLinks = () => {
  const navigation = useNavigation<AuthNavProp>();
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('InfoFooterAuth', {
            content: 'privacyPolicy',
          })
        }>
        <Text style={styles.footerLink}>Privacy Policy</Text>
      </TouchableOpacity>
      <Text style={styles.footerDivider}> | </Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('InfoFooterAuth', {
            content: 'termsService',
          })
        }>
        <Text style={styles.footerLink}>Terms of Service</Text>
      </TouchableOpacity>
      <Text style={styles.footerDivider}> | </Text>
      <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
        <Text style={styles.footerLink}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    paddingBottom: 20,
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  footerDivider: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 5,
  },
});

export default AuthFooterLinks;
