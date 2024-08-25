import React from 'react';
import {View, Text} from 'react-native';
import {FallbackProps} from 'react-error-boundary';

export const LoadingText = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <Text>Loading...</Text>
    </View>
  );
};

const ErrorFallback = ({error}: FallbackProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
        Something went wrong:
      </Text>
      <Text style={{color: 'red'}}>{error.message}</Text>
    </View>
  );
};

export default ErrorFallback;
