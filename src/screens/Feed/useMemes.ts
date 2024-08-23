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

  const recordMemeViewBatch = useCallback(async () => {
    if (memeViewBatchRef.current.length > 0) {
      try {
        await recordMemeViews(memeViewBatchRef.current);
        memeViewBatchRef.current = []; // Clear the batch after successful recording
      } catch (error) {
        console.error('Failed to record meme view batch:', error);
      }
    }
  }, []);

  const addToMemeViewBatch = useCallback(
    (email: string, memeID: string) => {
      memeViewBatchRef.current.push({email, memeID});
      if (memeViewBatchRef.current.length >= 5) {
        recordMemeViewBatch();
      }
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
      const result = await fetchMemes(null, user.email, 5, accessToken);
      setMemes(result.memes);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0);
      result.memes.forEach(meme => addToMemeViewBatch(user.email, meme.memeID));

      // Update cache with new memes
      await AsyncStorage.setItem('cachedMemes', JSON.stringify(result.memes));
    } catch (error) {
      setError('Failed to fetch memes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, accessToken, addToMemeViewBatch]);

  const fetchMoreMemes = useCallback(async () => {
    if (isLoadingMore || allMemesViewed || !user?.email || !accessToken) return;
    setIsLoadingMore(true);
    try {
      console.log(
        'Fetching more memes with lastEvaluatedKey:',
        lastEvaluatedKey,
      );
      const result = await fetchMemes(
        lastEvaluatedKey,
        user.email,
        5,
        accessToken,
      );
      setMemes(prevMemes => [...prevMemes, ...result.memes]);
      setLastEvaluatedKey(result.lastEvaluatedKey);
      setAllMemesViewed(result.memes.length === 0 || !result.lastEvaluatedKey);
      result.memes.forEach(meme => addToMemeViewBatch(user.email, meme.memeID));
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
    addToMemeViewBatch,
  ]);

  useEffect(() => {
    fetchInitialMemes();
  }, [fetchInitialMemes]);

  useEffect(() => {
    return () => {
      recordMemeViewBatch(); // Ensure any remaining views are recorded when component unmounts
    };
  }, [recordMemeViewBatch]);

  return {
    memes,
    isLoading,
    isLoadingMore,
    error,
    fetchMoreMemes,
    fetchInitialMemes,
  };
};
