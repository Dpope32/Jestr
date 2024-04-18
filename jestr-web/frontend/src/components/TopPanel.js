import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import './ProfilePanel.css';
import Anon1Image from '../assets/images/db/Jestr5.jpg';

const TopPanel = ({ onProfileClick, profilePicUrl, username }) => {
  return (
    <div className="top-panel">
      <div className="profile-icon" onClick={onProfileClick}>
        {profilePicUrl ? (
          <img src={profilePicUrl} alt={username || 'Profile'} />
        ) : (
          <img src={Anon1Image} alt="Anon" />
        )}
      </div>
    </div>
  );
};

export default TopPanel;