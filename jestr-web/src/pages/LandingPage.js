import React, { useState, useRef } from 'react';
import './LandingPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
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
  
    // First, log the original data
    console.log("Original data being sent:", profileData);
  
    const userData = JSON.stringify(profileData);
  
    // Then, log the stringified data
    console.log("Stringified userData:", userData);
  
    const requestData = JSON.stringify({ body: userData });
  
    // Finally, log the requestData which is the actual body of the fetch request
    console.log("Request data being sent to the server:", requestData);
  
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/completeProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestData,
      });
  
      // Additional logs can be placed here to log the response
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
    setUsername(e.target.value);
    if (e.target.value.length > 0) {
      // Check if the username is available
      // You'll need to implement this logic on the server-side
      setIsUsernameAvailable(true);
    } else {
      setIsUsernameAvailable(false);
    }
  };

//  const handleProfilePicChange = (e) => {
//    const file = e.target.files && e.target.files[0];
//    if (file) {
//      setProfilePic(URL.createObjectURL(file));
//    }
//  };

const handleProfilePicClick = () => {
  // This sets the default image when the icon is clicked
  setProfilePic(defaultProfilePic);
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
                    <motion.div variants={itemVariants} className="input-container">
                      <label className="input-label">Email:</label>
                      <motion.input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variants={itemVariants}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants} className="input-container">
                      <label className="input-label">Password:</label>
                      <motion.input
                        type="password"
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
                  <motion.div variants={itemVariants} className="input-container">
                  <div className="profile-pic-btn" onClick={handleProfilePicClick}>
  <span className="plus-icon">+</span>
</div>
                    <label className="input-label">Username:</label>
                    <motion.input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      variants={itemVariants}
                    />
                    {isUsernameAvailable ? (
                      <span style={{ color: 'green' }}>Username available!</span>
                    ) : (
                      <span style={{ color: 'red' }}>Username unavailable!</span>
                    )}
                  </motion.div>
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    className="complete-profile-btn"
                    onClick={handleCompleteProfile}
                  >
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
    </div>
  );
  }
  export default LandingPage;
  