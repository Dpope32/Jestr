import { API_URL } from './config';
import { Badge } from '../screens/AppNav/Badges/Badges.types';

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
