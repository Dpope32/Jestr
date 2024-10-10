import { API_URL } from './config';
import { Badge } from '../screens/AppNav/Badges/Badges.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateMemeReaction = () => {
    const queryClient = useQueryClient();
  
    return useMutation<{ badgeEarned: Badge | null }, Error, {
      memeID: string;
      incrementLikes: boolean;
      doubleLike: boolean;
      incrementDownloads: boolean;
      email: string;
    }>({
      mutationFn: async ({
        memeID,
        incrementLikes,
        doubleLike,
        incrementDownloads,
        email,
      }) => {
        const response = await fetch(`${API_URL}/updateMemeReaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'updateMemeReaction',
            memeID,
            incrementLikes,
            doubleLike,
            incrementDownloads,
            email,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update meme reaction');
        }
  
        return response.json();
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['meme', variables.memeID] });
      },
    });
  };
  

export const useShareMeme = () => {
  const queryClient = useQueryClient();

  return useMutation<{ badgeEarned: Badge | null }, Error, {
    memeID: string;
    email: string;
    username: string;
    catchUser: string;
    message: string;
  }>({
    mutationFn: async ({
      memeID,
      email,
      username,
      catchUser,
      message,
    }) => {
      const response = await fetch(`${API_URL}/shareMeme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'shareMeme',
          memeID,
          email,
          username,
          catchUser,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share meme');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meme', variables.memeID] });
    },
  });
};

/**
 * Function to update meme reaction.
 * @param {string} memeID 
 * @param {boolean} incrementLikes 
 * @param {boolean} doubleLike 
 * @param {boolean} incrementDownloads 
 * @param {string} email 
 * @returns {Promise<{ badgeEarned: Badge | null }>}
 */
export const updateMemeReaction = async (
  memeID: string,
  incrementLikes: boolean,
  doubleLike: boolean,
  incrementDownloads: boolean,
  email: string,
): Promise<{ badgeEarned: Badge | null }> => {
  const requestBody = {
    operation: 'updateMemeReaction',
    memeID,
    doubleLike,
    incrementLikes,
    incrementDownloads,
    email,
  };

  console.log('Sending updateMemeReaction request with body:', requestBody);

  try {
    const response = await fetch(`${API_URL}/updateMemeReaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('Received response:', response);
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Failed to update meme reaction:', data.message);
      throw new Error(data.message || 'Failed to update meme reaction');
    }

    return { badgeEarned: data.data.badgeEarned };
  } catch (error: any) {
    console.error('Error in updateMemeReaction:', error);
    throw new Error(error.message || 'Failed to update meme reaction');
  }
};