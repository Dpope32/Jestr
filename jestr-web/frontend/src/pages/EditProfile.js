import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EditProfile.css'; // You should create this CSS file for styling
import handleHeaderPicChange from './LandingPage';
import handleProfilePicChange from './LandingPage';
import HeaderPicUpload from './HeaderPicUpload';

const EditProfile = ({ user, onSave, onClose }) => {
  console.log('Rendering EditProfile component');
  const [localUser, setLocalUser] = useState({ ...user });
  const [isDarkMode, setIsDarkMode] = useState(false);


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLocalUser({ ...localUser, [name]: value });
  };

  const handleSaveChanges = () => {
    onSave(localUser);
  };


  return (
   <div className="edit-profile-modal">
  <div className="edit-profile-content">
    <span className="close-button" onClick={onClose}>&times;</span>
    <div className="edit-profile-header">Edit Profile</div>
    <div className="profile-profile-banner">
      {user.headerPic && (
        <img
          src={user.headerPic}
          alt={`${user.username}'s header`}
          className="header-pic"
          onClick={handleHeaderPicChange}
        />
      )}
    </div>
    <div className="edit-section">
      <img
        src={user.profilePic}
        alt={`${user.username}'s profile`}
        className="profile-profile-profile-pic"
        onClick={handleProfilePicChange}
      />
    </div>
    <div className="edit-section-container">
        <div className="edit-section">
        <div className="edit-profile-data">Username: </div><input type="text" name="username" value={localUser.username} onChange={handleInputChange} />
        </div>
        <div className="edit-section">
        <div className="edit-profile-data1">Bio: </div> <input type="text" name="bio" value={localUser.bio} onChange={handleInputChange} />
        </div>
        <div className="edit-section">
        <div className="edit-profile-data2">Display Name: </div><input type="text" name="displayName" value={localUser.displayName} onChange={handleInputChange} />
        </div>
        <span className="save-button" onClick={handleSaveChanges}>Save Changes</span>
      </div>
      </div>
    </div>
  );
};

export default EditProfile;
