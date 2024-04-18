import React, { useState, useRef } from 'react';
import './LandingPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { uploadToS3, getFromS3 } from '../utils/s3Util';
import LoadingScreen from '../components/LoadingScreen';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import ProfilePicUpload from './ProfilePicUpload';


function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isdisplayNameAvailable, setIsdisplayNameAvailable] = useState(false);
  const defaultProfilePic = "https://via.placeholder.com/150"; 
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();

    const userData = {
      operation: 'signup',
      email: email,
      password: password,
    };

    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Account created:', data);
        setIsSignedUp(true)
        toast.success('Account Created Successfully!', {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred while signing up. Please try again.');
    }
  };

  const handleCompleteProfile = async () => {
    const profileData = {
      operation: 'completeProfile',
      email: email,
      username: username,
      displayName: displayName
    };
    console.log('Preparing to complete profile with:', profileData);
    try {
      let profilePicBase64 = null;
      if (profilePic) {
        console.log('Profile picture file selected:', profilePic);
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
          profilePicBase64 = fileReader.result.split(',')[1];
          profileData.profilePic = profilePicBase64;
          console.log('Sending complete profile request with data:', profileData);
  
          const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
          });
  
          if (response.ok) {
            const data = await response.json();
            console.log('Profile completed successfully with response:', data);
            if (data && data.user) {
              const user = {
                email: data.user.email,
                username: data.user.username,
                profilePic: data.user.profilePic,
                displayName: data.user.displayName
              };
              console.log('Navigating to feed with user data:', user);
              toast.success('Profile completed successfully!', {
                position: "top-center",
                autoClose: 1000,
                onClose: () => {
                  navigate('/feed', { state: { user } });
                },
              });
            } else {
              console.error('Invalid user data:', data);
              toast.error('Incomplete user data received.');
            }
          } else {
            const errorData = await response.json();
            console.error('Complete profile error response:', errorData);
            toast.error(errorData.message || 'Failed to complete profile');
          }
        };
        fileReader.readAsDataURL(profilePic);
      } else {
        console.log('No profile picture to upload.');
      }
    } catch (error) {
      console.error('Complete profile error caught:', error);
      toast.error('An error occurred while completing your profile. Please try again.');
    }
  };


  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const userData = {
      operation: 'signin',
      email: email,
      password: password,
    };

    try {
      console.log('Sending login request...');
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok && data.message === 'Sign-in successful.' && data.user && data.user.email) {
        console.log('Sign-in successful');
        toast.success('Sign-in successful!', {
          position: "top-center",
          autoClose: 1000,
          onClose: () => {
            console.log('Toast closed, navigating to /feed');
            const user = {
              email: data.user.email,
              username: data.user.username,
              profilePic: data.user.profilePic,
              displayName: data.user.displayName // Make sure this line is added
            };
            console.log('Logged-in user data:', data.user);
            navigate('/feed', { state: { user } });
            setIsLoading(false);
          },
        });
      } else {
        console.log('Sign-in failed');
        setIsLoading(false);
        toast.error(data.message || 'Sign-in failed.', {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      toast.error('An error occurred during sign-in. Please try again.', {
        position: "top-center",
        autoClose: 2000,      });
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setUsername('');
    setProfilePic('');
  };

  const formContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const headerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom) => ({
      y: 0,
      opacity: 1,
      transition: { delay: custom * 0.5 },
    }),
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'linear',
        duration: 1,
      },
    },
  };

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  const handleUsernameChange = async (e) => {
    const usernameInput = e.target.value;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (usernameRegex.test(usernameInput)) {
      setUsername(usernameInput);
      setIsUsernameAvailable(true);
    } else {
      setIsUsernameAvailable(false);
    }
  };

  const handledisplayNameChange= async (e) => {
    const displayNameInput = e.target.value;
    const displayNameRegex = /^[a-zA-Z0-9]+$/;
    if (displayNameRegex.test(displayNameInput)) {
      setDisplayName(displayNameInput);
      setIsdisplayNameAvailable(true);
    } else {
      setIsdisplayNameAvailable(false);
    }
  };

  const handleProfilePicChange = (file) => {
    setProfilePic(file);
  };

  return (
    <div className="landing-page-container">
 <ToastContainer />
    {isLoading && <LoadingScreen />}
    <motion.div initial="hidden" animate="visible" className="landing-page">
        <div className="title">
          {['J', 'e', 's', 't', 'r'].map((letter, index) => (
            <motion.span
              key={letter}
              custom={index}
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              onAnimationComplete={index === 4 ? handleAnimationComplete : undefined}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        {animationComplete && (
          <motion.div
            className="form-container"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.form onSubmit={isLogin ? handleLogin : handleSignup}>
              <AnimatePresence>
                {(!isSignedUp || isLogin) && (
                  <>
                    <motion.div key="email" variants={itemVariants} className="input-container">
                      <label className="input-label">Email:</label>
                      <motion.input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value.length >= 6) {
                            // Check email availability
                            fetch(`https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/checkEmail?email=${e.target.value}`)
                              .then((response) => response.json())
                              .then((data) => setIsEmailTaken(data.emailExists))
                              .catch((error) => console.error('Error checking email:', error));
                          } else {
                            setIsEmailTaken(false);
                          }
                        }}
                        variants={itemVariants}
                      />
                      {isEmailTaken && <span className="error-message">Email already taken!</span>}
                    </motion.div>
                    <motion.div key="password" variants={itemVariants} className="input-container">
                      <label className="input-label">Password:</label>
                      <motion.input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variants={itemVariants}
                      />
                    </motion.div>
                    {!isLogin && (
                      <motion.button variants={itemVariants} type="submit" className="signup-btn">
                        Sign Up
                      </motion.button>
                    )}
                    {isLogin && (
                      <motion.button variants={itemVariants} type="submit" className="login-btn">
                        Login
                      </motion.button>
                    )}
                  </>
                )}
              </AnimatePresence>
              {isSignedUp && (
                <AnimatePresence>
                  {/* Complete profile section */}
                  <motion.div key="username" variants={itemVariants} className="input-container">
                  <ProfilePicUpload onProfilePicChange={handleProfilePicChange} />

                    <label className="input-label">Username:</label>
                    <motion.input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      variants={itemVariants}
                    />
                    {username.length > 0 && (
                      <span className={`availability-message ${isUsernameAvailable ? 'available' : 'unavailable'}`}>
                        {isUsernameAvailable ? 'Username available!' : 'Username unavailable!'}
                      </span>
                    )}

                  <label className="-dn-input-label">Display Name:</label>
                    <motion.input
                      type="text"
                      value={displayName}
                      onChange={handledisplayNameChange}
                      variants={itemVariants}
                    />
                    {displayName.length > 0 && (
                      <span className={`availability-message ${isdisplayNameAvailable ? 'available' : 'unavailable'}`}>
                        {isdisplayNameAvailable ? 'Display Name available!' : 'Display name unavailable!'}
                      </span>
                    )}


                  </motion.div>
                  
                  <motion.button key="completeProfile" variants={itemVariants} type="button" className="complete-profile-btn" onClick={handleCompleteProfile}>
                    Complete Profile
                  </motion.button>
                </AnimatePresence>
              )}
            </motion.form>
            {!isSignedUp && (
              <motion.div
                variants={itemVariants}
                onClick={toggleForm}
                className="toggle-form"
              >
                {isLogin ? 'Need an account? Sign up here' : 'Already have an account? Login here'}
              </motion.div>
            )}
            {!isSignedUp && !isLogin && (
              <motion.button variants={itemVariants} className="google-btn">
                Continue with Google
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
      {isLoading && <LoadingScreen />}
      <footer className="landing-page-footer">
        <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Contact Us</a>
      </footer>
    </div>
  );
}

export default LandingPage;