// TopPanel.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faCog } from '@fortawesome/free-solid-svg-icons';

const TopPanel = ({ onProfileClick }) => {
  return (
    <div className="top-panel">
      <div className="profile-icon" onClick={onProfileClick}>
        <FontAwesomeIcon icon={faUser} />
      </div>
      <div className="search-settings">
        <FontAwesomeIcon icon={faSearch} />
        <FontAwesomeIcon icon={faCog} />
      </div>
    </div>
  );
};

export default TopPanel;
