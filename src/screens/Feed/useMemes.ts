// Implemented this to reduce server load and accurately log when memes are viewed by adding them 
//to a batch and sending entire batch at the end of the swiping when user closes app. 
import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchMemes, getLikeStatus } from '../../components/Meme/memeService';
import { recordMemeViews } from '../../services/authFunctions';
import { Meme, User } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_VIEWED_MEME_KEY = 'lastViewedMemeId';

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
    if (memeViewBatchRef.current.length >= 5) {
      try {
        await recordMemeViews(memeViewBatchRef.current);
        console.log('Batched meme views sent:', memeViewBatchRef.current);
        memeViewBatchRef.current = [];
        lastRecordTimeRef.current = now;
      } catch (error) {
        console.error('Failed to record meme view batch:', error);
      }
    }
  }, []);

  const addToMemeViewBatch = useCallback(
    (email: string, memeID: string) => {
      if (!memeViewBatchRef.current.some(item => item.email === email && item.memeID === memeID)) {
        memeViewBatchRef.current.push({email, memeID});
        console.log('Added to meme view batch:', {email, memeID});
      }
      recordMemeViewBatch();
    },
    [recordMemeViewBatch],
  );

  const setLastViewedMeme = async (memeId: string) => {
    try {
      await AsyncStorage.setItem(LAST_VIEWED_MEME_KEY, memeId);
    } catch (e) {
      console.error('Failed to save last viewed meme ID', e);
    }
  };

  const getLastViewedMeme = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(LAST_VIEWED_MEME_KEY);
    } catch (e) {
      console.error('Failed to get last viewed meme ID', e);
      return null;
    }
  };

  const fetchInitialMemes = useCallback(async () => {
    if (!user?.email || !accessToken) return;
    setIsLoading(true);
    try {
      const lastViewedMemeId = await getLastViewedMeme();
      const result = await fetchMemes(lastViewedMemeId, user.email, 10, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0);
      
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
      console.log('Fetching more memes with lastEvaluatedKey:', lastEvaluatedKey);
      const result = await fetchMemes(lastEvaluatedKey, user.email, 10, accessToken);
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
      console.log('Fetched more memes:', result.memes.length);
    } catch (error) {
      console.error('Error fetching more memes:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, allMemesViewed, user, accessToken, lastEvaluatedKey]);

  useEffect(() => {
    fetchInitialMemes();
    const intervalId = setInterval(recordMemeViewBatch, 30000);
    return () => {
      clearInterval(intervalId);
      recordMemeViewBatch();
    };
  }, [fetchInitialMemes, recordMemeViewBatch]);

  const handleMemeViewed = useCallback((memeId: string) => {
    setLastViewedMeme(memeId);
    if (user?.email) {
      addToMemeViewBatch(user.email, memeId);
    }
  }, [user, addToMemeViewBatch]);

  return {
    memes,
    isLoading,
    isLoadingMore,
    error,
    fetchMoreMemes,
    fetchInitialMemes,
    handleMemeViewed,
  };
};