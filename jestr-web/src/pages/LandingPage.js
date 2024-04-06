import React, { useState } from 'react';
import './LandingPage.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  // Hardcoded accounts for testing
  const accounts = [
    { username: 'DeeDaw22', password: '1' },
    { username: 'Poperevo', password: '2' },
  ];

  const handleSignup = (event) => {
    event.preventDefault();
    const accountExists = accounts.some(
      (account) => account.username === username && account.password === password
    );
    if (accountExists) {
      alert("You already have an account. Would you like to sign in instead?");
      setIsLogin(true); // Switch to the login form
    } else {
      // Proceed with account creation logic
      console.log('Creating new account with', username, password);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const accountExists = accounts.some(
      (account) => account.username === username && account.password === password
    );
    if (accountExists) {
      // Redirect to Feed.js or change the state of the application to be "logged in"
      navigate('/feed');
    } else {
      alert("Incorrect username or password. Please try again or create an account.");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin); // Toggle the boolean state to switch forms
    // Reset form fields
    setUsername('');
    setPassword('');
  };

  const formContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2, // Adjust this for the stagger timing between each form element
        delayChildren: 0.5, // Delay the start of the child animations
      }
    }
  };

  const headerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom) => ({
      y: 0,
      opacity: 1,
      transition: { delay: custom * 0.5 }, // Delay each letter based on its order
    })
  };

  // Individual item transitions
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'linear', // Change to 'linear' for a smoother effect without bounce
        duration: 1 // Increase duration to slow down the animation
      }
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  return (
    <div className="landing-page-container">
      <motion.div
        initial="hidden"
        animate="visible"
        className="landing-page"
      >
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
            variants={formContainerVariants} // Apply container variants here
            initial="hidden"
            animate="visible" // This triggers the child animations
          >
            <motion.form
              onSubmit={isLogin ? handleLogin : handleSignup} // Add your form submit handler
            >
              <motion.div
                variants={itemVariants} // Use this to animate the label and input as one block
                className="input-container" // Add this class for styling
              >
                <label className="input-label">Username:</label> {/* Add className for styling */}
                <motion.input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variants={itemVariants}
                />
              </motion.div>
              <motion.div
                variants={itemVariants} // Use this to animate the label and input as one block
                className="input-container" // Add this class for styling
              >
               <label className="input-label">Password:</label> {/* Add className for styling */}
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variants={itemVariants}
              />
            </motion.div>
            {!isLogin && (
              <motion.button variants={itemVariants} type="submit">
                Sign Up
              </motion.button>
            )}
            {isLogin && (
              <motion.button variants={itemVariants} type="submit">
                Login
              </motion.button>
            )}
           </motion.form>
            <motion.div
              variants={itemVariants}
              onClick={toggleForm}
              className="toggle-form"
            >
              {isLogin ? 'Need an account? Sign up here' : 'Already have an account? Login here'}
            </motion.div>
            <motion.button
              variants={itemVariants}
              className="google-btn"
            >
              Continue with Google
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default LandingPage;