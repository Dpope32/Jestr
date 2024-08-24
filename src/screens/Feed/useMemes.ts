import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchMemes, getLikeStatus } from '../../components/Meme/memeService';
import { recordMemeViews } from '../../services/authFunctions';
import { Meme, User } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMemes = (user: User | null, accessToken: string | null) => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
  const [allMemesViewed, setAllMemesViewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const memeViewBatchRef = useRef<{email: string; memeID: string}[]>([]);
  const lastRecordTimeRef = useRef(0);

  const recordMemeViewBatch = useCallback(async () => {
    const now = Date.now();
    // Send the batch if there are at least 5 views
    if (memeViewBatchRef.current.length >= 5) {
        try {
            await recordMemeViews(memeViewBatchRef.current);
            console.log('Batched meme views sent:', memeViewBatchRef.current);
            memeViewBatchRef.current = []; // Clear the batch after successful recording
            lastRecordTimeRef.current = now;
        } catch (error) {
            console.error('Failed to record meme view batch:', error);
        }
    }
}, []);

const addToMemeViewBatch = useCallback(
  (email: string, memeID: string) => {
      // Prevent duplicates in the current batch
      if (!memeViewBatchRef.current.some(item => item.email === email && item.memeID === memeID)) {
          memeViewBatchRef.current.push({email, memeID});
          console.log('Added to meme view batch:', {email, memeID});
      }
      // Attempt to record the batch if conditions are met within this function
      recordMemeViewBatch();
  },
  [recordMemeViewBatch],
);
  const fetchInitialMemes = useCallback(async () => {
    if (!user?.email || !accessToken) return;
    setIsLoading(true);
    try {
      // First, try to load cached memes
      const cachedMemesString = await AsyncStorage.getItem('cachedMemes');
      if (cachedMemesString) {
        const cachedMemes = JSON.parse(cachedMemesString);
        setMemes(cachedMemes);
      }
  
      // Then fetch fresh memes
      const result = await fetchMemes(null, user.email, 20, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0);
      // Remove this line:
      // result.memes.forEach(meme => addToMemeViewBatch(user.email, meme.memeID));
  
      // Update cache with new memes
      await AsyncStorage.setItem('cachedMemes', JSON.stringify(result.memes));
    } catch (error) {
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, accessToken]);
  
  const fetchMoreMemes = useCallback(async () => {
    if (isLoadingMore || allMemesViewed || !user?.email || !accessToken) return;
    setIsLoadingMore(true);
    try {
      console.log(
        'Fetching more memes with lastEvaluatedKey:',
        lastEvaluatedKey,
      );
      const result = await fetchMemes(lastEvaluatedKey, user.email, 20, accessToken);
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
      // Remove this line:
      // result.memes.forEach(meme => addToMemeViewBatch(user.email, meme.memeID));
      console.log('Fetched more memes:', result.memes.length);
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    allMemesViewed,
    user,
    accessToken,
    lastEvaluatedKey,
  ]);


  useEffect(() => {
    fetchInitialMemes();
    const intervalId = setInterval(recordMemeViewBatch, 30000);
    return () => {
      clearInterval(intervalId);
      recordMemeViewBatch(); // Ensure any remaining views are recorded when component unmounts
    };
  }, [fetchInitialMemes, recordMemeViewBatch]);

  return {
    memes,
    isLoading,
    isLoadingMore,
    error,
    fetchMoreMemes,
    fetchInitialMemes,
    addToMemeViewBatch,
  };
};
