import React, { useState } from 'react';
import './ProfilePanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHistory, faBox, faCog, faMoon, faHeart, faBell } from '@fortawesome/free-solid-svg-icons';
import Anon1Image from '../assets/images/Jestr5.jpg';

const ProfilePanel = ({ isVisible, onClose, profilePicUrl, username, displayName, followersCount, followingCount, onDarkModeToggle }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  if (!isVisible) return null;

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleStorageClick = () => {
    console.log('Storage clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleDarkModeClick = () => {
    setIsDarkMode(!isDarkMode);
    onDarkModeToggle();
  };

  const handleFavoritesClick = () => {
    console.log('Favorites clicked');
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };

  return (
    <div className={`profile-panel ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="profile-panel-container">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
        <div className="profile-info">
          <div className="profile-pic-container">
            <img src={profilePicUrl || Anon1Image} alt={username || 'Profile'} className="profile-pic" />
          </div>
          <h3 className="display-name">{displayName || 'Display Name'}</h3>
          <p className="username">{username || 'Username'}</p>
          <div className="follow-info">
            <span>{followersCount || 0} Followers</span>
            <span>{followingCount || 0} Following</span>
          </div>
        </div>
        <div className="icon-section">
          <button className="icon-button" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span>Profile</span>
          </button>
          <button className="icon-button" onClick={handleNotificationsClick}>
            <FontAwesomeIcon icon={faBell} className="icon" />
            <span>Notifications</span>
          </button>
          <button className="icon-button" onClick={handleStorageClick}>
            <FontAwesomeIcon icon={faBox} className="icon" />
            <span>Storage</span>
          </button>
          <button className="icon-button" onClick={handleFavoritesClick}>
            <FontAwesomeIcon icon={faHistory} className="icon" />
            <span>History</span>
          </button>
          <button className="icon-button" onClick={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} className="icon" />
            <span>Settings</span>
          </button>
        </div>
        <FontAwesomeIcon icon={faMoon} className={`dark-icon ${isDarkMode ? 'active' : ''}`} onClick={handleDarkModeClick} />
      </div>
    </div>
  );
};

export default ProfilePanel;