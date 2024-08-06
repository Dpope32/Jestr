const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});

const cognito = new AWS.CognitoIdentityServiceProvider();

const params = {
  AuthFlow: 'ADMIN_NO_SRP_AUTH',
  ClientId: '4c19sf6mo8nbl9sfncrl86d1qv',
  UserPoolId: 'us-east-2_ifrUnY9b1',
  AuthParameters: {
    USERNAME: 'pope.dawson@gmail.com',
    PASSWORD: 'UCOboy$9'
  }
};

cognito.adminInitiateAuth(params, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
    if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      // Respond to the NEW_PASSWORD_REQUIRED challenge
      const newPasswordParams = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: '4c19sf6mo8nbl9sfncrl86d1qv',
        UserPoolId: 'us-east-2_ifrUnY9b1',
        ChallengeResponses: {
          USERNAME: 'pope.dawson@gmail.com',
          NEW_PASSWORD: 'UCOboy$9',
          // Include any required attributes here
          'userAttributes.name': 'Your Name',
          'userAttributes.phone_number': '+1234567890'
        },
        Session: data.Session
      };

      cognito.adminRespondToAuthChallenge(newPasswordParams, (err, data) => {
        if (err) console.log(err, err.stack);
        else console.log('Password changed successfully:', data);
      });
    }
  }
});