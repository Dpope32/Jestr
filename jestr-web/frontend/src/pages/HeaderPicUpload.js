import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const HeaderPicUpload = ({ onHeaderPicChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const HeaderPicVariants = {
    initial: { x: 0 },
    moved: { x: '0%', transition: { duration: 0.5 } },
  };

  const handleHeaderPicChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      if (/^image\//.test(file.type)) {
        setPreviewUrl(URL.createObjectURL(file));
        onHeaderPicChange(file); // Pass the file object directly
        setErrorMessage('');
      } else {
        setErrorMessage('Only image files are allowed.');
        e.target.value = ''; // Reset the file input
        setPreviewUrl(null);
        onHeaderPicChange(null);
      }
    } else {
      console.log('No file selected');
      setPreviewUrl(null);
      onHeaderPicChange(null);
      setErrorMessage('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <motion.div
      className={`header-pic-upload ${previewUrl ? 'header-pic-preview' : ''}`}
      variants={HeaderPicVariants}
      onClick={triggerFileInput}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="header-preview" />
      ) : (
        <span className="header-pic-label">Click here to upload a header</span>
      )}
      <input
        id="headerPicInput"
        type="file"
        accept="image/*"
        onChange={handleHeaderPicChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </motion.div>
  );
};

export default HeaderPicUpload;