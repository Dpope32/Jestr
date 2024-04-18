import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css';
import ProfilePanel from '../components/ProfilePanel';
import TopPanel from '../components/TopPanel';
import BottomPanel from '../components/BottomPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faImages, faVideo, faHeart, faShare, faHome } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('memes');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate(-1); // This will go back to the previous page
  };

  const updateUserProfile = async ({ username, bio }) => {
    try {
      // API call would go here
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, bio }),
      });
      const data = await response.json();
      if (data.success) {
        setBio(bio);
      } else {
        // Handle failure
      }
    } catch (error) {
      console.error('Failed to update bio', error);
      // Handle error state here
    }
  };

  const updateBio = async (newBio) => {
    try {
      // Replace this with the actual API call or update logic
      const response = await updateUserProfile({ username, bio: newBio });
      if (response.success) {
        setBio(newBio);
      } else {
        // Handle the error, maybe set an error message in state and display it
      }
    } catch (error) {
      console.error('Failed to update bio', error);
      // Set an error state here if needed
    }
  };

  useEffect(() => {
    const loggedInUser = location.state?.user;
    if (loggedInUser) {
      setUser(loggedInUser);
      setProfilePicUrl(loggedInUser.profilePic);
      setUsername(loggedInUser.username);
      setDisplayName(loggedInUser.displayName);
      setBio(loggedInUser.bio);
    }
  }, [location]);

  const handleProfilePanelClose = () => {
    setIsProfilePanelVisible(false);
    console.log('Profile panel closed');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`profile-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <TopPanel onProfileClick={() => setIsProfilePanelVisible(!isProfilePanelVisible)} profilePicUrl={profilePicUrl} username={username} />
      <ProfilePanel
        isVisible={isProfilePanelVisible}
        onClose={handleProfilePanelClose}
        profilePicUrl={profilePicUrl}
        username={username}
        displayName={displayName}
        followersCount="0"
        followingCount="0"
      />
      <div className="profile-container">
        <div className="profile-banner"></div>
        <div className="profile-header">
          <img src={user.profilePic} alt={user.username} className="profile-profile-pic" />
          <div className="profile-profile-info">
          <div className="display-name">{displayName}</div>
          <div className="username1">@{username}</div>
          <div className="bio">{bio || "Jestr bio here..."}</div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-count">{user.followersCount || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.followingCount || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.memesCount || 0}</span>
                <span className="stat-label">Memes</span>
              </div>
            </div>
            <button className="edit-profile-button">
              <FontAwesomeIcon icon={faEdit} /> Edit Profile
            </button>
          </div>
        </div>
        <div className="profile-tabs">
          <div
            className={`tab ${activeTab === 'memes' ? 'active' : ''}`}
            onClick={() => setActiveTab('memes')}
          >
            <FontAwesomeIcon icon={faImages} /> Memes
          </div>
          <div
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <FontAwesomeIcon icon={faVideo} /> Videos
          </div>
          <div
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <FontAwesomeIcon icon={faHeart} /> Favorites
          </div>
          <div
            className={`tab ${activeTab === 'shares' ? 'active' : ''}`}
            onClick={() => setActiveTab('shares')}
          >
            <FontAwesomeIcon icon={faShare} /> Shares
          </div>
        </div>
        <div className="profile-content">
          <div className="profile-tab-content">
            {activeTab === 'memes' && (
              <div className="meme-dashboard">
                <h2>Posted Memes</h2>
                {/* Render user's posted memes */}
              </div>
            )}
            {activeTab === 'videos' && (
              <div className="video-dashboard">
                <h2>Posted Videos</h2>
                {/* Render user's posted videos */}
              </div>
            )}
            {activeTab === 'favorites' && (
              <div className="favorites-dashboard">
                <h2>Favorite Memes & Videos</h2>
                {/* Render user's favorite memes and videos */}
              </div>
            )}
            {activeTab === 'shares' && (
              <div className="shares-dashboard">
                <h2>Shared Memes & Videos</h2>
                {/* Render user's shared memes and videos */}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomPanel onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Profile;