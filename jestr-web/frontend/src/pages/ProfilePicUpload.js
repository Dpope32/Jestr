import React, { useState } from 'react';

const ProfilePicUpload = ({ onProfilePicChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleProfilePicChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        onProfilePicChange(file); // Call the parent's onProfilePicChange callback with the file
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      onProfilePicChange(null); // Call the parent's onProfilePicChange callback with null
    }
  };

// ProfilePicUpload.js
const handleFileChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    onProfilePicChange(file); // Pass the File object to the parent's callback
  } else {
    setPreviewUrl(null);
    onProfilePicChange(null); // Pass null to the parent's callback
  }
};

  return (
    <div className="profile-pic-btn">
      {previewUrl ? (
        <img src={previewUrl} alt="Profile Preview" />
      ) : (
        <label htmlFor="profilePicInput" style={{ cursor: 'pointer' }}>
          <span className="plus-icon">+</span>
        </label>
      )}
      <input
        id="profilePicInput"
        type="file"
        accept="image/*"
        onChange={handleProfilePicChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProfilePicUpload;