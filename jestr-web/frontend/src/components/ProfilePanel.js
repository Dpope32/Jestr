import React, { useState, useEffect } from 'react';
import './ProfilePanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateDisplayName } from '../utils/s3Util';
import SetDisplayName from './SetDisplayName';
import Anon1Image from '../assets/images/db/Jestr5.jpg';

import {
  faUser,
  faHistory,
  faBox,
  faCog,
  faMoon,
  faTimes,
  faHeart,
  faBell,
  faSignOutAlt,
  faLock,
  faUserShield,
  faBell as faBellSolid,
  faPalette,
  faEdit,
  faAd,
} from '@fortawesome/free-solid-svg-icons';


const ProfilePanel = ({
  isVisible,
  onClose,
  profilePicUrl,
  followersCount,
  followingCount,
  onDarkModeToggle = () => {} // Default function if not passed
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showDisplayNameForm, setShowDisplayNameForm] = useState(false);
  const [showDisplayNameWarning, setShowDisplayNameWarning] = useState(false);
  const location = useLocation();
  const loggedInUser = location.state?.user;
  

  useEffect(() => {
    console.log('Logged in user from location state:', loggedInUser);
    if (loggedInUser) {
      setUsername(loggedInUser.username);
      setDisplayName(loggedInUser.displayName);
      console.log('Updated states:', loggedInUser.username, loggedInUser.displayName);
    }
  }, [loggedInUser]);

  if (!isVisible) return null;

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleStorageClick = () => {
    console.log('Storage clicked');
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleDarkModeClick = () => {
    console.log('onDarkModeToggle is: ', onDarkModeToggle);
    setIsDarkMode(!isDarkMode);
    onDarkModeToggle();
  };

  const handleFavoritesClick = () => {
    console.log('Favorites clicked');
  };

  const handleDisplayNameClick = () => {
    setShowDisplayNameForm(true);
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };
  
  const getProfilePic = () => {
    if (profilePicUrl) {
      if (profilePicUrl.startsWith('data:image')) {
        return profilePicUrl;
      } else {
        return profilePicUrl;
      }
    } else {
      console.log('Profile picture URL not available');
      return Anon1Image;
    }
  };

  const handleSignOut = () => {
    navigate('/'); // Navigate to the root URL (e.g., localhost:3000)
  };


  const closeModal = () => {
    setShowSettingsModal(false);
    setShowDisplayNameForm(false);
    setShowDisplayNameWarning(false);
  };


  return (
    <div className={`profile-panel ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="profile-panel-container">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
        <div className="profile-info">
          <div className="profile-pic-container">
            <img src={getProfilePic()} alt={username || 'Profile'} className="profile-pic" />
          </div>
          <div className="user-info">
            <div className="info-container">
              <span className="info-label">Display Name</span>
              <h3 className="info-value">{displayName || 'Anon'}</h3>
            </div>
            <div className="info-container">
              <span className="info-label">Username</span>
              <p className="info-value"> @{username || 'Username'}</p>
            </div>
            <div className="info-container follow-container">
              <span className="follow-count">{followersCount || 0} Followers</span>
              <span className="follow-count">{followingCount || 0} Following</span>
            </div>
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
        <button className="icon-button signout-icon" onClick={handleSignOut}>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
        </button>
        <FontAwesomeIcon
          icon={faMoon}
          className={`dark-icon ${isDarkMode ? 'active' : ''}`}
          onClick={handleDarkModeClick}
        />
        {showSettingsModal && (
          <div className="settings-modal-container">
            <div className="settings-modal">
              <div className="modal-header">
                <h2>Settings</h2>
                <button className="settings-close-button" onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              {showDisplayNameForm ? (
                <SetDisplayName user={loggedInUser} onClose={(updated) => {
                  setShowDisplayNameForm(false);
                  setShowSettingsModal(!updated); // Optionally toggle settings modal based on update status
                }} />
              ) : (
                <div className="modal-options">
                  <div className="option-item">
                    <FontAwesomeIcon icon={faUserShield} className="option-icon" />
                    <span className="option-label">Privacy</span>
                  </div>
                  <div className="option-item">
                    <FontAwesomeIcon icon={faBellSolid} className="option-icon" />
                    <span className="option-label">Notifications</span>
                  </div>
                  <div className="option-item">
                    <FontAwesomeIcon icon={faPalette} className="option-icon" />
                    <span className="option-label">Content Preferences</span>
                  </div>
                  <div className="option-item">
                    <FontAwesomeIcon icon={faEdit} className="option-icon" />
                    <span className="option-label" onClick={handleDisplayNameClick}>Set Display Name</span>
                  </div>
                  <div className="option-item">
                    <FontAwesomeIcon icon={faLock} className="option-icon" />
                    <span className="option-label">Change Password</span>
                  </div>
                  <div className="option-item">
                    <FontAwesomeIcon icon={faAd} className="option-icon" />
                    <span className="option-label">Ad Preferences</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  
  export default ProfilePanel;


