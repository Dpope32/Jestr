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
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('memes');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = location.state?.user;
    if (loggedInUser) {
      setUser(loggedInUser);
      setCreationDate(loggedInUser.creationDate);
      setProfilePicUrl(loggedInUser.profilePic);
      setUsername(loggedInUser.username);
      setDisplayName(loggedInUser.displayName);
      setBio(loggedInUser.bio);
      setHeaderPicUrl(loggedInUser.headerPic); 
      console.log('Logged in user from location state:', loggedInUser);
    }
  }, [location]);

  // Profile.js
  const handleHeaderPicChange = async (file) => {
    if (file) {
      try {
        console.log('Starting upload to S3...');
        const fileUrl = await uploadToS3(file, `header-${Date.now()}.jpg`);
      console.log(`File uploaded successfully: ${fileUrl}`);
      setHeaderPicUrl(fileUrl);
      
      // Clear the preview URL
      setPreviewUrl(null);
      
      // Display a toast success message
      toast.success('Header picture updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

        console.log('Preparing to send update profile request...');
        const updateProfilePayload = {
          operation: 'updateUserProfile',
          email: user.email,
          headerPic: fileUrl,
          username: user.username,
          displayName: user.displayName,
        };
        console.log('Payload for update profile:', updateProfilePayload);
  
        const response = await fetch('https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateUserProfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateProfilePayload),
        });
  
        console.log('Response received', response);
        if (response.ok) {
          const data = await response.json();
          console.log('Profile update successful:', data);
          if (data && data.user && data.user.headerPic) {
            const newHeaderPicUrl = data.user.headerPic;
            setHeaderPicUrl(newHeaderPicUrl);
            toast.success('Header picture updated successfully!');
          } else {
            console.error('Unexpected response structure:', data);
            // Handle unexpected response structure
          }
        } else {
          console.error('Response status was not OK.', response.status);
          response.text().then(text => console.log('Error response body:', text));
          throw new Error('Failed to update header picture');
        }
      } catch (error) {
        console.error('Failed to update header picture:', error);
        toast.error('An error occurred while updating your header picture. Please try again.');
      }
    } else {
      console.log('No file was provided for the header picture update.');
    }
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
  };

  const bioContent = isEditingBio ? (
    // Show bio edit form
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
) : bio ? (
  <div className="bio-display">{bio}</div> // Bio should display here
) : (
  <button className="add-bio-button" onClick={handleAddBioClick}>
    <FontAwesomeIcon icon={faPlus} /> Click to Add Bio
  </button>
);

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
      <div className="profile-banner">
  <img src={headerPicUrl} alt="" className="header-pic" />
  <HeaderPicUpload onHeaderPicChange={handleHeaderPicChange} />
</div>
        <div className="profile-header">
          <img src={user.profilePic} alt={user.username} className="profile-profile-pic" />
          <div className="profile-profile-info">
            <div className="display-name">{displayName}</div>
              <div className="username1">@{username}</div>
              <div className="created-container">Jestr Since:<div className="date-date"> {user.creationDate}  
                    </div>
                      </div>
                <div className="bio-container">{bioContent}</div>
                         <div className="stat-container">
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
                      </div>
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
                            onClick={() => setActiveTab('edit')}>
                            <FontAwesomeIcon icon={faEdit} /> Edit Profile
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