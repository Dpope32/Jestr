// MemePost.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AnonImage from '../assets/images/Jestr4.jpg'; // Default profile image path

const MemePost = ({ mediaSrc, posterProfilePic, posterUsername }) => {
  return (
    <div className="meme-post">
      <div className="meme-poster-info">
        <img src={posterProfilePic || AnonImage} alt="Poster" className="poster-profile-pic" />
        <FontAwesomeIcon icon={faPlus} className="follow-icon" /> {/* Plus icon to follow the user */}
        <span className="poster-username">{posterUsername || 'Anon'}</span>
      </div>
      <img src={mediaSrc} alt="Meme" className="meme-media" />
      {/* Additional meme content */}
    </div>
  );
};

export default MemePost;
