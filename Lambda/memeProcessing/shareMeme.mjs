// shareMeme.mjs

import { recordShare } from './dbServices.mjs';
import { getMemeShareCountForUser } from './cacheServices.mjs';
import { awardBadge } from './badgeServices.mjs';

/**
 * Function to handle sharing a meme.
 * @param {string} memeID 
 * @param {string} email 
 * @param {string} username 
 * @param {string} catchUser 
 * @param {string} message 
 * @returns {Promise<Object>} - Result of the share operation.
 */
export const shareMeme = async (memeID, email, username, catchUser, message) => {
    console.log("Operation: shareMeme");
    console.log(`Parameters: memeID=${memeID}, email=${email}, username=${username}, catchUser=${catchUser}, message=${message}`);
  
    if (!memeID || !email || !username || !catchUser) {
      console.error("Missing required parameters for shareMeme.");
      throw new Error('MemeID, email, username, and catchUser are required for sharing a meme.');
    }
  
    try {
      const shareType = 'general';
      console.log(`Recording share: memeID=${memeID}, email=${email}, shareType=${shareType}, username=${username}, catchUser=${catchUser}, message=${message}`);
      await recordShare(memeID, email, shareType, username, catchUser, message);
      
      // Check for viralSensation badge
      const shareCount = await getMemeShareCountForUser(email);
      let badgeEarned = null;
      
      if (shareCount >= 25) {
        console.log(`User ${email} has reached ${shareCount} shares. Awarding 'viralSensation' badge.`);
        badgeEarned = await awardBadge(email, 'viralSensation');
      }
      
      return { badgeEarned };
    } catch (error) {
      console.error(`Error sharing meme: ${error}`);
      throw error;
    }
  };