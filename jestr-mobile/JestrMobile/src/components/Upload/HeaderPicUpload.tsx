import React, { useState, useRef } from 'react';

interface HeaderPicUploadProps {
  onHeaderPicChange: (file: File | null) => void;
}

const HeaderPicUpload = ({ onHeaderPicChange }: HeaderPicUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleHeaderPicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      console.log('Selected file:', file);
      if (/^image\//.test(file.type)) {
        setPreviewUrl(URL.createObjectURL(file));
        onHeaderPicChange(file);
        setErrorMessage('');
      } else {
        setErrorMessage('Only image files are allowed.');
        (e.target as HTMLInputElement).value = '';
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`header-pic-upload ${previewUrl ? 'header-pic-preview' : ''}`} onClick={triggerFileInput}>
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
    </div>
  );
};

export default HeaderPicUpload;