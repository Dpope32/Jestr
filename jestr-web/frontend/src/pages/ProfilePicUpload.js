import React, { useState } from 'react';

const ProfilePicUpload = ({ onProfilePicChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProfilePicChange = (e) => {
    const input = e.target;
    const file = input.files && input.files[0];

    if (file) {
      console.log('Selected file:', file);

      // Validate file type
      if (file.type === 'image/jpeg') {
        setPreviewUrl(URL.createObjectURL(file));
        onProfilePicChange(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Only JPEG files are allowed.');
        input.value = ''; // Reset the file input
        setPreviewUrl(null);
        onProfilePicChange(null);
      }
    } else {
      console.log('No file selected');
      setPreviewUrl(null);
      onProfilePicChange(null);
      setErrorMessage('');
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
        accept="image/jpeg"
        onChange={handleProfilePicChange}
        style={{ display: 'none' }}
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default ProfilePicUpload;