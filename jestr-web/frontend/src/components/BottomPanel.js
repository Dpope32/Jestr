// BottomPanel.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './BottomPanel.css';

const BottomPanel = () => {
  return (
    <div className="bottom-panel">
      <FontAwesomeIcon icon={faHome} />
      <FontAwesomeIcon icon={faPlus} />
      <FontAwesomeIcon icon={faEnvelope} />
    </div>
  );
};

export default BottomPanel;
