import React from 'react';
import './LoadingScreen.css'; // Make sure this path is correct
import logo from '../assets/images/JestrLogo.jpg'; // Adjust the path as necessary

function LoadingScreen({ onFinished }) {
  return (
    <div className="landing-page-container">
    <div className="loading-screen">
      <img
        src={logo}
        alt="Jestr Logo"
        className="logo"
        onAnimationEnd={onFinished}
      />
    </div>
    </div>
  );
}

export default LoadingScreen;
