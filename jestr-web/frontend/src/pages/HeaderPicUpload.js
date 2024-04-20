import React, { useState, useRef } from 'react';

const ProfilePicUpload = ({ onProfilePicChange }) => {
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (/^image\//.test(file.type)) {
        setProfilePreviewUrl(URL.createObjectURL(file));
        onProfilePicChange(file); // Pass the file object directly
        setErrorMessage('');
      } else {
        setErrorMessage('Only image files are allowed.');
        e.target.value = '';
        setProfilePreviewUrl(null);
        onProfilePicChange(null);
      }
    } else {
      setErrorMessage('No file selected.');
      setProfilePreviewUrl(null);
      onProfilePicChange(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="profile-pic-upload" onClick={triggerFileInput}>
      {profilePreviewUrl ? (
        <div className="profile-preview">
          <img src={profilePreviewUrl} alt="Profile Preview" />
        </div>
      ) : (
        <span className="profile-pic-label">Click here to upload a profile picture</span>
      )}
      <input
        id="profilePicInput"
        type="file"
        accept="image/*"
        onChange={handleProfilePicChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default ProfilePicUpload;