import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './BottomPanel.css';

const BottomPanel = ({ onHomeClick }) => {
  return (
    <div className="bottom-panel">
      <FontAwesomeIcon icon={faHome} onClick={onHomeClick} />
      <FontAwesomeIcon icon={faPlus} />
      <FontAwesomeIcon icon={faEnvelope} />
    </div>
  );
};

export default BottomPanel;