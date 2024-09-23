// userManagement.mjs
// deleteAccount, updateUserProfile, updatePassword, resendConfirmationCode, forgotPassword, confirmForgotPassword, updateProfileImage, updateFeedback, getFeedback, getAllFeedback
// must be zipped with the accountServices.mjs file when uploading to AWS, along with node_modules, and the package.json files  

import { CognitoJwtVerifier } from "aws-jwt-verify";
import * as accountServices from './accountServices.mjs';

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ifrUnY9b1",
  tokenUse: "access",
  clientId: "4c19sf6mo8nbl9sfncrl86d1qv",
});

const publicOperations = [
   'deleteAccount', 'updateUserProfile', 'updatePassword','resendConfirmationCode', 'forgotPassword', 
   'updateProfileImage', 'confirmForgotPassword', 'submitFeedback', 'updateFeedback', 'getFeedback', 'getAllFeedback', 
];


export const handler = async (event) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));
  //console.log('Headers:', JSON.stringify(event.headers, null, 2));
  //console.log('Processing operation:', event.operation);
  //console.log('Request body:', JSON.stringify(event.body));
     try {
       let requestBody;
       if (event.body) {
         requestBody = JSON.parse(event.body);
       } else if (event.operation) {
         requestBody = event;
       } else {
         return createResponse(400, 'No valid request body or operation found');
       }
   
       const { operation } = requestBody;

       if (!publicOperations.includes(operation)) {
         const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1];
   
         if (!token) {
           return createResponse(401, 'No token provided');
         }
   
         try {
           const payload = await verifier.verify(token);
           requestBody.verifiedUser = payload;
         } catch (error) {
           console.error('Token verification failed:', error);
           return createResponse(401, 'Invalid token');
         }
       }

        switch (operation) {

              case 'deleteAccount':
                if (!requestBody.email) {
                    return createResponse(400, 'Email is required for deleting an account.');
                }
                return await accountServices.deleteAccount(requestBody.email);

              case 'updateUserProfile':
                return await accountServices.updateUserProfile(requestBody);
              
              case 'updatePassword':
                return await accountServices.updatePassword(requestBody.username, requestBody.newPassword);
              
              case 'resendConfirmationCode':
                return await accountServices.resendConfirmationCode(requestBody.username);
              
              case 'forgotPassword':
                return await accountServices.forgotPassword(requestBody.username);
              
              case 'updateProfileImage':
                return await accountServices.updateProfileImage(requestBody);
              
              case 'confirmForgotPassword':
                return await accountServices.confirmForgotPassword(requestBody.username, requestBody.confirmationCode, requestBody.newPassword);
              
              case 'updateFeedback':
                return await accountServices.updateFeedback(requestBody);
              
              case 'getFeedback':
                return await accountServices.getFeedback(requestBody);
              
              case 'getAllFeedback':
                return await accountServices.getAllFeedback();
                
            default:
              return createResponse(400, `Unsupported operation: ${operation}`);
            }
        }catch (error) {
        console.error('Unexpected error in Lambda:', error);
        return createResponse(500, 'Internal Server Error', { error: error.message });
    }
};

const createResponse = (statusCode, message, data = null) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({ message, data }),
});