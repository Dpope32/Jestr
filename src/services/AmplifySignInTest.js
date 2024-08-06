const crypto = require('crypto');
global.crypto = {
  getRandomValues: function(buffer) {
    return crypto.randomFillSync(buffer);
  }
};

const { Amplify } = require('aws-amplify');
const { signIn } = require('@aws-amplify/auth');

Amplify.configure({
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_ifrUnY9b1',
      userPoolClientId: '4c19sf6mo8nbl9sfncrl86d1qv',
    }
  }
});

async function signInUser(username, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username,
      password,
      options: {
        authFlowType: 'USER_PASSWORD_AUTH'  // Changed to USER_PASSWORD_AUTH
      }
    });
    console.log('Sign in result:', { isSignedIn, nextStep });
  } catch (error) {
    console.log('Error signing in:', error);
    if (error.log) console.log(error.log);
  }
}

signInUser('pope.dawson@gmail.com', 'UCOboy$9');