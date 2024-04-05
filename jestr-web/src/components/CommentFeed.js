import React, { useState, useEffect, useRef } from 'react';
import Comment from './Comment';
import './CommentFeed.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';


function CommentFeed({ mediaIndex }) {
  const [comments, setComments] = useState(() => {
    const savedComments = JSON.parse(localStorage.getItem('comments')) || {};
    return savedComments[mediaIndex] || [];
  });

  const [newCommentText, setNewCommentText] = useState('');

  const prevCommentsRef = useRef(comments);

  useEffect(() => {
    // Save comments to local storage only when they have changed
    if (JSON.stringify(prevCommentsRef.current) !== JSON.stringify(comments)) {
      const savedComments = JSON.parse(localStorage.getItem('comments')) || {};
      savedComments[mediaIndex] = comments;
      localStorage.setItem('comments', JSON.stringify(savedComments));
      prevCommentsRef.current = comments;
    }
  }, [comments, mediaIndex]);

  const addComment = () => {
    if (newCommentText.trim()) {
      const updatedComments = [
        ...comments,
        { id: comments.length, text: newCommentText, likes: 0 },
      ];
      setComments(updatedComments);
      setNewCommentText('');
    }
  };

  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const handleDislike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes - 1 }
          : comment
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
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            id={comment.id}
            text={comment.text}
            netLikes={comment.likes - (comment.dislikes || 0)}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentFeed;