// src/components/CustomToast.tsx

import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../config/toastConfig';

const CustomToast: React.FC = () => {
  return <Toast config={toastConfig} topOffset={60} />;
};

export default CustomToast;