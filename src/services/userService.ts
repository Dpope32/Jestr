import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {Alert} from 'react-native';
import {API_URL, API_ENDPOINT} from './config';
import Toast from 'react-native-toast-message';
import {User, Meme, FetchMemesResult} from '../types/types';
import {FeedbackItem} from '../types/types';
import * as FileSystem from 'expo-file-system';
import {useUserStore, UserState, isEmptyUserState} from '../stores/userStore';
import * as SecureStore from 'expo-secure-store';
import {getUserMemes} from './memeService';



export const getUser = async (userEmail: string): Promise<User | null> => {
  console.log('getUser called with userEmail:', userEmail);
  try {
    const requestBody = JSON.stringify({
      operation: 'getUser',
      identifier: userEmail, // Changed from 'email' to 'identifier'
    });

    console.log('Sending request to getUser API with body:', requestBody);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    const responseText = await response.text();
    console.log('Received response from getUser API:', responseText);

    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, body: ${responseText}`,
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    if (!data || !data.data || !data.data.email) {
      console.error('Invalid or incomplete user data received:', data);
      throw new Error('Invalid or incomplete user data received');
    }
    console.log('Processed user data:', data.data);
    return data.data || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

//adjusted to use the user store details if available, otherwise fetch from API, Singificantly reduces API calls and speeds up load times
export const fetchUserDetails = async (
  identifier: string,
  token?: string,
): Promise<UserState> => {
  // Get the current user state from the store
  const currentUserState = useUserStore.getState();

  // Check if the current user state is not empty and matches the identifier
  if (
    !isEmptyUserState(currentUserState) &&
    (currentUserState.email === identifier ||
      currentUserState.userId === identifier)
  ) {
    console.log('Using user details from store');
    return currentUserState;
  }

  console.log('Fetching user details from API for identifier:', identifier);

  const requestBody = {
    operation: 'getUser',
    identifier: identifier,
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }

    const data = await response.json();

    if (!data.data) {
      throw new Error('No user data returned from server');
    }

    // Update the user store with the new data
    useUserStore.getState().setUserDetails(data.data);

    return data.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};


export const updateProfileImage = async (
  email: string,
  imageType: 'profile' | 'header',
  imagePath: string,
) => {
  try {
    const imageBase64 = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`Sending request to update ${imageType} image...`);

    const profileData = {
      operation: 'updateProfileImage',
      email,
      imageType,
      image: imageBase64,
    };

    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateProfileImage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    const data = await response.json();
    console.log(
      `${imageType} image update response:`,
      JSON.stringify(data, null, 2),
    );

    // Update Zustand store with new image URL
    useUserStore.getState().setUserDetails({
      [imageType + 'Pic']: data.data[imageType + 'Pic'],
    });

    console.log("Updated profilePic in Zustand:", useUserStore.getState().profilePic);

    return data;
  } catch (error) {
    console.error(`Error updating ${imageType} image:`, error);
    throw error;
  }
};


export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getAllUsers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({operation: 'getAllUsers'}),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Invalid JSON response');
    }

    console.log('Parsed data:', data);

    if (!data.data || !data.data.users || !Array.isArray(data.data.users)) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure');
    }

    return data.data.users.map((user: any) => ({
      email: user.email || '',
      username: user.username || '',
      profilePic: user.profilePic || '',
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const updateBio = async (
  userEmail: string,
  bio: string,
  onBioUpdate: (bio: string) => void,
  setIsEditing: (isEditing: boolean) => void,
) => {
  const requestBody = {
    operation: 'updateBio',
    email: userEmail,
    bio: bio,
  };

  try {
    const response = await fetch(
      'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/updateBio',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    const responseData = await response.json();

    if (response.ok) {
      if (
        responseData.data &&
        responseData.data.data &&
        responseData.data.data.updatedBio
      ) {
        onBioUpdate(responseData.data.data.updatedBio);
        setIsEditing(false);

        Toast.show({
          type: 'success',
          text1: 'Bio updated successfully!',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          props: {backgroundColor: '#333', textColor: '#00ff00'},
        });
      } else {
        console.error('Unexpected response structure:', responseData);
      }
    } else {
      console.error('Failed to update bio. Server response:', responseData);
    }
  } catch (error) {
    console.error('Error updating bio:', error);
  }
};

export const updateUserProfile = async (updatedFields: Partial<User>): Promise<User> => {
  try {
    console.log('Sending request to update user profile:', updatedFields);
    
    const response = await fetch(`${API_URL}/updateUserProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'updateUserProfile',
        ...updatedFields,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.status} ${responseText}`);
    }

    const updatedUser = JSON.parse(responseText);
    console.log('Parsed updated user:', updatedUser);

    if (updatedFields.newEmail) {
      Alert.alert(
        'Email Update',
        'Your email update request has been submitted. Please check your new email for a verification link.'
      );
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getTotalUsers = async (): Promise<number> => {
  const response = await fetch(
    'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getTotalUsers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to get total users');
  }

  const data = await response.json();
  return data.totalUsers;
};

export const getUserGrowthRate = async (): Promise<number> => {
  const response = await fetch(
    'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getUserGrowthRate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to get user growth rate');
  }

  const data = await response.json();
  return data.growthRate;
};

export const getDAU = async (): Promise<number> => {
  const response = await fetch(
    'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getDAU',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to get DAU');
  }

  const data = await response.json();
  return data.dau;
};

export const fetchMemes = async (
  email: string,
  type: 'liked' | 'viewed' | 'downloaded',
  lastEvaluatedKey: string | null = null,
  limit: number = 5,
): Promise<FetchMemesResult> => {
  // console.log(`Fetching ${type} memes for user: ${email}`);
  try {
    let endpoint;
    let operation;
    switch (type) {
      case 'liked':
        endpoint = '/fetchLikedMemes';
        operation = 'fetchLikedMemes';
        break;
      case 'downloaded':
        endpoint = '/fetchDownloadedMemes';
        operation = 'fetchDownloadedMemes';
        break;
      case 'viewed':
        endpoint = '/fetchViewHistory';
        operation = 'fetchViewHistory';
        break;
      default:
        throw new Error('Invalid type specified');
    }

    const requestBody = {
      operation,
      email,
      lastEvaluatedKey,
      limit,
    };

    //  console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${type} memes. Status: ${response.status}`,
      );
    }

    const responseData = await response.json();
    console.log('Raw API response:', JSON.stringify(responseData));

    // Check for the nested data structure
    const data =
      responseData.data && responseData.data.data
        ? responseData.data.data
        : responseData.data;

    if (!data || !Array.isArray(data.memes)) {
      console.error('Invalid data structure received:', responseData);
      return {memes: [], lastEvaluatedKey: null};
    }

    const memes: Meme[] = data.memes.map((item: any) => ({
      memeID: item.MemeID || '',
      url: item.MemeURL || '',
      caption: item.Caption || '',
      uploadTimestamp: item.UploadTimestamp || item.Timestamp || '',
      likeCount: item.LikeCount || 0,
      downloadCount: item.DownloadsCount || 0,
      commentCount: item.CommentCount || 0,
      shareCount: item.ShareCount || 0,
      username: item.Username || '',
      profilePicUrl: item.ProfilePicUrl || '',
      email: item.Email || item.email || '',
      liked: item.Liked || false,
      doubleLiked: item.DoubleLiked || false,
      memeUser: {
        email: item.Email || item.email || '',
        username: item.Username || '',
        profilePic: item.ProfilePicUrl || '',
      },
    }));

    console.log(`Processed ${memes.length} memes`);

    return {
      memes,
      lastEvaluatedKey: data.lastEvaluatedKey || null,
    };
  } catch (error) {
    console.error(`Error fetching ${type} memes:`, error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

export const fetchTabMemes = async (
  tab: 'posts' | 'liked' | 'history' | 'downloaded',
  page: number = 1,
  pageSize: number = 30,
  userEmail: string,
  lastEvaluatedKey: string | null,
): Promise<FetchMemesResult> => {
  try {
    let result: FetchMemesResult;
    switch (tab) {
      case 'posts':
        result = await getUserMemes(userEmail);
        break;
      case 'liked':
        result = await fetchMemes(
          userEmail,
          'liked',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      case 'history':
        result = await fetchMemes(
          userEmail,
          'viewed',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      case 'downloaded':
        result = await fetchMemes(
          userEmail,
          'downloaded',
          lastEvaluatedKey,
          pageSize,
        );
        break;
      default:
        result = {memes: [], lastEvaluatedKey: null};
    }
    console.log(`Fetched ${result.memes.length} memes for ${tab} tab`);
    return result;
  } catch (error) {
    console.error(`Error fetching ${tab} memes:`, error);
    return {memes: [], lastEvaluatedKey: null};
  }
};

//HELPER FUNCTIONS

export const submitFeedback = async (
  email: string,
  message: string,
  status: string = 'Feedback',
) => {
  try {
    const response = await fetch(`${API_URL}/submitFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'submitFeedback',
        email,
        message,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    throw error;
  }
};

export const updateFeedback = async (feedbackId: string, status: string) => {
  try {
    const response = await fetch(`${API_URL}/updateFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'updateFeedback',
        feedbackId,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    throw error;
  }
};

export const getFeedback = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/getFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'getFeedback',
        email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getFeedback:', error);
    throw error;
  }
};

export const getAllFeedback = async (): Promise<FeedbackItem[]> => {
  try {
    const response = await fetch(`https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getAllFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation: 'getAllFeedback' }),
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch feedback. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched Data:', data);

    if (!data || !data.data) {
      throw new Error('Invalid data format returned from API');
    }

    // Filter out feedback items with status "Closed"
    const filteredFeedback = data.data.filter((item: FeedbackItem) => item.Status !== 'Closed');

    console.log('Filtered Feedback:', filteredFeedback);
    return filteredFeedback;
  } catch (error) {
    console.error('Error in getAllFeedback:', error);
    throw error;
  }
};