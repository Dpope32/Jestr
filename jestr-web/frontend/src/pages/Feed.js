import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import './Feed.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faShare, faPlus } from '@fortawesome/free-solid-svg-icons';
import CommentFeed from '../components/CommentFeed';
import Comment from '../components/Comment';
import  '../components/CommentFeed.css';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import ProfileIcon from '../components/ProfileIcon';
import ProfilePanel from '../components/ProfilePanel';
import TopPanel from '../components/TopPanel';
import BottomPanel from '../components/BottomPanel';
import AnonImage from '../assets/images/Jestr4.jpg'; 
import { getFromS3 } from '../utils/s3Util';
import MemePost from '../components/MemePost';
import Anon1Image from '../assets/images/Jestr5.jpg';



const LOAD_MORE_THRESHOLD = 300; 

function importAll(r) {
  return r.keys().map(r);
}

const images = importAll(require.context('../assets/images/', false, /\.jpg$/));
const videos = importAll(require.context('../assets/videos/', false, /\.mp4$/));
const media = [...images, ...videos];

const initialLikeDislikeCounts = media.reduce((acc, _, index) => {
  acc[index] = 0; // Start every meme with a count of 0
  return acc;
}, {});

const Feed = () => {
  const [initLoadComplete, setInitLoadComplete] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const location = useLocation();
  const loggedInUser = location.state?.user;
  const [viewedIndices, setViewedIndices] = useState(new Set());
  const [navHistory, setNavHistory] = useState([]);
  const [endOfList, setEndOfList] = useState(false);
  const [username, setUsername] = useState('');
  const [likedIndices, setLikedIndices] = useState(new Set());
  const [displayName, setDisplayName] = useState('');
  const [savedPosts, setSavedPosts] = useState([]);
  const [posterProfilePic, setposterProfilePic] = useState([]); 
  const [posterUsername, setposterUsername] = useState([]); 
  const [dislikedIndices, setDislikedIndices] = useState(new Set());
  const [shuffledMedia, setShuffledMedia] = useState([]);
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isCommentFeedVisible, setIsCommentFeedVisible] = useState(false);
  const toggleCommentFeed = () => {
    setIsCommentFeedVisible(!isCommentFeedVisible);
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [likeDislikeCounts, setLikeDislikeCounts] = useState(() => {
  const savedCounts = JSON.parse(localStorage.getItem('likeDislikeCounts'));
    // Merge saved counts with the initial zero counts to fill any gaps
    return { ...initialLikeDislikeCounts, ...savedCounts };
  });
  
    // Ensure likeDislikeCounts is saved to localStorage when it changes
    useEffect(() => {
      localStorage.setItem('likeDislikeCounts', JSON.stringify(likeDislikeCounts));
    }, [likeDislikeCounts]);

  // Shuffle media and reset state on component mount
  useEffect(() => {
    setShuffledMedia(media.sort(() => Math.random() - 0.5));
    setViewedIndices(new Set([0])); // Start with the first item as viewed
  }, []);
  
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        setUsername('Anon');
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername('Anon');
      }
    };
    
    const getProfilePic = () => {
      if (profilePicUrl) {
        if (profilePicUrl.startsWith('data:image')) {
          // If it's a base64-encoded URL, return it directly
          return profilePicUrl;
        } else {
          // If it's a regular URL, return it as is
          return profilePicUrl;
        }
      } else {
        console.log('Profile picture URL not available');
        return Anon1Image; // Return a default profile picture URL
      }
    };
    
  
    if (loggedInUser) {
      setUsername(loggedInUser.username || ''); // Use the username property if available
      fetchUsername();
      getProfilePic();
      setDisplayName(loggedInUser.displayName || 'Display Name');
    }
  }, [loggedInUser]);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        if (loggedInUser && loggedInUser.email) {
          const key = `${loggedInUser.email}-profilePic.jpg`;
          const objectURL = await getFromS3(key);
          setProfilePicUrl(objectURL); // use the state setter function here
        } else {
          console.log('Logged-in user email not available');
          setProfilePicUrl(Anon1Image); // Set to a default profile picture URL
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setProfilePicUrl(Anon1Image); // Fallback to default image
      }
    };
  
    fetchProfilePicture();
  }, [loggedInUser]); 
  
  

  useEffect(() => {
    const shuffledMediaArray = media.sort(() => Math.random() - 0.5);
    setShuffledMedia(shuffledMediaArray);
    setViewedIndices(new Set());
    setEndOfList(false);
    setCurrentMediaIndex(0);
  }, []);

  const goToNextMedia = () => {

    let nextIndex;
    if (navHistory.length < shuffledMedia.length) {
      do {
        nextIndex = Math.floor(Math.random() * shuffledMedia.length);
      } while (navHistory.includes(nextIndex));
      setNavHistory(prev => [...prev, nextIndex]); // Add to history if not at the end
    } else {
      console.log('End of media list reached, cycle through viewed media.');
      setEndOfList(true);
      // Optionally cycle to the first or any specific media
      return;
    }

    setCurrentMediaIndex(nextIndex);
  };

const handleSave = (index) => {
  setSavedPosts((prevSavedPosts) => {
    // Check if the post is already saved
    if (prevSavedPosts.includes(index)) {
      // If it's already saved, remove it from the savedPosts array
      return prevSavedPosts.filter((postId) => postId !== index);
    } else {
      // If it's not saved, add it to the savedPosts array
      return [...prevSavedPosts, index];
    }
  });

  // Placeholder for future profile integration
  console.log(`Post ${index} saved status toggled.`);
};

  const handleIntersection = useCallback(
    (entries, observer) => {
        if (!initLoadComplete) return; // Ignore intersection events if initial load flag is not set

        entries.forEach((entry) => {
            if (entry.isIntersecting && viewedIndices.size < media.length - 1) {
                goToNextMedia();
            }
        });
    },
    [goToNextMedia, viewedIndices, media.length, initLoadComplete]
);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `0px 0px ${LOAD_MORE_THRESHOLD}px 0px`,
      threshold: 0,
    });

    const lastMediaElement = document.querySelector('.card:last-child');
    if (lastMediaElement) observer.observe(lastMediaElement);

    return () => {
      if (lastMediaElement) observer.unobserve(lastMediaElement);
    };
  }, [handleIntersection]);

  const goToPrevMedia = () => {
    if (navHistory.length <= 1) { // If at the beginning or only one item in history
      return; // Prevent going back further, or handle as desired
    }

    // Remove the last item from history and go to the previous item
    const newHistory = navHistory.slice(0, -1);
    setNavHistory(newHistory);
    setCurrentMediaIndex(newHistory[newHistory.length - 1]);

    if (endOfList) setEndOfList(false); // Reset endOfList if we can navigate back
  };

  const handleProfilePanelClose = () => {
    setIsProfilePanelVisible(false);
    console.log('Profile panel closed');
  };

  // Resetting navHistory on shuffle or component mount
  useEffect(() => {
    setNavHistory([0]); // Initialize with the first media index or as per your logic
    setEndOfList(false);
    setCurrentMediaIndex(0); // Start from the first media
  }, [shuffledMedia]); // Depend on shuffledMedia so it resets when media is shuffled

  const fade = useSpring({ from: { opacity: 0 }, to: { opacity: 1 } });

  const MediaElement = shuffledMedia[currentMediaIndex]?.endsWith('.mp4') ? (
    <video
      key={currentMediaIndex}
      controls
      autoPlay
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    >
      <source src={shuffledMedia[currentMediaIndex]} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  ) : (
    <img
      key={currentMediaIndex}
      src={shuffledMedia[currentMediaIndex]}
      alt={`Media ${currentMediaIndex}`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );

  const handleLike = (index) => {
    // Make sure to use a temporary variable if you're going to reassign it
    setLikeDislikeCounts((prevCounts) => {
      const currentCount = prevCounts[index] || 0;
      let newCount = likedIndices.has(index) ? currentCount - 1 : currentCount + 1;
      
      if (dislikedIndices.has(index)) {
        newCount += 1; // Adjusting because one dislike will be removed
      }
  
      // Now let's update the sets
      const newLikedIndices = new Set(likedIndices);
      const newDislikedIndices = new Set(dislikedIndices);
  
      if (likedIndices.has(index)) {
        newLikedIndices.delete(index);
      } else {
        newLikedIndices.add(index);
        newDislikedIndices.delete(index);
      }
  
      setLikedIndices(newLikedIndices);
      setDislikedIndices(newDislikedIndices);
  
      return { ...prevCounts, [index]: newCount };
    });
  };
  
  const handleDislike = (index) => {
    // Same concept for handleDislike
    setLikeDislikeCounts((prevCounts) => {
      const currentCount = prevCounts[index] || 0;
      let newCount = dislikedIndices.has(index) ? currentCount + 1 : currentCount - 1;
      
      if (likedIndices.has(index)) {
        newCount -= 1; // Adjusting because one like will be removed
      }
  
      // Update the sets
      const newLikedIndices = new Set(likedIndices);
      const newDislikedIndices = new Set(dislikedIndices);
  
      if (dislikedIndices.has(index)) {
        newDislikedIndices.delete(index);
      } else {
        newDislikedIndices.add(index);
        newLikedIndices.delete(index);
      }
  
      setLikedIndices(newLikedIndices);
      setDislikedIndices(newDislikedIndices);
  
      return { ...prevCounts, [index]: newCount };
    });
  };

  useEffect(() => {
    console.log('User data in state:', { username, displayName, profilePicUrl });
  }, [username, displayName, profilePicUrl]);
  
  
  return (
    <div className={`feed-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <TopPanel onProfileClick={() => setIsProfilePanelVisible(!isProfilePanelVisible)} profilePicUrl={profilePicUrl} username={username} />
      <div className="meme-poster-info">
  <FontAwesomeIcon icon={faPlus} className="follow-icon" />
  <img src={profilePicUrl || AnonImage} alt="Poster" className="poster-profile-pic" />
  <span className="poster-username">{username || 'Anon'}</span>
</div>
<ProfilePanel
  isVisible={isProfilePanelVisible}
  onClose={handleProfilePanelClose}
  profilePicUrl={profilePicUrl}
  username={username}
  displayName={displayName}
  followersCount="0"
  followingCount="0"
  onDarkModeToggle={handleDarkModeToggle}
/>
    <animated.div style={fade} className="card">
        <button onClick={goToPrevMedia} className="prev">&#x3c;</button>
          {MediaElement}
          <button onClick={goToNextMedia} className="next">&#x3e;</button>
          <div className="caption">Caption goes here...</div>
            <div className="buttons">
              <button
                className={`like ${likedIndices.has(currentMediaIndex) ? 'liked' : ''}`}
                onClick={() => handleLike(currentMediaIndex)}>
                <FontAwesomeIcon icon={faThumbsUp} />
                    </button>
                    <span className="like-counter">
                      {
                        // Check if both likes and dislikes are numbers before subtracting
                        (typeof likeDislikeCounts[currentMediaIndex] === 'number')
                          ? likeDislikeCounts[currentMediaIndex]
                          : 0
                      }</span>
                  <button
                className={`dislike ${dislikedIndices.has(currentMediaIndex) ? 'disliked' : ''}`}
                onClick={() => handleDislike(currentMediaIndex)}>
                <FontAwesomeIcon icon={faThumbsDown} />
              </button>
              <button className="comment" onClick={toggleCommentFeed}>
                  <FontAwesomeIcon icon={faComment} />
                </button>
                <button className="share">
                  <FontAwesomeIcon icon={faShare} />
                </button>
                <BottomPanel />
          </div>
          </animated.div>
      {isCommentFeedVisible && (
          <div className="modal-background" onClick={() => setIsCommentFeedVisible(false)}>
          <div className="comment-modal" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks from closing the modal */}
            <button className="close-modal" onClick={() => setIsCommentFeedVisible(false)}>X</button>
            <CommentFeed mediaIndex={currentMediaIndex} />
          </div>
        </div>
      )}
{loggedInUser && (
  <ProfilePanel
    isVisible={isProfilePanelVisible}
    onClose={handleProfilePanelClose}
    profilePicUrl={profilePicUrl}
    username={username}
  />
)}
    </div>
);
      }

export default Feed;

