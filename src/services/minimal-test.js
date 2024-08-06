const { Amplify } = require('aws-amplify');

Amplify.configure({
  Auth: {
    Cognito: {
      region: 'us-east-2',
      userPoolId: 'us-east-2_ifrUnY9b1',
      userPoolClientId: '4c19sf6mo8nbl9sfncrl86d1qv',
    }
  }
});

console.log('Configuration successful');