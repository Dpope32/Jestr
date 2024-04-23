import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css';
import ProfilePanel from '../components/ProfilePanel';
import TopPanel from '../components/TopPanel';
import BottomPanel from '../components/BottomPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faBox, faImages, faVideo, faHeart, faShare, faHome, faPlus } from '@fortawesome/free-solid-svg-icons';
import HeaderPicUpload from './HeaderPicUpload';
import { uploadToS3, getFromS3 } from '../utils/s3Util';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditProfile from './EditProfile';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfilePanelVisible, setIsProfilePanelVisible] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [headerPicUrl, setHeaderPicUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [username, setUsername] = useState('');
  const [headerPic, setHeaderPic] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('memes');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = location.state?.user;
    if (loggedInUser) {
      setUser(loggedInUser);
      setCreationDate(formatDate(loggedInUser.creationDate) || ''); // Update this line
      setProfilePicUrl(loggedInUser.profilePic);
      setUsername(loggedInUser.username);
      setDisplayName(loggedInUser.displayName);
      setBio(loggedInUser.bio || '');
      setHeaderPicUrl(loggedInUser.headerPic || '');
      console.log('Logged in user from location state:', loggedInUser);
    }
  }, [location]);

  useEffect(() => {
    console.log("Received user state on feed page:", location.state.user);
    // Set local state or context if needed
  }, [location.state.user]);

