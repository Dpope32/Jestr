// authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoRefreshToken } from 'amazon-cognito-identity-js';
const COGNITO_ENDPOINT = 'https://cognito-idp.us-east-2.amazonaws.com/';
const CLIENT_ID = '4c19sf6mo8nbl9sfncrl86d1qv';

export const refreshToken = async () => {
  try {
   // console.log('Attempting to refresh token');
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.error('No refresh token available');
      throw new Error('No refresh token available');
    }

    const refreshToken = new CognitoRefreshToken({ RefreshToken: storedRefreshToken });

    const response = await fetch(COGNITO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
      },
      body: JSON.stringify({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken.getToken()
        }
      })
    });

    //console.log('Refresh token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh token. Response:', errorText);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
   // console.log('Refresh token successful. New token received.');

    const newAccessToken = data.AuthenticationResult.AccessToken;
    await AsyncStorage.setItem('accessToken', newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};