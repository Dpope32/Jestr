import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { useUserStore } from '../../../stores/userStore';
import * as SecureStore from 'expo-secure-store';

const DownloadDataArchive: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null); // State to store download URL
  const { email } = useUserStore();

  const handleRequestDownload = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // Correctly format the body to match expected format by API
      const requestBody = {
        operation: "requestDataArchive",
        email: email
      };

      console.log('Requesting data archive with body:', JSON.stringify(requestBody));

      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/requestDataArchive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error('Response from server:', responseBody);
        throw new Error('Failed to request data archive');
      }

      const data = await response.json();

      if (data?.data?.downloadUrl) {
        setDownloadUrl(data.data.downloadUrl.split('?')[0]); // Set a shortened URL (preview) without query params

        console.log('Download URL:', data.data.downloadUrl);
      } else {
        throw new Error('No download URL received.');
      }
    } catch (error) {
      console.error('Error requesting data archive:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to request data archive. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Download Your Data</Text>
      <Text style={styles.description}>Request a copy of your Jestr data</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#1bd40b" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleRequestDownload}>
            <Text style={styles.buttonText}>Request Download</Text>
          </TouchableOpacity>
          {downloadUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(downloadUrl)}>
              <Text style={styles.downloadLink}>
                {downloadUrl}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1bd40b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadLink: {
    color: '#1E90FF',
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default DownloadDataArchive;
