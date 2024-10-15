// src/config/toastConfig.tsx

import React from 'react';
import { BaseToast, BaseToastProps, ErrorToast, ToastConfigParams } from 'react-native-toast-message';
import { StyleSheet, Dimensions } from 'react-native';
import BadgeToast from './BadgeToast';
import { Badge } from '../stores/badgeStore';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

export const TOAST_TOP_POSITION = height * 0.1;

interface CustomToastProps {
  badge: Badge;
}

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={[
        styles.toastContainer,
        styles.successToast,
      ]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={[
        styles.toastContainer,
        styles.errorToast,
      ]}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),

  custom: ({ props }: ToastConfigParams<CustomToastProps>) => (
    <BadgeToast 
      badge={props.badge} 
      onDismiss={() => Toast.hide()}
    />
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    borderRadius: 5,
    width: '80%', 
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  successToast: {
    backgroundColor: '#1C1C1C', 
    borderColor: '#00FF00', 
    borderWidth: 3,
    marginTop: TOAST_TOP_POSITION, 
  },
  errorToast: {
    backgroundColor: '#2E2E2E', 
    borderColor: '#00FF00', 
    borderWidth: 3,
    marginTop: TOAST_TOP_POSITION, 
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF', 
  },
  text2: {
    fontSize: 14,
    color: '#CCCCCC', 
  },
});
