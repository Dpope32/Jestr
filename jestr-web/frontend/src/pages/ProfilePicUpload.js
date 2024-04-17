import React, { useState } from 'react';

const ProfilePicUpload = ({ onProfilePicChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleProfilePicChange = (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
  
    if (file) {
      console.log('Selected file:', file);
  
      // Validate file type
      if (['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setPreviewUrl(URL.createObjectURL(file));
        onProfilePicChange(file); // Call the parent's onProfilePicChange callback with the file
      } else {
        alert('Only JPG, PNG, and GIF files are allowed.');
        input.value = ''; // Reset the file input
        setPreviewUrl(null);
        onProfilePicChange(null);
      }
    } else {
      console.log('No file selected');
      setPreviewUrl(null);
      onProfilePicChange(null); // Call the parent's onProfilePicChange callback with null
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