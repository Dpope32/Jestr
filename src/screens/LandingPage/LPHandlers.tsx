import { NavigationProp } from '@react-navigation/native';
import { handleForgotPassword, handleCompleteProfile } from '../../services/authFunctions';
import { RootStackParamList, LandingPageNavigationProp } from '../../types/types'; // Make sure this import points to the correct location
import { Alert } from 'react-native';

export const handleSignUpClick = (
    setShowInitialScreen: React.Dispatch<React.SetStateAction<boolean>>, 
    setShowSignUpForm: React.Dispatch<React.SetStateAction<boolean>>
) => {
    setShowInitialScreen(false);
    setShowSignUpForm(true);
};

export const handleLoginClick = (
    setShowInitialScreen: React.Dispatch<React.SetStateAction<boolean>>, 
    setShowSignUpForm: React.Dispatch<React.SetStateAction<boolean>>
) => {
    setShowInitialScreen(false);
    setShowSignUpForm(false);
};

export const handleHeaderPicChange = (file: string | null, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    setter(file);
  };
  
  export const handleProfilePicChange = (file: string | null, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    setter(file);
  };
