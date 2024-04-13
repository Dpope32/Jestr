import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faCog } from '@fortawesome/free-solid-svg-icons';
import './ProfilePanel.css';
import AnonImage from '../assets/images/Jestr4.jpg';

const TopPanel = ({ onProfileClick, profilePicUrl, username }) => {
  return (
    <div className="top-panel">
      <div className="profile-icon" onClick={onProfileClick}>
        {profilePicUrl ? (
          <img src={profilePicUrl} alt={username || 'Profile'} />
        ) : (
          <img src={AnonImage} alt="Anon" />
        )}
      </div>
      <div className="username">{username || 'Anon'}</div>
      <div className="search-settings">
        <FontAwesomeIcon icon={faSearch} />
        <FontAwesomeIcon icon={faCog} />
      </div>
    </div>
  );
};

export default TopPanel;