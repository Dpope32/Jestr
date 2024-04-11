import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

function Comment({ id, text, netLikes, onLike, onDislike }) {
  return (
    <div className="comment">
      <p className="comment-text">{text}</p>
      <div className="comment-reactions">
        <button
          onClick={() => onLike(id)}
          className={`comment-like ${netLikes > 0 ? 'liked' : ''}`}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
        </button>
        <span className="reactions-count">
          {netLikes !== 0 ? (netLikes > 0 ? `+${netLikes}` : netLikes) : ''}
        </span>
        <button
          onClick={() => onDislike(id)}
          className={`comment-dislike ${netLikes < 0 ? 'disliked' : ''}`}
        >
          <FontAwesomeIcon icon={faThumbsDown} />
        </button>
      </div>
    </div>
  );
}

export default Comment;
