// src/config/toastConfig.tsx
import React from 'react';
import Toast, {
    BaseToast,
    BaseToastProps,
    ErrorToast,
  } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderWidth: 1,
        borderColor: 'green',
        backgroundColor: '#2E2E2E',
        borderRadius: 5,
        marginTop: 80,
      }}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
        color: '#FFFFFF',
      }}
      text2Style={{
        fontSize: 12,
        color: '#CCCCCC',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderWidth: 1,
        borderColor: 'red',
        backgroundColor: '#2E2E2E',
        borderRadius: 5,
        marginTop: 40,
      }}
      text1Style={{
        fontSize: 15,
        color: '#FFFFFF',
      }}
      text2Style={{
        fontSize: 12,
        color: '#CCCCCC',
      }}
    />
  ),
};