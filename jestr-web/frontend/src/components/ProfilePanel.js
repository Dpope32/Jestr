import React, { useState, useEffect } from 'react';
import './ProfilePanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation, useNavigate } from 'react-router-dom';
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
import Anon1Image from '../assets/images/Jestr5.jpg';

const ProfilePanel = ({
  isVisible,
  onClose,
  profilePicUrl,
  displayName,
  followersCount,
  followingCount,
  onDarkModeToggle = () => {} // Default function if not passed
}) => {
  console.log('profilePicUrl value in ProfilePanel:', profilePicUrl);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const location = useLocation();
  const loggedInUser = location.state?.user;

  useEffect(() => {
    if (loggedInUser) {
      setUsername(loggedInUser.username);
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

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };
  

  const getProfilePic = () => {
    try {
      if (profilePicUrl && profilePicUrl.startsWith('data:image/')) {
        console.log('Profile picture URL:', profilePicUrl);
        return profilePicUrl;
      } else {
        console.error('Profile picture URL is not a valid data URI');
        console.log('Fallback image:', Anon1Image);
        return Anon1Image;
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return Anon1Image;
    }
  };

  const handleSignOut = () => {
    // Sign out logic
    navigate('/'); // Navigate to the root URL (e.g., localhost:3000)
  };

  const closeModal = () => {
    setShowSettingsModal(false);
  };

  return (
    <div className={`profile-panel ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="profile-panel-container">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
        <div className="profile-info">
          <div className="profile-pic-container">
          <img
            src={getProfilePic()}
            alt={username || 'Profile'}
            className="profile-pic"
          />
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
        <FontAwesomeIcon
          icon={faMoon}
          className={`dark-icon ${isDarkMode ? 'active' : ''}`}
          onClick={handleDarkModeClick}
        />


   {/* Settings Modal */}
      {showSettingsModal && (
        <div className="settings-modal-container">
          <div className="settings-modal">
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="settings-close-button" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
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
                <span className="option-label">Set Display Name</span>
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
            <button className="sign-out-button" onClick={handleSignOut}>
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
              Sign Out
            </button>
          </div>
          
        </div>
      )}
    </div>
    </div>
  );
  
};

export default ProfilePanel;