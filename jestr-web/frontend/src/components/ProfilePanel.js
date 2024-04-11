// ProfilePanel.js
import React from 'react';

const ProfilePanel = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="profile-panel">
      {/* Profile information goes here */}
    </div>
  );
};

export default ProfilePanel;