import React from 'react';
import './ProfilePanel.css';

const ProfilePanel = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="profile-panel">
      <div className="profile-panel-container">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
        {/* Profile information goes here */}
      </div>
    </div>
  );
};

export default ProfilePanel;