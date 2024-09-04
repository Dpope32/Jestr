

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

  export const handleFacebookSignIn = () => {
    console.log('Facebook sign-in initiated');
    // TODO: Implement Facebook authentication
  };
  
  export const handleSnapchatSignIn = () => {
    console.log('Snapchat sign-in initiated');
    // TODO: Implement Snapchat authentication
  };
  
  export const handleInstagramSignIn = () => {
    console.log('Instagram sign-in initiated');
    // TODO: Implement Instagram authentication
  };

  