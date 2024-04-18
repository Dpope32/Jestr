// LoadingScreen.js
import React from 'react';
import './LoadingScreen.css';
import logo from '../assets/images/db/JestrLogo.jpg';

function LoadingScreen({ onFinished }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen-overlay"></div>
      <img src={logo} alt="Jestr Logo" className="logo" onAnimationEnd={onFinished} />
    </div>
  );
}

export default LoadingScreen;