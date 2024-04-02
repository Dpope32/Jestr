// CommentFeed.js
import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import './CommentFeed.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'; // Make sure this import is added

function CommentFeed({ mediaIndex }) {
  // Initialize comments from localStorage
  const [comments, setComments] = useState(() => {
    const savedComments = JSON.parse(localStorage.getItem('comments')) || {};
    return savedComments[mediaIndex] || [];
  });

  // Sort comments here
  const sortedComments = comments.slice().sort((a, b) => b.likes - a.likes);

  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    // Save comments to local storage whenever they change
    const savedComments = JSON.parse(localStorage.getItem('comments')) || {};
    savedComments[mediaIndex] = comments;
    localStorage.setItem('comments', JSON.stringify(savedComments));
  }, [comments, mediaIndex]);

  const addComment = () => {
    if (newCommentText.trim()) {
      const updatedComments = [
        ...comments,
        {
          id: comments.length,
          text: newCommentText,
          likes: 0, // Initial likes set to 0
        },
      ];
      setComments(updatedComments);
      setNewCommentText('');
    }
  };

  // Function to handle like and dislike
  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
  };
  
  const handleDislike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes - 1 } : comment
      )
    );
  };

  const formatLikes = (likes) => {
    if (likes > 0) {
      return `+${likes}`;
    } else if (likes < 0) {
      return `${likes}`;
    } else {
      return likes;
    }
  };
  

  return (
    <div className="comment-feed">
      <div className="new-comment-form">
        <input
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="new-comment-input" 
        />
        <button onClick={addComment} className="add-comment-button">
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      </div>
      <div className="comments-list">
        {sortedComments.map((comment) => (
          <Comment 
            key={comment.id}
            id={comment.id}
            text={comment.text}
            netLikes={comment.likes - (comment.dislikes || 0)} // Calculate net likes here
            onLike={handleLike}
            onDislike={handleDislike}
            // Pass the rest of required props
          />
        ))}
      </div>
    </div>
  );
}

export default CommentFeed;
