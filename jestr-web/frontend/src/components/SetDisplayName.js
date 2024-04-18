import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { updateDisplayName } from '../utils/s3Util';
import { toast } from 'react-toastify';

const SetDisplayName = ({ user, onClose }) => {
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleUpdateDisplayName = () => {
    if (newDisplayName) {
      const requestBody = {
        operation: 'updateDisplayName',
        email: user.email,
        displayName: newDisplayName,
      };

      updateDisplayName(JSON.stringify(requestBody))
        .then(() => {
          toast.success('Display name updated successfully');
          onClose(true); // Pass `true` to indicate successful update
        })
        .catch(error => {
          console.error('Error updating display name', error);
          toast.error('Failed to update display name');
        });
    }
  };

  return (
    <div className="set-display-name-modal">
      <div className="modal-header">
        <h2>Set Display Name</h2>
        <button className="modal-close-button" onClick={() => onClose(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Enter new display name"
        value={newDisplayName}
        onChange={(e) => setNewDisplayName(e.target.value)}
        className="display-name-input"
      />
      <button onClick={handleUpdateDisplayName}>Update</button>
      <p className="warning-text">This can only be done once!</p>
    </div>
  );
};

export default SetDisplayName;