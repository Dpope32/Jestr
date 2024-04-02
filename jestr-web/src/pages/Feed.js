import React, { useState, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import './Feed.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

// Function to import all files matching a context
function importAll(r) {
  return r.keys().map(r);
}

// Importing images and videos
const images = importAll(require.context('../assets/images/', false, /\.jpg$/));
const videos = importAll(require.context('../assets/videos/', false, /\.mp4$/));

// Combine and shuffle images and videos into a single array
const media = [...images, ...videos].sort(() => Math.random() - 0.5);

const Feed = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [viewedIndices, setViewedIndices] = useState(new Set());
  const [endOfList, setEndOfList] = useState(false); // This hook should be inside the component

  // Function to select the next media item
  const goToNextMedia = () => {
    let nextIndex;
    if (viewedIndices.size >= media.length - 1) {
      setEndOfList(true);
      return; // Prevent further action if we've reached the end
    }
    
    do {
      nextIndex = Math.floor(Math.random() * media.length);
    } while (viewedIndices.has(nextIndex));

    setViewedIndices(new Set([...viewedIndices, nextIndex]));
    setCurrentMediaIndex(nextIndex);
  };

  // Function to select the previous media item
  const goToPrevMedia = () => {
    setCurrentMediaIndex(prevIndex => prevIndex === 0 ? media.length - 1 : prevIndex - 1);
  };

  // Spring animation for media transition
  const fade = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  // Component for displaying media (image or video)
  const MediaElement = media[currentMediaIndex]?.endsWith('.mp4') ? (
    <video key={currentMediaIndex} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }}>
      <source src={media[currentMediaIndex]} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  ) : (
    <img key={currentMediaIndex} src={media[currentMediaIndex]} alt={`Media ${currentMediaIndex}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
  );

  return (
    <div className="feed-container">
      <animated.div style={fade} className="card">
        <button onClick={goToPrevMedia} className="prev">&#x3c;</button>
        {MediaElement}
        <button onClick={goToNextMedia} className="next">&#x3e;</button>
        {endOfList && <div className="end-of-list">End of list, touch grass</div>}
        <div className="buttons">
          <button className="like">
            <FontAwesomeIcon icon={faThumbsUp} />
          </button>
          <button className="dislike">
            <FontAwesomeIcon icon={faThumbsDown} />
          </button>
          <button className="comment">
            <FontAwesomeIcon icon={faComment} />
          </button>
          <button className="share">
            <FontAwesomeIcon icon={faShare} />
          </button>
        </div>
      </animated.div>
    </div>
  );
};

export default Feed;
