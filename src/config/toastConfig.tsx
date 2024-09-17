// src/config/toastConfig.tsx

import React from 'react';
import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
} from 'react-native-toast-message';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'green',
        backgroundColor: '#1C1C1C',
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
        borderLeftColor: 'red',
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