// When the modal is opened or closed, this effect will run
useEffect(() => {
  if (isEditProfileVisible) {
    document.body.classList.add('dimmed');
  } else {
    document.body.classList.remove('dimmed');
  }

  // Clean up function to remove 'dimmed' when the component unmounts
  return () => document.body.classList.remove('dimmed');
}, [isEditProfileVisible]);



  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
  
    const date = new Date(dateString);
    
    const getOrdinalNum = (n) => {
      return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
    };
  
    const day = getOrdinalNum(date.getDate());
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
  
    return `${month} ${day} ${year}`; // Formats the date as "Month dayth year"
  };

  const handleHomeClick = () => {
    navigate(-1); 
  };

  const handleAddBioClick = () => {
    setIsEditingBio(true);
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateUserProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'updateUserProfile',
          email: userData.email,
          username: username,
          displayName: displayName,
          profilePic: previewUrl,
          bio: userData.bio,
          headerPic: userData.headerPic, // Include the headerPic URL
          lastLogin: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log("Received response from API:", data); // Log the response data

      if (response.ok) {
        console.log('User profile updated:', data);
        toast.success('Profile updated successfully!');
        return data;
      } else {
        console.error('Failed to update profile:', data);
        toast.error('Failed to update profile. ' + data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('An error occurred while updating your profile. Please try again.');
      return { success: false, message: error.toString() };
    }
  };

  const handleSaveBioClick = async () => {
    console.log("Attempting to save new bio:", newBio); // Log the new bio being saved
    const userData = {
      email: user.email, // make sure user.email is defined
      bio: newBio,
      operation: 'updateUserProfile',
      username: username,
      displayName: displayName,
      profilePic: previewUrl,
      lastLogin: new Date().toISOString(), // make sure newBio is defined and has the value from input
    };
    try {
      const updatedUser = await updateUserProfile(userData);
      console.log("Received updatedUser object:", updatedUser);
  
      // Check the response's 'ok' status instead of a non-existent 'success' property
      if (updatedUser.message === 'User profile updated successfully.') {
        console.log("Bio update successful");
        setUser({ ...user, bio: newBio }); // Update the user state with the new bio
        setBio(newBio); // Update the bio state as well
        setIsEditingBio(false);
        toast.success('Bio updated successfully!');
      } else {
        // Handle the case where the API message is not as expected
        console.error('Failed to update bio:', updatedUser.message);
        toast.error('Failed to update bio.');
      }
    } catch (error) {
      console.error('Failed to save bio:', error);
      toast.error('An error occurred while updating your profile. Please try again.');
    }
  };

  const handleProfilePanelClose = () => {
    setIsProfilePanelVisible(false);
    console.log('Profile panel closed');
    setIsEditProfileVisible(false);
    document.querySelector('.profile-page').classList.remove('dimmed');
  };

  const handleEditProfileClick = () => {
    console.log('Edit Profile button clicked');
    setIsEditProfileVisible(true);
    document.querySelector('.profile-page').classList.add('dimmed');
  };

  const bioContent = !bio || bio.trim() === '' ? (
    <button className="add-bio-button" onClick={handleAddBioClick}>
      <FontAwesomeIcon icon={faPlus} /> Add Bio
    </button>
  ) : (
    <div className="bio-display">{bio}</div>
  );
  
  const bioEditor = isEditingBio ? (
    <div className="bio-editor">
      <textarea
        className="bio-textarea"
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
        placeholder="Enter your bio here..."
      />
      <div className="editor-buttons">
        <button className="save-bio-button" onClick={handleSaveBioClick}>Save Bio</button>
        <button className="cancel-bio-button" onClick={() => setIsEditingBio(false)}>Cancel</button>
      </div>
    </div>
  ) : null;
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
<div className={`profile-page ${isDarkMode ? 'dark-mode' : ''} ${isEditProfileVisible ? 'dimmed' : ''}`}>
      <TopPanel
        onProfileClick={() => setIsProfilePanelVisible(!isProfilePanelVisible)}
        profilePicUrl={profilePicUrl}
        username={username}
      />
      <ProfilePanel
        isVisible={isProfilePanelVisible}
        onClose={handleProfilePanelClose}
        profilePicUrl={profilePicUrl}
        username={username}
        displayName={displayName}
        followersCount="0"
        followingCount="0"
      />
          {isEditProfileVisible && (
      <EditProfile
        user={user}
        onSave={(updatedUser) => {
          setIsEditProfileVisible(false); // Close the modal after saving
        }}
        onClose={() => setIsEditProfileVisible(false)}
      />
    )}
      <div className="profile-container">
        <div className="profile-banner">
          {user.headerPic && <img src={user.headerPic} alt={user.username} className="header-pic" />}
        </div>
        <div className="profile-header">
          <div className="profile-info-container">
            <div className="display-name">{displayName}</div>
            <div className="username1">@{username}</div>
            <div className="bio-container">
      {isEditingBio ? bioEditor : bioContent}
    </div>
    <div className="created-container">
  Jestr Since:
  <div className="date-date">{creationDate || 'Account creation date not available'}</div>
</div>

            <div className="stat-container">
              <div className="stat-item">
                <span className="stat-count">{user.followersCount || 0}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.followingCount || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat-item">
                <span className="stat-count">{user.smirksCount || 0}</span>
                <span className="stat-label">Smirks</span>
              </div>
            </div>
          </div>
          <img src={user.profilePic} alt={user.username} className="profile-profile-pic" />
        </div>
                      <div className="profile-tabs">
                        <div
                          className={`tab ${activeTab === 'memes-tab' ? 'active' : ''}`}
                          onClick={() => setActiveTab('memes')}>
                          <FontAwesomeIcon icon={faImages} /> Memes
                        </div>
                        <div
                          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
                          onClick={() => setActiveTab('videos')}>
                          <FontAwesomeIcon icon={faVideo} /> Videos
                        </div>
                        <div
                          className={`tab ${activeTab === 'storage' ? 'active' : ''}`}
                          onClick={() => setActiveTab('storage')}>
                          <FontAwesomeIcon icon={faBox} /> Storage
                      </div>
                      <div
                        className={`tab edit-profile-tab ${activeTab === 'edit' ? 'active' : ''}`}
                        onClick={() => setIsEditProfileVisible(true)}> {/* This line has changed */}
                        <FontAwesomeIcon icon={faEdit} /> Edit Profile
                    </div>
                    </div>
                      <div className="profile-content">
                        <div className="profile-tab-content">
                          {activeTab === 'memes' && (
                            <div className="meme-dashboard">
                              <h2>~~~ Posted Memes ~~~</h2>
                              {/* Render user's posted memes */}
                            </div>
                          )}
                          {activeTab === 'videos' && (
                            <div className="video-dashboard">
                              <h2>Posted Videos</h2>
                              {/* Render user's posted videos */}
                            </div>
                          )}
                          {activeTab === 'storage' && (
                                  <div className="storage-dashboard">
                                      {/* Content for storage */}
                                  </div>
                              )}
          {activeTab === 'edit' && (
            <div className="edit-profile-dashboard">
                  {/* Content for edit profile */}
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