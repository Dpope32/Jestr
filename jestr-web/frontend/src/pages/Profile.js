import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css';
import ProfilePanel from '../components/ProfilePanel';
import TopPanel from '../components/TopPanel';
import BottomPanel from '../components/BottomPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faImages, faVideo, faHeart, faShare, faHome, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('memes');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate(-1); // This will go back to the previous page
  };

  const handleAddBioClick = () => {
    setIsEditingBio(true);
  };

  const handleSaveBioClick = async () => {
    try {
      const updatedUser = await updateUserProfile({ email: user.email, bio: newBio });
      if (updatedUser.success) {
        setBio(newBio);
        setIsEditingBio(false);
      } else {
        console.error('Failed to update bio:', updatedUser.message);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Failed to save bio:', error);
      // Optionally show an error message to the user
    }
  };

const updateUserProfile = async () => {
    const userData = {
      operation: 'updateUserProfile',
      email: email,
      username: username,
      displayName: displayName,
      profilePic: previewUrl, // Assuming you have the S3 URL after upload
      bio: bio,
      lastLogin: new Date().toISOString(), // Set the last login time to now
    };

    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('User profile updated:', data);
        toast.success('Profile updated successfully!', { /* toast options */ });
        // Additional actions on successful update
      } else {
        toast.error('Failed to update profile. ' + data.message);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('An error occurred while updating your profile. Please try again.');
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
                <div className="bio-container">
              {!isEditingBio ? (
               <button className="add-bio-button" onClick={handleAddBioClick}>
               <FontAwesomeIcon icon={faPlus} /> Add Bio
             </button>
              ) : (
                <div className="bio-edit-container">
                  <textarea
                    className="bio-input"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Describe yourself here..."
                  />
                  <button className="save-bio-button" onClick={handleSaveBioClick}>
                    Save Bio
                  </button>
                </div>
              )}
              {bio && <div className="bio-display">{bio}</div>}
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-count">{user.followersCount || 0}</span>
                <span className="stat-label"> Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.followingCount || 0}</span>
                <span className="stat-label"> Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.smirksCount || 0}</span>
                <span className="stat-label"> Smirks</span>
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