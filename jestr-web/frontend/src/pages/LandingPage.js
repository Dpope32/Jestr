import React, { useState, useRef } from 'react';
import './LandingPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { uploadToS3, getFromS3 } from '../utils/s3Util';


import 'react-toastify/dist/ReactToastify.css';


function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
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
      profilePic: profilePic, // This is expected to be a URL
    };
  
    try {
      // First, upload the profile picture to S3
      if (profilePic !== defaultProfilePic) {
        console.log('Uploading profile picture to S3...');
        await uploadToS3(profilePic, `${email}-profilePic.jpg`);
        console.log('Profile picture uploaded to S3 successfully');
      }
  
      // Then, complete the profile using the existing completeProfile function
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Profile completed response:', data);
        navigate('/feed');
      } else {
        const errorData = await response.json();
        console.error('Complete profile error response:', errorData);
        toast.error(errorData.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Complete profile error caught:', error);
      toast.error('An error occurred while completing your profile. Please try again.');
    }
  };

  
  
  const handleLogin = async (event) => {
    event.preventDefault();

    const userData = {
      operation: 'signin',
      email: email,
      password: password,
    };

    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok && data.signInSuccess) {
        navigate('/feed');
      } else {
        alert(data.message || 'Sign-in failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during sign-in. Please try again.');
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  return (
    <div className="landing-page-container">
      <ToastContainer position="top-center" autoClose={2000} />
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
                      <label className="input-label"> Email:</label>  
                      <motion.input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variants={itemVariants}
                      />
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
                    {!isLogin && ( // This button will be hidden when isLogin is true
                      <motion.button variants={itemVariants} type="submit" className="signup-btn">
                        Sign Up
                      </motion.button>
                    )}
                  </>
                )}
              </AnimatePresence>
              {isSignedUp && (
                <AnimatePresence>
                  {/* Complete profile section */}
                  <motion.div key="username" variants={itemVariants} className="input-container">
                  <div className="profile-pic-btn">
                  <label htmlFor="profilePicInput">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" />
                    ) : (
                    <span
                      className="plus-icon"
                      style={{ cursor: 'pointer' }}
                      onClick={handleProfilePicChange}
                    >
                      +
                    </span>
                    )}
                  </label>
                  <input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                </div>
                    <label className="input-label">Username:</label>
                    <motion.input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      variants={itemVariants}
                    />
                   {username.length > 0 && (
  <span style={{ color: isUsernameAvailable ? 'green' : 'red' }}>
    {isUsernameAvailable ? 'Username available!' : 'Username unavailable!'}
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
      <footer className="landing-page-footer">
  <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Contact Us</a>
</footer>
    </div>
  );
  }
  export default LandingPage;
  